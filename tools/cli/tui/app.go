// Package tui implements the Bubble Tea models for the site content manager.
// actions/ holds the file manipulation logic; this package is presentation
// and input handling.
package tui

import (
	"fmt"
	"image/color"

	"charm.land/bubbles/v2/help"
	"charm.land/bubbles/v2/key"
	"charm.land/bubbles/v2/list"
	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"novusedge/site-cli/actions"
)

const (
	minWidth, minHeight = 50, 15
	wideWidth           = 80
)

// App is the root model. It owns the window size and is the only place that
// sizes children: layout runs after every Update, so a child created in any
// handler is sized before it is first drawn.
type App struct {
	paths actions.Paths
	st    styles
	bg    color.Color
	keys  keyMap
	help  help.Model

	w, h       int
	list       list.Model
	detail     postDetail
	detailSlug string
	showDetail bool // narrow layout only: detail replaces the list
	tr         translationState

	overlay overlay

	status    string
	statusErr bool

	// wantSlug is restored by sync once the list can see that slug. With a
	// filter active the list refilters asynchronously, so the slug is not
	// findable until list.FilterMatchesMsg arrives (wantSettled).
	wantSlug    string
	wantSettled bool
}

// NewApp returns the root model.
func NewApp(p actions.Paths) *App {
	st := newStyles(true)
	return &App{
		paths: p,
		st:    st,
		bg:    color.Black,
		keys:  newKeyMap(),
		help:  help.New(),
		list:  newPostList(st),
	}
}

type postsLoadedMsg struct {
	posts []actions.PostMeta
	err   error
	sel   string
}

type translationMsg struct {
	stale   map[string]bool
	missing map[string][]string
	err     error
}

// writeDoneMsg reports a finished action that may have written files.
// Success reloads the post list and selects sel, or keeps the current
// selection when sel is empty.
type writeDoneMsg struct {
	status string
	err    error
	sel    string
}

// reloadPosts re-reads the post list. sel names the slug to select
// afterwards; empty keeps the current one. The active filter is kept.
func (a *App) reloadPosts(sel string) tea.Cmd {
	if sel == "" {
		if p, ok := selectedPost(a.list); ok {
			sel = p.Slug
		}
	}
	paths := a.paths
	return func() tea.Msg {
		posts, err := actions.ListPosts(paths)
		return postsLoadedMsg{posts: posts, err: err, sel: sel}
	}
}

// checkTranslations runs translate:blog --check in the background.
func (a *App) checkTranslations() tea.Cmd {
	paths := a.paths
	return func() tea.Msg {
		stale, missing, err := actions.TranslationStatus(paths)
		return translationMsg{stale: stale, missing: missing, err: err}
	}
}

func (a *App) setStatus(s string, isErr bool) { a.status, a.statusErr = s, isErr }

// Init implements tea.Model.
func (a *App) Init() tea.Cmd {
	return tea.Batch(tea.RequestBackgroundColor, a.reloadPosts(""), a.checkTranslations())
}

// Update implements tea.Model.
func (a *App) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	cmd := a.update(msg)
	a.sync()
	a.layout()
	return a, cmd
}

func (a *App) update(msg tea.Msg) tea.Cmd {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		a.w, a.h = msg.Width, msg.Height
		return nil
	case tea.BackgroundColorMsg:
		a.bg = msg.Color
		a.st = newStyles(msg.IsDark())
		a.list.Styles = list.DefaultStyles(msg.IsDark())
		a.list.SetDelegate(postDelegate{a.st})
		return nil
	case postsLoadedMsg:
		if msg.err != nil {
			a.setStatus("loading posts: "+msg.err.Error(), true)
			return nil
		}
		a.wantSlug = msg.sel
		a.wantSettled = a.list.FilterState() == list.Unfiltered
		a.detailSlug = ""
		return a.list.SetItems(postItems(msg.posts))
	case translationMsg:
		a.tr = translationState{loaded: true, err: msg.err, stale: msg.stale, missing: msg.missing}
		return nil
	case writeDoneMsg:
		if msg.err != nil {
			a.setStatus(msg.err.Error(), true)
			return nil
		}
		a.setStatus(msg.status, false)
		return a.reloadPosts(msg.sel)
	case overlayDoneMsg:
		a.overlay = nil
		return msg.cmd
	case list.FilterMatchesMsg:
		a.wantSettled = true
	}

	if a.overlay != nil {
		var cmd tea.Cmd
		a.overlay, cmd = a.overlay.Update(msg)
		return cmd
	}
	if k, ok := msg.(tea.KeyPressMsg); ok {
		return a.handleKey(k)
	}
	var cmd tea.Cmd
	a.list, cmd = a.list.Update(msg)
	return cmd
}

func (a *App) narrow() bool { return a.w < wideWidth }

