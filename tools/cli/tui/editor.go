package tui

import (
	"fmt"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/huh/v2"

	"novusedge/site-cli/actions"
)

// openEditor lists the installed editors and opens the selected post in the
// one chosen.
func (a *App) openEditor() tea.Cmd {
	p, ok := selectedPost(a.list)
	if !ok {
		return nil
	}
	editors := actions.FindEditorsFromEnv()
	if len(editors) == 0 {
		a.setStatus("no editor found on PATH", true)
		return nil
	}
	opts := make([]huh.Option[int], len(editors))
	for i, e := range editors {
		kind := "gui"
		if e.Terminal {
			kind = "terminal"
		}
		label := e.Name
		if len(e.Args) > 0 {
			label += " " + strings.Join(e.Args, " ")
		}
		opts[i] = huh.NewOption(fmt.Sprintf("%s (%s)", label, kind), i)
	}
	var idx int
	file := actions.PostFilePath(a.paths, p.Slug)
	a.overlay = newFormOverlay(a.bg, func() tea.Cmd {
		return launchEditor(editors[idx], file, p.Slug)
	}, huh.NewGroup(
		huh.NewSelect[int]().Title("Open "+p.Slug+" in").Options(opts...).Value(&idx),
	))
	return a.overlay.Init()
}

func launchEditor(e actions.Editor, file, slug string) tea.Cmd {
	if e.Terminal {
		return tea.ExecProcess(e.Command(file), func(err error) tea.Msg {
			return writeDoneMsg{status: "closed " + e.Name, err: err, sel: slug}
		})
	}
	return func() tea.Msg {
		return writeDoneMsg{status: "opened in " + e.Name, err: e.StartDetached(file), sel: slug}
	}
}
