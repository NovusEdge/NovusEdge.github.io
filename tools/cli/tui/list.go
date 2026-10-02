package tui

import (
	"fmt"
	"io"

	"charm.land/bubbles/v2/list"
	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"novusedge/site-cli/actions"
)

type postItem struct{ actions.PostMeta }

func (p postItem) FilterValue() string { return p.Title + " " + p.Slug }

// postDelegate renders one row per post: cursor, title, and a right-aligned
// "D" for drafts.
type postDelegate struct{ st styles }

func (postDelegate) Height() int                         { return 1 }
func (postDelegate) Spacing() int                        { return 0 }
func (postDelegate) Update(tea.Msg, *list.Model) tea.Cmd { return nil }

func (d postDelegate) Render(w io.Writer, m list.Model, index int, item list.Item) {
	p, ok := item.(postItem)
	if !ok {
		return
	}
	selected := index == m.Index()
	prefix, titleStyle := "  ", lipgloss.NewStyle()
	if selected {
		prefix, titleStyle = d.st.accent.Render("› "), d.st.title
	}
	mark := "  "
	if p.Hidden {
		mark = " " + d.st.muted.Render("D")
	}
	room := max(m.Width()-lipgloss.Width(prefix)-lipgloss.Width(mark), 1)
	title := titleStyle.Inline(true).Width(room).MaxWidth(room).Render(p.Title)
	fmt.Fprint(w, prefix+title+mark)
}

func newPostList(st styles) list.Model {
	l := list.New(nil, postDelegate{st}, 0, 0)
	l.Title = "posts"
	l.Styles = list.DefaultStyles(true)
	l.SetShowHelp(false)
	l.SetShowStatusBar(false)
	l.SetShowPagination(false)
	l.DisableQuitKeybindings()
	l.SetStatusBarItemName("post", "posts")
	return l
}

func postItems(posts []actions.PostMeta) []list.Item {
	items := make([]list.Item, len(posts))
	for i, p := range posts {
		items[i] = postItem{p}
	}
	return items
}

// selectedPost returns the post under the cursor, if any.
func selectedPost(l list.Model) (actions.PostMeta, bool) {
	p, ok := l.SelectedItem().(postItem)
	return p.PostMeta, ok
}

// indexOfSlug finds slug among the currently visible (filtered) items.
func indexOfSlug(l list.Model, slug string) (int, bool) {
	for i, it := range l.VisibleItems() {
		if p, ok := it.(postItem); ok && p.Slug == slug {
			return i, true
		}
	}
	return 0, false
}
