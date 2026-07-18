package tui

import (
	"fmt"

	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"

	"novusedge/site-cli/actions"
)

// postItem adapts a PostMeta into a bubbles/list.Item so posts can be
// fuzzy-filtered by slug or title.
type postItem struct{ meta actions.PostMeta }

func (i postItem) FilterValue() string { return i.meta.Slug + " " + i.meta.Title }

func (i postItem) Title() string {
	if i.meta.Hidden {
		return i.meta.Title + "  [draft]"
	}
	return i.meta.Title
}

func (i postItem) Description() string {
	return fmt.Sprintf("%s · %s", i.meta.Slug, i.meta.Date)
}

// PostPicker is a fuzzy-filterable list of blog posts. onSelect is invoked
// with the chosen post's metadata and returns the model to transition to
// (e.g. a Form for setting a thumbnail, or nil to just emit a backMsg cmd).
type PostPicker struct {
	list     list.Model
	onSelect func(actions.PostMeta) (tea.Model, tea.Cmd)
}

func NewPostPicker(title string, posts []actions.PostMeta, onSelect func(actions.PostMeta) (tea.Model, tea.Cmd)) PostPicker {
	items := make([]list.Item, len(posts))
	for i, p := range posts {
		items[i] = postItem{meta: p}
	}
	delegate := list.NewDefaultDelegate()
	l := list.New(items, delegate, 70, 20)
	l.Title = title
	l.SetShowStatusBar(true)
	l.SetFilteringEnabled(true)
	l.Styles.Title = titleStyle

	return PostPicker{list: l, onSelect: onSelect}
}

func (p PostPicker) Init() tea.Cmd { return nil }

func (p PostPicker) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	if km, ok := msg.(tea.KeyMsg); ok {
		// Don't intercept "enter" while the user is typing a filter query.
		if km.String() == "esc" && p.list.FilterState() == list.Unfiltered {
			return p, func() tea.Msg { return toMenu("", false) }
		}
		if km.String() == "enter" && p.list.FilterState() != list.Filtering {
			if item, ok := p.list.SelectedItem().(postItem); ok {
				model, cmd := p.onSelect(item.meta)
				if model == nil {
					// No screen transition (e.g. an immediate toggle) —
					// stay on the picker until the cmd's message swaps us
					// out at the App level.
					return p, cmd
				}
				return model, cmd
			}
		}
	}
	var cmd tea.Cmd
	p.list, cmd = p.list.Update(msg)
	return p, cmd
}

func (p PostPicker) View() string {
	return appStyle.Render(p.list.View() + "\n" + helpStyle.Render("/: filter  •  enter: select  •  esc: back"))
}
