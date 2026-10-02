// Command site-cli is a TUI for managing content on novusedge.github.io: a
// browsable list of posts, blips and research with a detail pane, plus forms
// for new content, tags, thumbnails, draft state and translation runs. Run it
// from anywhere inside the repo.
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
