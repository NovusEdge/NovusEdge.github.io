package tui

import (
	tea "github.com/charmbracelet/bubbletea"

	"novusedge/site-cli/actions"
)

type menuItem struct {
	label string
	build func(p actions.Paths) tea.Model
}

var menuItems = []menuItem{
	{"New blog post", func(p actions.Paths) tea.Model { return newBlogForm(p) }},
	{"New blip", func(p actions.Paths) tea.Model { return newBlipForm(p) }},
	{"New research card", func(p actions.Paths) tea.Model { return newPaperForm(p) }},
	{"Set thumbnail", func(p actions.Paths) tea.Model { return newThumbnailPicker(p) }},
	{"Edit tags", func(p actions.Paths) tea.Model { return newTagsPicker(p) }},
	{"List drafts", func(p actions.Paths) tea.Model { return newDraftsScreen(p) }},
	{"Publish/hide post", func(p actions.Paths) tea.Model { return newPublishPicker(p) }},
}

// Menu is the root screen: arrow-key navigation over the available actions.
type Menu struct {
	paths  actions.Paths
	cursor int
	status string
	isErr  bool
}

func NewMenu(p actions.Paths, status string, isErr bool) Menu {
	return Menu{paths: p, status: status, isErr: isErr}
}

func (m Menu) Init() tea.Cmd { return nil }

func (m Menu) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "up", "k":
			if m.cursor > 0 {
				m.cursor--
			}
		case "down", "j":
			if m.cursor < len(menuItems)-1 {
				m.cursor++
			}
		case "enter":
			next := menuItems[m.cursor].build(m.paths)
			return next, next.Init()
		}
	}
	return m, nil
}

func (m Menu) View() string {
	s := titleStyle.Render("novusedge.github.io — content manager") + "\n\n"
	for i, item := range menuItems {
		cursor := "  "
		style := blurredLabelStyle
		if i == m.cursor {
			cursor = "> "
			style = focusedLabelStyle
		}
		s += cursor + style.Render(item.label) + "\n"
	}
	if m.status != "" {
		s += "\n"
		if m.isErr {
			s += errStyle.Render(m.status)
		} else {
			s += okStyle.Render(m.status)
		}
		s += "\n"
	}
	s += "\n" + helpStyle.Render("up/down: navigate  •  enter: select  •  ctrl+c: quit")
	return appStyle.Render(s)
}
