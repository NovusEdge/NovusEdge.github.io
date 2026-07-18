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
		fields := []Field{
			{Label: "Thumbnail path (e.g. /assets/img/foo.png)", Default: current, Placeholder: "/assets/img/foo.png"},
		}
		onSubmit := func(v []string) (string, error) {
			if err := actions.SetThumbnail(p, meta.Slug, v[0]); err != nil {
				return "", err
			}
			return fmt.Sprintf("set thumbnail for %s in src/lib/thumbnails.ts", meta.Slug), nil
		}
		f := NewForm("Set thumbnail: "+meta.Slug, fields, onSubmit)
		return f, f.Init()
	})
}
