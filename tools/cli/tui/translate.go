package tui

import (
	"bufio"
	"errors"
	"fmt"
	"image/color"
	"io"
	"strings"
	"sync"
	"syscall"

	"charm.land/bubbles/v2/progress"
	tea "charm.land/bubbletea/v2"
	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"

	"novusedge/site-cli/actions"
)

const logLines = 6

type translateLineMsg struct {
	ev actions.TranslateEvent
}

type translateExitMsg struct{ err error }

type stopAnswerMsg struct{ yes bool }

// translateRun is a running translate script. Output and the exit status
// arrive in order on ch: the exit message is sent only after both pipes hit
// EOF, so no line is lost behind it.
type translateRun struct {
	pid int
	ch  chan tea.Msg
}

func startTranslate(p actions.Paths) (*translateRun, error) {
	cmd := actions.TranslateCmd(p)
	// npm runs the script in a child; a separate process group lets kill reach
	// node as well, which is the process that spends API credit.
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return nil, err
	}
	if err := cmd.Start(); err != nil {
		return nil, err
	}
	r := &translateRun{pid: cmd.Process.Pid, ch: make(chan tea.Msg)}
	var wg sync.WaitGroup
	pump := func(rd io.Reader) {
		defer wg.Done()
		sc := bufio.NewScanner(rd)
		for sc.Scan() {
			r.ch <- translateLineMsg{actions.ParseTranslateLine(strings.TrimRight(sc.Text(), "\r"))}
		}
	}
	wg.Add(2)
	go pump(stdout)
	go pump(stderr)
	go func() {
		wg.Wait()
		r.ch <- translateExitMsg{cmd.Wait()}
	}()
	return r, nil
}

func (r *translateRun) next() tea.Cmd {
	return func() tea.Msg { return <-r.ch }
}

func (r *translateRun) kill() { _ = syscall.Kill(-r.pid, syscall.SIGTERM) }

// translateOverlay is the progress screen. It nests its own "Stop?" confirm
// because the root holds a single overlay slot and the run must keep
// receiving output while the question is open.
type translateOverlay struct {
	st     styles
	bg     color.Color
	run    *translateRun
	finish func(status string, err error) tea.Cmd

	bar         progress.Model
	total, done int
	label       string
	nothing     bool
	log         []string

	exited   bool
	exitErr  error
	stopping bool
	stop     *formOverlay
	w        int
}

func (a *App) translate() tea.Cmd {
	if !a.tr.loaded || a.tr.err != nil {
		a.setStatus("translation status unavailable", true)
		return nil
	}
	n := len(a.tr.stale)
	if n == 0 {
		a.setStatus("no stale posts to translate", false)
		return nil
	}
	a.overlay = newConfirm(
		fmt.Sprintf("Translate %d stale post(s)? This calls the Gemini API.", n),
		a.bg, a.startTranslation)
	return a.overlay.Init()
}

// startTranslation spawns the script and swaps the confirm for the progress
// screen. It runs inside the confirm's submit command, not on the update loop,
// so it only reads root fields that never change after startup.
func (a *App) startTranslation() tea.Cmd {
	run, err := startTranslate(a.paths)
	if err != nil {
		return func() tea.Msg { return writeDoneMsg{err: fmt.Errorf("starting translation: %w", err)} }
	}
	o := &translateOverlay{
		st:    a.st,
		bg:    a.bg,
		run:   run,
		bar:   progress.New(progress.WithWidth(40)),
		label: "starting...",
		finish: func(status string, err error) tea.Cmd {
			return tea.Batch(
				func() tea.Msg { return writeDoneMsg{status: status, err: err} },
				a.checkTranslations(),
			)
		},
	}
	return func() tea.Msg { return overlayDoneMsg{next: o} }
}

func (o *translateOverlay) Init() tea.Cmd { return o.run.next() }

