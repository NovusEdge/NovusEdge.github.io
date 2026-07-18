package tui

import (
	"fmt"
	"strings"

	tea "github.com/charmbracelet/bubbletea"

	"novusedge/site-cli/actions"
)

func newPaperForm(p actions.Paths) tea.Model {
	fields := []Field{
		{Label: "Slug", Placeholder: "my-paper"},
		{Label: "Title", Placeholder: "My Paper Title"},
		{Label: "Venue", Placeholder: "Preprint · Zenodo"},
		{Label: "Date", Placeholder: "2026"},
		{Label: "Abstract", Placeholder: "one paragraph summary"},
		{Label: "URL", Placeholder: "https://..."},
		{Label: "Thumb path (optional)", Placeholder: "/assets/my-paper.jpeg"},
		{Label: "Links (label|href, separate pairs with ;)", Placeholder: "zenodo|https://... ; site|https://..."},
	}
	onSubmit := func(v []string) (string, error) {
		in := actions.PaperInput{
			Slug:     strings.TrimSpace(v[0]),
			Title:    strings.TrimSpace(v[1]),
			Venue:    strings.TrimSpace(v[2]),
			Date:     strings.TrimSpace(v[3]),
			Abstract: strings.TrimSpace(v[4]),
			URL:      strings.TrimSpace(v[5]),
			Thumb:    strings.TrimSpace(v[6]),
			Links:    parseLinks(v[7]),
		}
		if err := actions.NewPaper(p, in); err != nil {
			return "", err
		}
		return fmt.Sprintf("added %q to src/content/papers.ts", in.Slug), nil
	}
	return NewForm("New research card", fields, onSubmit)
}

func parseLinks(s string) []actions.PaperLink {
	var links []actions.PaperLink
	for _, pair := range strings.Split(s, ";") {
		pair = strings.TrimSpace(pair)
		if pair == "" {
			continue
		}
		parts := strings.SplitN(pair, "|", 2)
		if len(parts) != 2 {
			continue
		}
		links = append(links, actions.PaperLink{
			Label: strings.TrimSpace(parts[0]),
			Href:  strings.TrimSpace(parts[1]),
		})
	}
	return links
}
