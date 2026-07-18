package tui

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea"

	"novusedge/site-cli/actions"
)

func newBlipForm(p actions.Paths) tea.Model {
	fields := []Field{
		{Label: "Text (optional, max 255 chars)", Placeholder: "what happened", CharLimit: 255},
		{Label: "Media file path (optional)", Placeholder: "/path/to/file.png"},
		{Label: "Tags (optional, comma separated)", Placeholder: "meta, site"},
	}
	onSubmit := func(v []string) (string, error) {
		in := actions.BlipInput{
			Text:      strings.TrimSpace(v[0]),
			MediaPath: strings.TrimSpace(v[1]),
			Tags:      splitTags(v[2]),
		}
		if err := actions.NewBlip(p, in); err != nil {
			return "", err
		}
		return "appended new blip to src/content/blips/blips.yaml", nil
	}
	return NewForm("New blip", fields, onSubmit)
}
