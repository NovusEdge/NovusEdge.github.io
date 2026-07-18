package tui

import (
	"fmt"
	"strings"

	tea "github.com/charmbracelet/bubbletea"

	"novusedge/site-cli/actions"
)

func newDraftsScreen(p actions.Paths) tea.Model {
	slugs, err := actions.ReadHidden(p)
	if err != nil {
		return NewInfoScreen("Drafts", errStyle.Render(err.Error()))
	}
	if len(slugs) == 0 {
		return NewInfoScreen("Drafts", "no drafts — HIDDEN array in src/lib/posts.ts is empty")
	}
	var b strings.Builder
	for _, s := range slugs {
		fmt.Fprintf(&b, "  • %s\n", s)
	}
	return NewInfoScreen("Drafts (HIDDEN in src/lib/posts.ts)", b.String())
}
