// Package tui implements the bubbletea models/views for the site content
// manager. actions/ holds the actual file manipulation logic; this package
// is purely presentation + input handling.
package tui

import (
	tea "github.com/charmbracelet/bubbletea"

	"novusedge/site-cli/actions"
)

// App is the top-level bubbletea model. It owns exactly one "active" screen
// at a time (the main menu, or whichever action screen is in progress) and
// switches between them by watching for backMsg.
type App struct {
	paths  actions.Paths
	active tea.Model
}

func NewApp(p actions.Paths) App {
	return App{paths: p, active: NewMenu(p, "", false)}
}

func (a App) Init() tea.Cmd {
	return a.active.Init()
}

func (a App) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		if msg.String() == "ctrl+c" {
			return a, tea.Quit
		}
	case backMsg:
		a.active = NewMenu(a.paths, msg.status, msg.isErr)
		return a, a.active.Init()
	}

	var cmd tea.Cmd
	a.active, cmd = a.active.Update(msg)
	return a, cmd
}

func (a App) View() string {
	return a.active.View()
}
