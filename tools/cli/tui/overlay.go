package tui

import (
	"image/color"
	"slices"

	"charm.land/bubbles/v2/key"
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
// Chained steps must use next: going through a cmd leaves the slot empty for a
// frame, so the list flashes and a fast key would reach it.
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
	// live validates the focused field on every keystroke. huh only validates
	// on enter and cannot be handed an error from outside, so the message is
	// drawn under the form.
	live    []liveCheck
	liveErr error
	width   int

	// huh's Group.WithHeight only ever shrinks fields and Form.WithHeight
	// ignores heights <= 0, so a cap cannot be lifted again. The natural sizes
	// are measured once, before the first cap, and every size change restores
	// them and then re-caps.
	groups   []*huh.Group
	talls    []tallField
	natural  []int
	measured bool
	avail    int
	lastFit  [2]int
}

// liveCheck ties a field to its bound value and validator. An empty value is
// not checked: required-field errors are left to huh's submit-time pass.
type liveCheck struct {
	field    huh.Field
	val      *string
	validate func(string) error
}

// tallField is a field with its own height (a text area, a file picker) that
// a height cap shrinks.
type tallField struct {
	field   huh.Field
	natural int
}

// newFormOverlay builds the form from groups, wires submit to overlayDoneMsg
// and cancel to a plain close. bg is the terminal background the root last
// saw; huh reads it from a BackgroundColorMsg and otherwise assumes a dark
// terminal. Fields that carry their own height go in tall.
func newFormOverlay(bg color.Color, onSubmit func() tea.Cmd, groups ...*huh.Group) *formOverlay {
	form := huh.NewForm(groups...)
	form.WithShowHelp(false)
	form.SubmitCmd = func() tea.Msg { return overlayDoneMsg{cmd: onSubmit()} }
	form.Update(tea.BackgroundColorMsg{Color: bg})
	return &formOverlay{
		form: form, groups: groups,
		cancel: func() tea.Msg { return overlayDoneMsg{} },
	}
}

// tall registers fields whose own height must be restored after a cap.
func (f *formOverlay) tall(fields ...huh.Field) *formOverlay {
	for _, fl := range fields {
		f.talls = append(f.talls, tallField{field: fl})
	}
	return f
}

// then replaces the submit action with one that chains into another overlay or
// finishes with a command.
func (f *formOverlay) then(fn func() overlayDoneMsg) *formOverlay {
	f.form.SubmitCmd = func() tea.Msg { return fn() }
	return f
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
	f.liveErr = nil
	for _, c := range f.live {
		if f.form.GetFocusedField() == c.field && *c.val != "" {
			f.liveErr = c.validate(*c.val)
		}
	}
	return f, cmd
}

// guard makes esc ask "Discard changes?" while dirty reports true. bg is
// captured by the caller on the update loop.
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
	c := newFormOverlay(bg, nil, huh.NewGroup(
		huh.NewConfirm().Title("Discard changes?").Affirmative("Discard").Negative("Keep editing").Value(&yes),
	))
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

func (f *formOverlay) errView() string {
	if f.liveErr == nil {
		return ""
	}
	return lipgloss.NewStyle().Foreground(lipgloss.Color("9")).Width(f.width).Render("  * " + f.liveErr.Error())
}

func (f *formOverlay) View() string {
	v := f.form.View()
	if e := f.errView(); e != "" {
		v += "\n" + e
	}
	return v
}

// footerKeys is the focused field's key help plus the esc binding the overlay
// takes for itself. huh's own esc bindings are dropped: the overlay never
// passes esc on, so they would be misleading.
func (f *formOverlay) footerKeys() []key.Binding {
	var keys []key.Binding
	for _, b := range f.form.KeyBinds() {
		if !slices.Contains(b.Keys(), "esc") {
			keys = append(keys, b)
		}
	}
	return append(keys, key.NewBinding(key.WithKeys("esc"), key.WithHelp("esc", "cancel")))
}

// SetSize fixes the width and caps each group at h minus the live-error line.
// Below its natural height a huh form scrolls.
func (f *formOverlay) SetSize(w, h int) {
	f.width = w
	f.form.WithWidth(w)
	f.measure()
	room := h
	if e := f.errView(); e != "" {
		room -= lipgloss.Height(e)
	}
	room = max(room, 1)
	if fit := [2]int{w, room}; fit != f.lastFit {
		f.lastFit = fit
		f.apply(room)
	}
}

// measure records natural heights, once, before any cap is applied.
func (f *formOverlay) measure() {
	if f.measured {
		return
	}
	f.measured = true
	for i := range f.talls {
		f.talls[i].natural = lipgloss.Height(f.talls[i].field.View())
	}
	for _, g := range f.groups {
		n := lipgloss.Height(g.Content())
		if s := g.Header(); s != "" {
			n += lipgloss.Height(s)
		}
		if s := g.Footer(); s != "" {
			n += lipgloss.Height(s)
		}
		f.natural = append(f.natural, n)
	}
}

func (f *formOverlay) apply(room int) {
	for _, t := range f.talls {
		t.field.WithHeight(t.natural)
	}
	for i, g := range f.groups {
		g.WithHeight(min(f.natural[i], room))
	}
}

// newConfirm builds a yes/no overlay.
func newConfirm(title string, bg color.Color, onYes func() tea.Cmd) *formOverlay {
	var yes bool
	return newFormOverlay(bg, func() tea.Cmd {
		if !yes {
			return nil
		}
		return onYes()
	}, huh.NewGroup(
		huh.NewConfirm().Title(title).Affirmative("Yes").Negative("No").Value(&yes),
	))
}
