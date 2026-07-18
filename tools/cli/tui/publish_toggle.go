package tui

import (
	"fmt"

	tea "github.com/charmbracelet/bubbletea"

	"novusedge/site-cli/actions"
)

func newPublishPicker(p actions.Paths) tea.Model {
	posts, err := actions.ListPosts(p)
	if err != nil {
		return NewInfoScreen("Publish/hide", errStyle.Render(err.Error()))
	}
	return NewPostPicker("Publish/hide — pick a post to toggle", posts, func(meta actions.PostMeta) (tea.Model, tea.Cmd) {
		newHidden := !meta.Hidden
		if err := actions.SetHidden(p, meta.Slug, newHidden); err != nil {
			return nil, func() tea.Msg { return toMenu(err.Error(), true) }
		}
		verb := "published"
		if newHidden {
			verb = "hidden (draft)"
		}
		status := fmt.Sprintf("%s is now %s", meta.Slug, verb)
		return nil, func() tea.Msg { return toMenu(status, false) }
	})
}
