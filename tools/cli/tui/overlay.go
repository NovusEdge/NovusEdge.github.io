package tui

import (
	"image/color"

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
// the overlay was cancelled.
type overlayDoneMsg struct{ cmd tea.Cmd }

// formOverlay hosts a huh form. onSubmit runs after the form completes, so
// it can read the values bound to the form's fields, and returns the command
// that performs the work.
type formOverlay struct {
	form *huh.Form
}

// newFormOverlay wires submit and cancel (esc or ctrl+c) to overlayDoneMsg.
// bg is the terminal background the root last saw; huh reads it from a
// BackgroundColorMsg and otherwise assumes a dark terminal.
func newFormOverlay(form *huh.Form, bg color.Color, onSubmit func() tea.Cmd) *formOverlay {
	km := huh.NewDefaultKeyMap()
	km.Quit = key.NewBinding(key.WithKeys("esc", "ctrl+c"))
	form.WithKeyMap(km).WithShowHelp(false)
	form.SubmitCmd = func() tea.Msg { return overlayDoneMsg{cmd: onSubmit()} }
	form.CancelCmd = func() tea.Msg { return overlayDoneMsg{} }
	form.Update(tea.BackgroundColorMsg{Color: bg})
	return &formOverlay{form: form}
}

func (f *formOverlay) Init() tea.Cmd { return f.form.Init() }

func (f *formOverlay) Update(msg tea.Msg) (overlay, tea.Cmd) {
	_, cmd := f.form.Update(msg)
	return f, cmd
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
