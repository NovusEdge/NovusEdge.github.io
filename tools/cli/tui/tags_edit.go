package tui

import (
	"fmt"
	"strings"

	tea "github.com/charmbracelet/bubbletea"

	"novusedge/site-cli/actions"
)

func newTagsPicker(p actions.Paths) tea.Model {
	posts, err := actions.ListPosts(p)
	if err != nil {
		return NewInfoScreen("Edit tags", errStyle.Render(err.Error()))
	}
	return NewPostPicker("Edit tags — pick a post", posts, func(meta actions.PostMeta) (tea.Model, tea.Cmd) {
		current, err := actions.GetTags(p, meta.Slug)
		if err != nil {
			s := NewInfoScreen("Edit tags", errStyle.Render(err.Error()))
			return s, s.Init()
		}
		fields := []Field{
			{Label: "Tags (comma separated)", Default: strings.Join(current, ", ")},
		}
		onSubmit := func(v []string) (string, error) {
			tags := splitTags(v[0])
			if err := actions.EditTags(p, meta.Slug, tags); err != nil {
				return "", err
			}
			return fmt.Sprintf("updated tags for %s", meta.Slug), nil
		}
		f := NewForm("Edit tags: "+meta.Slug, fields, onSubmit)
		return f, f.Init()
	})
}