func (o *translateOverlay) SetSize(w, h int) {
	o.w = w
	o.bar.SetWidth(max(w, 20))
	if o.stop != nil {
		o.stop.SetSize(w, h)
	}
}

func (o *translateOverlay) hint() string {
	if o.exited {
		return "press any key to close"
	}
	return "esc stop"
}

func (o *translateOverlay) Update(msg tea.Msg) (overlay, tea.Cmd) {
	switch msg := msg.(type) {
	case translateLineMsg:
		o.line(msg.ev)
		return o, o.run.next()
	case translateExitMsg:
		return o, o.exit(msg.err)
	}
	if o.stop != nil {
		if m, ok := msg.(stopAnswerMsg); ok {
			o.stop = nil
			if m.yes && !o.exited {
				o.stopping = true
				o.run.kill()
			}
			return o, nil
		}
		var cmd tea.Cmd
		var s overlay
		s, cmd = o.stop.Update(msg)
		o.stop = s.(*formOverlay)
		return o, cmd
	}
	if k, ok := msg.(tea.KeyPressMsg); ok {
		switch {
		case o.exited:
			return o, o.close("", o.failure())
		case k.String() == "esc" || k.String() == "ctrl+c":
			if !o.stopping {
				return o, o.askStop()
			}
		}
	}
	return o, nil
}

func (o *translateOverlay) askStop() tea.Cmd {
	var yes bool
	f := newFormOverlay(huh.NewForm(huh.NewGroup(
		huh.NewConfirm().Title("Stop translation?").Affirmative("Stop").Negative("Keep going").Value(&yes),
	)), o.bg, nil)
	f.form.SubmitCmd = func() tea.Msg { return stopAnswerMsg{yes} }
	f.cancel = func() tea.Msg { return stopAnswerMsg{false} }
	f.SetSize(o.w, 6)
	o.stop = f
	return f.Init()
}

func (o *translateOverlay) line(ev actions.TranslateEvent) {
	switch ev.Kind {
	case actions.TranslateTotal:
		o.total = ev.Total
		o.label = fmt.Sprintf("0/%d", o.total)
		return
	case actions.TranslateWrote:
		o.done++
		o.label = fmt.Sprintf("%d/%d · %s (%s)", o.done, o.total, ev.Slug, ev.Locale)
		return
	case actions.TranslateNothing:
		o.nothing = true
	}
	if strings.TrimSpace(ev.Line) == "" {
		return
	}
	o.log = append(o.log, ev.Line)
	if len(o.log) > logLines {
		o.log = o.log[len(o.log)-logLines:]
	}
}

func (o *translateOverlay) failure() error {
	if o.exitErr == nil {
		return nil
	}
	return fmt.Errorf("translation failed: %w", o.exitErr)
}

func (o *translateOverlay) exit(err error) tea.Cmd {
	switch {
	case o.stopping:
		return o.close("", errors.New("translation stopped"))
	case err == nil && o.nothing:
		return o.close("nothing to translate", nil)
	case err == nil:
		return o.close(fmt.Sprintf("translated %d file(s)", o.done), nil)
	}
	o.exited, o.exitErr = true, err
	o.stop = nil
	return nil
}

func (o *translateOverlay) close(status string, err error) tea.Cmd {
	return func() tea.Msg { return overlayDoneMsg{cmd: o.finish(status, err)} }
}

func (o *translateOverlay) View() string {
	pct := 0.0
	if o.total > 0 {
		pct = float64(o.done) / float64(o.total)
	}
	lines := []string{o.st.title.Render("Translating"), "", o.bar.ViewAs(pct), o.label, ""}
	clip := lipgloss.NewStyle().MaxWidth(max(o.w, 20))
	for _, l := range o.log {
		lines = append(lines, clip.Render(o.st.muted.Render(l)))
	}
	if o.exited {
		lines = append(lines, "", o.st.err.Render(o.failure().Error()))
	}
	if o.stop != nil {
		lines = append(lines, "", o.stop.View())
	}
	return strings.Join(lines, "\n")
}
