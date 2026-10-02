package tui

import (
	"charm.land/lipgloss/v2"
)

// styles holds every style the shell uses. lipgloss v2 has no adaptive
// colours, so the palette is resolved against the terminal background the
// root learns from tea.BackgroundColorMsg and rebuilt when it changes.
type styles struct {
	accent, muted, err, ok lipgloss.Style

	title  lipgloss.Style
	panel  lipgloss.Style
	focus  lipgloss.Style
	notice lipgloss.Style
}

func newStyles(isDark bool) styles {
	pick := lipgloss.LightDark(isDark)
	accent := pick(lipgloss.Color("#5b21b6"), lipgloss.Color("#a78bfa"))
	muted := pick(lipgloss.Color("#666666"), lipgloss.Color("#888888"))
	errC := pick(lipgloss.Color("#b91c1c"), lipgloss.Color("#f87171"))
	okC := pick(lipgloss.Color("#15803d"), lipgloss.Color("#4ade80"))

	border := lipgloss.NewStyle().Border(lipgloss.RoundedBorder())
	return styles{
		accent: lipgloss.NewStyle().Foreground(accent),
		muted:  lipgloss.NewStyle().Foreground(muted),
		err:    lipgloss.NewStyle().Foreground(errC).Bold(true),
		ok:     lipgloss.NewStyle().Foreground(okC).Bold(true),
		title:  lipgloss.NewStyle().Foreground(accent).Bold(true),
		panel:  border.BorderForeground(muted),
		focus:  border.BorderForeground(accent),
		notice: lipgloss.NewStyle().Foreground(muted).Align(lipgloss.Center),
	}
}
