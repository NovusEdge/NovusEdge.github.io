// Command site-cli is a small TUI for managing content on novusedge.github.io:
// new blog posts, blips, research cards, thumbnails, tags, and draft/publish
// state. Run it from the repo root (or anywhere inside the repo).
package main

import (
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"

	"novusedge/site-cli/actions"
	"novusedge/site-cli/tui"
)

func main() {
	root, err := actions.FindRepoRoot()
	if err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
	paths := actions.NewPaths(root)

	p := tea.NewProgram(tui.NewApp(paths), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}
