package tui

import (
	"image/color"
	"strings"
	"testing"

	"charm.land/huh/v2"
	"charm.land/lipgloss/v2"

	"novusedge/site-cli/actions"
)

func TestFormHeightCapReleases(t *testing.T) {
	var text, path string
	textIn := huh.NewText().Title("Text").Lines(4).Value(&text)
	picker := huh.NewFilePicker().Title("File").CurrentDirectory(t.TempDir()).Picking(true).Height(10).Value(&path)
	o := newFormOverlay(color.Black, nil,
		huh.NewGroup(huh.NewInput().Title("Date"), textIn),
		huh.NewGroup(picker),
	).tall(textIn, picker)
	o.Init()

	view := func(w, h int) int {
		o.SetSize(w, h)
		return lipgloss.Height(o.View())
	}
	natural := view(60, 60)
	small := view(60, 6)
	if small > 6 || small >= natural {
		t.Fatalf("cap not applied: natural %d, capped %d", natural, small)
	}
	if got := view(60, 60); got != natural {
		t.Fatalf("height after growing back = %d, want %d", got, natural)
	}
}

func TestTruncate(t *testing.T) {
	for _, c := range []struct {
		in   string
		w    int
		want string
	}{
		{"short", 10, "short"},
		{"exactly10!", 10, "exactly10!"},
		{"a longer title here", 10, "a longer …"},
		{"日本語のタイトルです", 7, "日本語…"},
	} {
		if got := truncate(c.in, c.w); got != c.want {
			t.Errorf("truncate(%q, %d) = %q, want %q", c.in, c.w, got, c.want)
		}
	}
}

func TestTranslateLogDropsNpmWarnings(t *testing.T) {
	o := &translateOverlay{}
	o.line(actions.ParseTranslateLine("npm warn config production Use --omit=dev instead."))
	o.line(actions.ParseTranslateLine("real output"))
	if len(o.log) != 1 || o.log[0] != "real output" {
		t.Fatalf("log = %q", o.log)
	}
}

func TestTranslateLogWrapsAndFits(t *testing.T) {
	o := &translateOverlay{st: newStyles(true)}
	o.SetSize(30, 12)
	o.log = []string{strings.Repeat("word ", 40), "last line"}
	got := o.View()
	if h := lipgloss.Height(got); h > 12 {
		t.Fatalf("view is %d lines, cap is 12", h)
	}
	for _, l := range strings.Split(got, "\n") {
		if lipgloss.Width(l) > 30 {
			t.Fatalf("line wider than 30: %q", l)
		}
	}
	if !strings.Contains(got, "last line") {
		t.Fatalf("newest line was dropped:\n%s", got)
	}
}
