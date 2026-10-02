package tui

import (
	"slices"
	"testing"
)

func TestSplitTags(t *testing.T) {
	for _, c := range []struct {
		in   string
		want []string
	}{
		{"", nil},
		{" , ,", nil},
		{"go", []string{"go"}},
		{"go, ml ,  rust", []string{"go", "ml", "rust"}},
		{"a,,b", []string{"a", "b"}},
	} {
		if got := splitTags(c.in); !slices.Equal(got, c.want) {
			t.Errorf("splitTags(%q) = %q, want %q", c.in, got, c.want)
		}
	}
}

func TestValidDate(t *testing.T) {
	for _, c := range []struct {
		in string
		ok bool
	}{
		{"2026-10-02", true},
		{" 2026-10-02 ", true},
		{"2026-02-30", false},
		{"2026-1-2", false},
		{"10/02/2026", false},
		{"", false},
	} {
		if err := validDate(c.in); (err == nil) != c.ok {
			t.Errorf("validDate(%q) = %v, want ok=%v", c.in, err, c.ok)
		}
	}
}
