package tui

import "github.com/charmbracelet/lipgloss"

// A small, dark-theme-friendly palette. Kept minimal on purpose.
var (
	colorAccent = lipgloss.AdaptiveColor{Light: "#5b21b6", Dark: "#a78bfa"}
	colorMuted  = lipgloss.AdaptiveColor{Light: "#666666", Dark: "#888888"}
	colorErr    = lipgloss.AdaptiveColor{Light: "#b91c1c", Dark: "#f87171"}
	colorOk     = lipgloss.AdaptiveColor{Light: "#15803d", Dark: "#4ade80"}

	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(colorAccent).
			MarginBottom(1)

	helpStyle = lipgloss.NewStyle().
			Foreground(colorMuted).
			MarginTop(1)

	errStyle = lipgloss.NewStyle().Foreground(colorErr).Bold(true)
	okStyle  = lipgloss.NewStyle().Foreground(colorOk).Bold(true)

	focusedLabelStyle = lipgloss.NewStyle().Foreground(colorAccent).Bold(true)
	blurredLabelStyle = lipgloss.NewStyle().Foreground(colorMuted)

	appStyle = lipgloss.NewStyle().Padding(1, 2)
)
