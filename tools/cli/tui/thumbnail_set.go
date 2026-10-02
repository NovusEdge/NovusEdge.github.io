package tui

import (
	"fmt"

	tea "github.com/charmbracelet/bubbletea"

	"novusedge/site-cli/actions"
)

func newThumbnailPicker(p actions.Paths) tea.Model {
	posts, err := actions.ListPosts(p)
	if err != nil {
		return NewInfoScreen("Set thumbnail", errStyle.Render(err.Error()))
	}
	return NewPostPicker("Set thumbnail — pick a post", posts, func(meta actions.PostMeta) (tea.Model, tea.Cmd) {
		current, _, _ := actions.GetThumbnail(p, meta.Slug)
		currentPath := current.Hero
		fields := []Field{
			{Label: "Thumbnail path (e.g. /assets/img/foo.png)", Default: currentPath, Placeholder: "/assets/img/foo.png"},
		}
		onSubmit := func(v []string) (string, error) {
			if err := actions.SetThumbnail(p, meta.Slug, actions.Thumb{Hero: v[0], List: current.List}); err != nil {
				return "", err
			}
			return fmt.Sprintf("set thumbnail for %s in src/content/thumbnails.json", meta.Slug), nil
		}
		f := NewForm("Set thumbnail: "+meta.Slug, fields, onSubmit)
		return f, f.Init()
	})
}