func (a *App) handleKey(msg tea.KeyPressMsg) tea.Cmd {
	a.status = ""
	if a.list.SettingFilter() {
		if msg.String() == "ctrl+c" {
			return tea.Quit
		}
		return a.updateList(msg)
	}
	if a.narrow() && a.showDetail && key.Matches(msg, a.keys.Back) {
		a.showDetail = false
		return nil
	}

	switch {
	case key.Matches(msg, a.keys.Quit):
		return tea.Quit
	case key.Matches(msg, a.keys.Help):
		a.help.ShowAll = !a.help.ShowAll
	case key.Matches(msg, a.keys.Detail) && a.narrow():
		_, a.showDetail = selectedPost(a.list)
	case key.Matches(msg, a.keys.Publish):
		return a.publish()
	case key.Matches(msg, a.keys.Edit, a.keys.Tags, a.keys.Thumb, a.keys.Trans,
		a.keys.NewPost, a.keys.NewBlip, a.keys.NewCard):
		a.setStatus("not yet implemented", true)
	case a.narrow() && a.showDetail:
	default:
		return a.updateList(msg)
	}
	return nil
}

func (a *App) updateList(msg tea.Msg) tea.Cmd {
	var cmd tea.Cmd
	a.list, cmd = a.list.Update(msg)
	return cmd
}

func (a *App) publish() tea.Cmd {
	p, ok := selectedPost(a.list)
	if !ok {
		return nil
	}
	title, done := "Publish "+p.Slug+"?", "published "+p.Slug
	if !p.Hidden {
		title, done = "Hide "+p.Slug+" as draft?", "hid "+p.Slug+" as draft"
	}
	paths := a.paths
	a.overlay = newConfirm(title, a.bg, func() tea.Cmd {
		return func() tea.Msg {
			err := actions.SetHidden(paths, p.Slug, !p.Hidden)
			return writeDoneMsg{status: done, err: err, sel: p.Slug}
		}
	})
	return a.overlay.Init()
}

// sync reconciles state derived from the list after any update: the
// selection restored by reloadPosts, and the detail pane's data.
func (a *App) sync() {
	if a.wantSlug != "" {
		if i, ok := indexOfSlug(a.list, a.wantSlug); ok {
			a.list.Select(i)
			a.wantSlug = ""
		} else if a.wantSettled {
			a.wantSlug = ""
		}
	}
	p, ok := selectedPost(a.list)
	switch {
	case !ok:
		a.detail, a.detailSlug = postDetail{}, ""
		if a.wantSlug == "" {
			a.showDetail = false
		}
	case p.Slug != a.detailSlug:
		a.detail, a.detailSlug = loadDetail(a.paths, p), p.Slug
	}
}

func (a *App) tooSmall() bool { return a.w < minWidth || a.h < minHeight }

// listWidth is the outer width of the list panel.
func (a *App) listWidth() int {
	if a.narrow() {
		return a.w
	}
	return a.w * 45 / 100
}

func (a *App) bodyHeight() int { return a.h - lipgloss.Height(a.footer()) }

// layout is the single size path: every child's size is derived here from
// the stored window size.
func (a *App) layout() {
	if a.tooSmall() {
		return
	}
	if !a.narrow() {
		a.showDetail = false
	}
	a.help.SetWidth(a.w)
	bh := a.bodyHeight()
	a.list.SetSize(a.listWidth()-2, bh-2)
	if a.overlay != nil {
		a.overlay.SetSize(min(a.w-8, 64), bh-4)
	}
}

func (a *App) footer() string {
	var line string
	switch {
	case a.status != "":
		style := a.st.ok
		if a.statusErr {
			style = a.st.err
		}
		line = style.Render(a.status)
	default:
		line = a.st.muted.Render(a.tr.summary())
	}
	var bar string
	if a.overlay != nil {
		bar = a.st.muted.Render("enter confirm  esc cancel")
	} else {
		bar = a.help.View(a.keys)
	}
	return lipgloss.NewStyle().MaxWidth(a.w).Render(" "+line) + "\n" + bar
}

func (a *App) panel(outer int, body string, focused bool) string {
	style := a.st.panel
	if focused {
		style = a.st.focus
	}
	bh := a.bodyHeight()
	return style.Width(outer).Height(bh).MaxHeight(bh).Render(body)
}

func (a *App) detailPanel(outer int) string {
	body := a.st.muted.Render("no posts")
	if a.detailSlug != "" {
		body = a.detail.render(a.st, a.tr, outer-4)
	}
	return a.panel(outer, lipgloss.NewStyle().Padding(0, 1).Render(body), false)
}

// View implements tea.Model.
func (a *App) View() tea.View {
	var content string
	switch {
	case a.tooSmall():
		msg := fmt.Sprintf("Terminal too small\nneed %dx%d, have %dx%d", minWidth, minHeight, a.w, a.h)
		content = lipgloss.Place(a.w, a.h, lipgloss.Center, lipgloss.Center, a.st.notice.Render(msg))
	case a.overlay != nil:
		box := a.st.focus.Padding(1, 2).Render(a.overlay.View())
		content = lipgloss.Place(a.w, a.bodyHeight(), lipgloss.Center, lipgloss.Center, box) + "\n" + a.footer()
	default:
		lw := a.listWidth()
		var body string
		switch {
		case !a.narrow():
			body = lipgloss.JoinHorizontal(lipgloss.Top, a.panel(lw, a.list.View(), true), a.detailPanel(a.w-lw))
		case a.showDetail:
			body = a.detailPanel(a.w)
		default:
			body = a.panel(lw, a.list.View(), true)
		}
		content = body + "\n" + a.footer()
	}
	v := tea.NewView(content)
	v.AltScreen = true
	return v
}
