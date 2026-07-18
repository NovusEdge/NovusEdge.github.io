package tui

import (
	"fmt"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"novusedge/site-cli/actions"
)

func newBlogForm(p actions.Paths) tea.Model {
	today := time.Now().Format("2006-01-02")
	fields := []Field{
		{Label: "Slug", Placeholder: "my-new-post"},
		{Label: "Title", Placeholder: "My New Post"},
		{Label: "Date", Default: today},
		{Label: "Tags (comma separated)", Placeholder: "ai, essay"},
		{Label: "Description", Placeholder: "one-line summary"},
	}
	onSubmit := func(v []string) (string, error) {
		in := actions.BlogInput{
			Slug:        strings.TrimSpace(v[0]),
			Title:       strings.TrimSpace(v[1]),
			Date:        strings.TrimSpace(v[2]),
			Tags:        splitTags(v[3]),
			Description: strings.TrimSpace(v[4]),
		}
		if err := actions.NewBlog(p, in); err != nil {
			return "", err
		}
		return fmt.Sprintf("created src/content/blog/%s.md (added to HIDDEN as a draft)", in.Slug), nil
	}
	f := NewForm("New blog post", fields, onSubmit)
	return f
}

func splitTags(s string) []string {
	parts := strings.Split(s, ",")
	var tags []string
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			tags = append(tags, p)
		}
	}
	return tags
}
