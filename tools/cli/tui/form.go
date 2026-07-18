package tui

import (
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
)

// Field describes a single text input in a Form.
type Field struct {
	Label       string
	Placeholder string
	Default     string
	CharLimit   int // 0 -> textinput default (no practical limit)
}

// Form is a minimal sequential multi-field text form: tab/enter moves
// forward, shift-tab moves back, enter on the last field submits. It is used
// by every "create X" and "edit X" screen in this tool.
type Form struct {
	title    string
	fields   []Field
	inputs   []textinput.Model
	focus    int
	onSubmit func(values []string) (successMsg string, err error)
	err      error
}

func NewForm(title string, fields []Field, onSubmit func(values []string) (string, error)) Form {
	inputs := make([]textinput.Model, len(fields))
	for i, f := range fields {
		ti := textinput.New()
		ti.Placeholder = f.Placeholder
		ti.SetValue(f.Default)
		if f.CharLimit > 0 {
			ti.CharLimit = f.CharLimit
		}
		ti.Width = 60
		if i == 0 {
			ti.Focus()
		}
		inputs[i] = ti
	}
	return Form{title: title, fields: fields, inputs: inputs, onSubmit: onSubmit}
}

func (f Form) Init() tea.Cmd {
	return textinput.Blink
}

func (f Form) Values() []string {
	vals := make([]string, len(f.inputs))
	for i, in := range f.inputs {
		vals[i] = in.Value()
	}
	return vals
}

func (f Form) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "esc":
			return f, func() tea.Msg { return toMenu("", false) }
		case "shift+tab", "up":
			f.blurCurrent()
			f.focus--
			if f.focus < 0 {
				f.focus = len(f.inputs) - 1
			}
			f.focusCurrent()
			return f, textinput.Blink
		case "tab", "down":
			f.blurCurrent()
			f.focus++
			if f.focus >= len(f.inputs) {
				f.focus = 0
			}
			f.focusCurrent()
			return f, textinput.Blink
		case "enter":
			if f.focus == len(f.inputs)-1 {
				msg, err := f.onSubmit(f.Values())
				if err != nil {
					f.err = err
					return f, nil
				}
				return f, func() tea.Msg { return toMenu(msg, false) }
			}
			f.blurCurrent()
			f.focus++
			f.focusCurrent()
			return f, textinput.Blink
		}
	}

	var cmd tea.Cmd
	f.inputs[f.focus], cmd = f.inputs[f.focus].Update(msg)
	return f, cmd
}

func (f *Form) blurCurrent() { f.inputs[f.focus].Blur() }
func (f *Form) focusCurrent() { f.inputs[f.focus].Focus() }

func (f Form) View() string {
	s := titleStyle.Render(f.title) + "\n\n"
	for i, field := range f.fields {
		label := field.Label
		if i == f.focus {
			s += focusedLabelStyle.Render("> "+label) + "\n"
		} else {
			s += blurredLabelStyle.Render("  "+label) + "\n"
		}
		s += "  " + f.inputs[i].View() + "\n\n"
	}
	if f.err != nil {
		s += errStyle.Render("error: "+f.err.Error()) + "\n\n"
	}
	s += helpStyle.Render("tab/shift+tab: move field  •  enter: next/submit  •  esc: cancel")
	return appStyle.Render(s)
}
