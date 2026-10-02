package tui

import (
	"image/color"

	"charm.land/bubbles/v2/help"
	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"
)

// palette is the one place colours are defined. lipgloss v2 has no adaptive
// colours, so it is resolved against the terminal background the root learns
// from tea.BackgroundColorMsg and rebuilt when that changes.
type palette struct {
	accent, muted, body, subtle, err, ok color.Color
}

func newPalette(isDark bool) palette {
	pick := lipgloss.LightDark(isDark)
	return palette{
		accent: pick(lipgloss.Color("#7C3AED"), lipgloss.Color("#A78BFA")),
		muted:  pick(lipgloss.Color("#64748B"), lipgloss.Color("#94A3B8")),
		body:   pick(lipgloss.Color("#1E293B"), lipgloss.Color("#E2E8F0")),
		subtle: pick(lipgloss.Color("#CBD5E1"), lipgloss.Color("#475569")),
		err:    pick(lipgloss.Color("#DC2626"), lipgloss.Color("#F87171")),
		ok:     pick(lipgloss.Color("#16A34A"), lipgloss.Color("#4ADE80")),
	}
}

// styles holds every style the shell uses.
type styles struct {
	accent, muted, err, ok lipgloss.Style

	title  lipgloss.Style
	panel  lipgloss.Style
	focus  lipgloss.Style
	notice lipgloss.Style
}

func newStyles(isDark bool) styles {
	p := newPalette(isDark)
	border := lipgloss.NewStyle().Border(lipgloss.RoundedBorder())
	return styles{
		accent: lipgloss.NewStyle().Foreground(p.accent),
		muted:  lipgloss.NewStyle().Foreground(p.muted),
		err:    lipgloss.NewStyle().Foreground(p.err).Bold(true),
		ok:     lipgloss.NewStyle().Foreground(p.ok).Bold(true),
		title:  lipgloss.NewStyle().Foreground(p.accent).Bold(true),
		panel:  border.BorderForeground(p.muted),
		focus:  border.BorderForeground(p.accent),
		notice: lipgloss.NewStyle().Foreground(p.muted).Align(lipgloss.Center),
	}
}

func helpStyles(isDark bool) help.Styles {
	p := newPalette(isDark)
	key := lipgloss.NewStyle().Foreground(p.body).Bold(true)
	desc := lipgloss.NewStyle().Foreground(p.muted)
	sep := lipgloss.NewStyle().Foreground(p.subtle)
	return help.Styles{
		Ellipsis:       desc,
		ShortKey:       key,
		ShortDesc:      desc,
		ShortSeparator: sep,
		FullKey:        key,
		FullDesc:       desc,
		FullSeparator:  sep,
	}
}

// huhTheme sets every colour from the palette. huh v2.0.3's ThemeCharm swaps
// light and dark for body text, so no field may inherit its colours.
func huhTheme(isDark bool) *huh.Styles {
	p := newPalette(isDark)
	t := huh.ThemeBase(isDark)
	fg := func(c color.Color) lipgloss.Style { return lipgloss.NewStyle().Foreground(c) }

	field := func(focused bool) huh.FieldStyles {
		f := huh.FieldStyles{
			Base:           lipgloss.NewStyle().PaddingLeft(1).Border(lipgloss.ThickBorder(), false).BorderLeft(true),
			Title:          fg(p.accent).Bold(true),
			Description:    fg(p.muted),
			ErrorIndicator: fg(p.err).SetString(" *"),
			ErrorMessage:   fg(p.err),

			SelectSelector: fg(p.accent).SetString("> "),
			Option:         fg(p.body),
			NextIndicator:  fg(p.muted).MarginLeft(1).SetString("→"),
			PrevIndicator:  fg(p.muted).MarginRight(1).SetString("←"),

			Directory: fg(p.accent),
			File:      fg(p.body),

			MultiSelectSelector: fg(p.accent).SetString("> "),
			SelectedOption:      fg(p.accent),
			SelectedPrefix:      fg(p.accent).SetString("[x] "),
			UnselectedOption:    fg(p.body),
			UnselectedPrefix:    fg(p.muted).SetString("[ ] "),

			TextInput: huh.TextInputStyles{
				Cursor:      fg(p.accent),
				CursorText:  fg(p.body),
				Placeholder: fg(p.muted),
				Prompt:      fg(p.accent),
				Text:        fg(p.body),
			},

			FocusedButton: lipgloss.NewStyle().Padding(0, 2).MarginRight(1).Foreground(lipgloss.Color("#FFFFFF")).Background(p.accent),
			BlurredButton: lipgloss.NewStyle().Padding(0, 2).MarginRight(1).Foreground(p.body).Background(p.subtle),

			Card:      lipgloss.NewStyle().PaddingLeft(1),
			NoteTitle: fg(p.accent).Bold(true),
			Next:      fg(p.accent),
		}
		if focused {
			f.Base = f.Base.BorderForeground(p.accent)
		} else {
			f.Base = f.Base.BorderStyle(lipgloss.HiddenBorder())
		}
		return f
	}
	t.Focused = field(true)
	t.Blurred = field(false)
	t.Group.Title = fg(p.accent).Bold(true)
	t.Group.Description = fg(p.muted)
	t.Help = helpStyles(isDark)
	return t
}
