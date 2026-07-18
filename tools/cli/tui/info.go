package tui

import tea "github.com/charmbracelet/bubbletea"

// InfoScreen shows a block of static text and returns to the menu on any
// key press. Used for "list drafts" and similar read-only views.
type InfoScreen struct {
	title string
	body  string
}

func NewInfoScreen(title, body string) InfoScreen {
	return InfoScreen{title: title, body: body}
}

func (s InfoScreen) Init() tea.Cmd { return nil }

func (s InfoScreen) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	if _, ok := msg.(tea.KeyMsg); ok {
		return s, func() tea.Msg { return toMenu("", false) }
	}
	return s, nil
}

func (s InfoScreen) View() string {
	body := titleStyle.Render(s.title) + "\n\n" + s.body + "\n\n" + helpStyle.Render("press any key to go back")
	return appStyle.Render(body)
}
