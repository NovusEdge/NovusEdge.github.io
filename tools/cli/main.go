// Command site-cli is a TUI for managing content on khimani.dev: a
// filterable list of posts with a detail pane, plus forms for new posts,
// blips and research cards, tags, thumbnails, draft state and translation
// runs. Run it from anywhere inside the repo.
package main

import (
	"fmt"
	"os"

	tea "charm.land/bubbletea/v2"

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

	p := tea.NewProgram(tui.NewApp(paths))
	if _, err := p.Run(); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}
