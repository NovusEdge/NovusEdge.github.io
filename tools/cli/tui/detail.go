package tui

import (
	"fmt"
	"strings"

	"charm.land/lipgloss/v2"

	"novusedge/site-cli/actions"
)

// translationState is the result of the asynchronous translate:blog --check.
type translationState struct {
	loaded  bool
	err     error
	stale   map[string]bool
	missing map[string][]string
}

func (t translationState) summary() string {
	switch {
	case !t.loaded:
		return "translations: checking..."
	case t.err != nil:
		return "translations: check failed"
	case len(t.stale)+len(t.missing) == 0:
		return "translations: up to date"
	}
	return fmt.Sprintf("translations: %d stale, %d incomplete", len(t.stale), len(t.missing))
}

// postDetail is the data behind the detail pane. It is read from disk when
// the selection changes or the post list reloads, not on every render.
type postDetail struct {
	meta    actions.PostMeta
	thumb   actions.Thumb
	locales []string
	err     error
}

func loadDetail(p actions.Paths, meta actions.PostMeta) postDetail {
	d := postDetail{meta: meta}
	var err error
	if d.thumb, _, err = actions.GetThumbnail(p, meta.Slug); err != nil {
		d.err = err
	}
	if d.locales, err = actions.PostLocales(p, meta.Slug); err != nil {
		d.err = err
	}
	return d
}

func (d postDetail) render(st styles, tr translationState, width int) string {
	m := d.meta
	label := func(s string) string { return st.muted.Render(s) }
	state := st.ok.Render("published")
	if m.Hidden {
		state = st.err.Render("draft")
	}
	or := func(s, fallback string) string {
		if s == "" {
			return st.muted.Render(fallback)
		}
		return s
	}

	locales := st.muted.Render("none")
	if len(d.locales) > 0 {
		locales = strings.Join(d.locales, " ")
	}
	lines := []string{
		st.title.Render(m.Title),
		label(m.Slug),
		"",
		m.Date + "   " + state,
		"",
		or(m.Description, "(no description)"),
		"",
		label("tags:  ") + or(strings.Join(m.Tags, ", "), "(none)"),
		label("hero:  ") + or(d.thumb.Hero, "(none)"),
		label("list:  ") + or(d.thumb.List, "(uses hero)"),
		"",
		label("translations: ") + locales,
	}
	switch {
	case !tr.loaded:
		lines = append(lines, label("status: checking..."))
	case tr.err != nil:
		lines = append(lines, st.err.Render("status: check failed"))
	default:
		if tr.stale[m.Slug] {
			lines = append(lines, st.err.Render("stale: source changed since translating"))
		}
		if miss := tr.missing[m.Slug]; len(miss) > 0 {
			lines = append(lines, st.err.Render("missing: "+strings.Join(miss, " ")))
		}
		if !tr.stale[m.Slug] && len(tr.missing[m.Slug]) == 0 && len(d.locales) > 0 {
			lines = append(lines, st.ok.Render("translations up to date"))
		}
	}
	if d.err != nil {
		lines = append(lines, "", st.err.Render(d.err.Error()))
	}
	return lipgloss.NewStyle().Width(width).Render(strings.Join(lines, "\n"))
}
