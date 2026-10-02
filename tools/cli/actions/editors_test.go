package actions

import (
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

func TestFindEditors(t *testing.T) {
	dir := t.TempDir()
	for _, name := range []string{"nvim", "nano", "zed", "marktext", "custom"} {
		if err := os.WriteFile(filepath.Join(dir, name), []byte("#!/bin/sh\n"), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	// vi is a second name for nvim and must not be listed twice.
	if err := os.Symlink(filepath.Join(dir, "nvim"), filepath.Join(dir, "vi")); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", dir)

	tests := []struct {
		name           string
		visual, editor string
		want           []string
	}{
		{"fixed only", "", "", []string{"nvim", "nano", "zed", "marktext"}},
		{"env with args first", "", "custom --wait", []string{"custom", "nvim", "nano", "zed", "marktext"}},
		{"env duplicate of nvim", "", "vi", []string{"vi", "nano", "zed", "marktext"}},
		{"env missing", "ghost", "  ", []string{"nvim", "nano", "zed", "marktext"}},
	}
	for _, tt := range tests {
		var got []string
		for _, e := range FindEditors(tt.visual, tt.editor) {
			got = append(got, e.Name)
		}
		if !reflect.DeepEqual(got, tt.want) {
			t.Errorf("%s: got %v, want %v", tt.name, got, tt.want)
		}
	}

	eds := FindEditors("", "custom --wait")
	if e := eds[0]; !e.Terminal || !reflect.DeepEqual(e.Args, []string{"--wait"}) {
		t.Errorf("env editor = %+v", e)
	}
	for _, e := range eds {
		if e.Name == "zed" && e.Terminal {
			t.Error("zed must be a GUI editor")
		}
	}
	if got := eds[0].Command("p.md").Args; !reflect.DeepEqual(got[1:], []string{"--wait", "p.md"}) {
		t.Errorf("command args = %v", got)
	}
}
