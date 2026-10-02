package tui

import (
	"image/color"

	tea "charm.land/bubbletea/v2"
	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"
)

// overlay is a modal child owned by the root. While one is set it receives
// every message, and the root gives it the full body area through SetSize.
// It closes itself by returning overlayDoneMsg.
type overlay interface {
	Init() tea.Cmd
	Update(tea.Msg) (overlay, tea.Cmd)
	View() string
	SetSize(w, h int)
}

// overlayDoneMsg closes the current overlay and runs cmd, which is nil when
// the overlay was cancelled. A non-nil next replaces the overlay instead of
// leaving none, which is how a form chains into a confirm or a follow-up form.
type overlayDoneMsg struct {
	cmd  tea.Cmd
	next overlay
}

// formOverlay hosts a huh form. onSubmit runs after the form completes, so
// it can read the values bound to the form's fields, and returns the command
// that performs the work.
type formOverlay struct {
	form    *huh.Form
	started bool
	// after runs once per Update, so a form can derive one field from another.
	after func()
	// cancel runs on esc or ctrl+c. The keys are taken here and never reach
	// the form: huh's quit marks the form finished for good and its View then
	// renders empty, so a form could not be resumed after a discard prompt.
	cancel tea.Cmd
}

// newFormOverlay wires submit to overlayDoneMsg and cancel to a plain close.
// bg is the terminal background the root last saw; huh reads it from a
// BackgroundColorMsg and otherwise assumes a dark terminal.
func newFormOverlay(form *huh.Form, bg color.Color, onSubmit func() tea.Cmd) *formOverlay {
	form.WithShowHelp(false)
	form.SubmitCmd = func() tea.Msg { return overlayDoneMsg{cmd: onSubmit()} }
	form.Update(tea.BackgroundColorMsg{Color: bg})
	return &formOverlay{form: form, cancel: func() tea.Msg { return overlayDoneMsg{} }}
}

// Init is a no-op when the overlay is resumed after a discard prompt: running
// the form's Init again would reset its focus.
func (f *formOverlay) Init() tea.Cmd {
	if f.started {
		return nil
	}
	f.started = true
	return f.form.Init()
}

func (f *formOverlay) Update(msg tea.Msg) (overlay, tea.Cmd) {
	if k, ok := msg.(tea.KeyPressMsg); ok && (k.String() == "esc" || k.String() == "ctrl+c") {
		return f, f.cancel
	}
	_, cmd := f.form.Update(msg)
	if f.after != nil {
		f.after()
	}
	return f, cmd
}

// guard makes esc ask "Discard changes?" while dirty reports true.
func (f *formOverlay) guard(bg color.Color, dirty func() bool) *formOverlay {
	f.cancel = func() tea.Msg {
		if !dirty() {
			return overlayDoneMsg{}
		}
		return overlayDoneMsg{next: newDiscard(bg, f)}
	}
	return f
}

// newDiscard asks whether to drop back. Declining (or esc) resumes back with
// its state intact.
func newDiscard(bg color.Color, back *formOverlay) *formOverlay {
	var yes bool
	c := newFormOverlay(huh.NewForm(huh.NewGroup(
		huh.NewConfirm().Title("Discard changes?").Affirmative("Discard").Negative("Keep editing").Value(&yes),
	)), bg, nil)
	resume := func() tea.Msg { return overlayDoneMsg{next: back} }
	c.form.SubmitCmd = func() tea.Msg {
		if yes {
			return overlayDoneMsg{}
		}
		return resume()
	}
	c.cancel = resume
	return c
}

func (f *formOverlay) View() string { return f.form.View() }

// SetSize fixes the width and caps the height. Below its natural height a
// huh form scrolls, so the cap is applied only when the form would overflow.
func (f *formOverlay) SetSize(w, h int) {
	f.form.WithWidth(w).WithHeight(0)
	if lipgloss.Height(f.form.View()) > h {
		f.form.WithHeight(h)
	}
}

// newConfirm builds a yes/no overlay.
func newConfirm(title string, bg color.Color, onYes func() tea.Cmd) *formOverlay {
	var yes bool
	form := huh.NewForm(huh.NewGroup(
		huh.NewConfirm().Title(title).Affirmative("Yes").Negative("No").Value(&yes),
	))
	return newFormOverlay(form, bg, func() tea.Cmd {
		if !yes {
			return nil
		}
		return onYes()
	})
}
