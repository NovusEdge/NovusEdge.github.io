package actions

import (
	"errors"
	"os/exec"
	"reflect"
	"strings"
	"testing"
)

func TestInterpretCheck(t *testing.T) {
	exit1 := exec.Command("sh", "-c", "exit 1").Run()
	exit2 := exec.Command("sh", "-c", "exit 2").Run()
	if exit1 == nil || exit2 == nil {
		t.Fatal("expected exit errors")
	}
	report := "stale posts: a\nmissing translations: de/b\n"

	tests := []struct {
		name    string
		runErr  error
		stderr  string
		wantErr string // substring; empty means no error
		stale   int
	}{
		{"clean", nil, "", "", 0},
		{"exit 1 with report", exit1, report, "", 1},
		{"exit 1 crash", exit1, "Error: Cannot find module 'x'\n", "Cannot find module", 0},
		{"exit 1 silent", exit1, "", "exit status 1", 0},
		{"exit 2 with stderr", exit2, "boom\n", "boom", 0},
		{"start failure", errors.New("exec: node: not found"), "", "node: not found", 0},
	}
	for _, tt := range tests {
		stale, _, err := interpretCheck(tt.runErr, tt.stderr)
		if tt.wantErr == "" {
			if err != nil || len(stale) != tt.stale {
				t.Errorf("%s: stale=%v err=%v", tt.name, stale, err)
			}
			continue
		}
		if err == nil || !strings.Contains(err.Error(), tt.wantErr) {
			t.Errorf("%s: err = %v, want containing %q", tt.name, err, tt.wantErr)
		}
	}
}

func TestParseTranslateLine(t *testing.T) {
	tests := []struct {
		line string
		want TranslateEvent
	}{
		{"translating 8 file(s)", TranslateEvent{Kind: TranslateTotal, Total: 8}},
		{"translating x file(s)", TranslateEvent{Kind: TranslateLog}},
		{"nothing to translate", TranslateEvent{Kind: TranslateNothing}},
		{"wrote src/content/blog/translations/de/my-post.md", TranslateEvent{Kind: TranslateWrote, Locale: "de", Slug: "my-post"}},
		{"wrote /abs/repo/src/content/blog/translations/ja/other.md", TranslateEvent{Kind: TranslateWrote, Locale: "ja", Slug: "other"}},
		{"wrote somewhere/else.md", TranslateEvent{Kind: TranslateLog}},
		{"lock updated for 2 post(s)", TranslateEvent{Kind: TranslateLog}},
	}
	for _, tt := range tests {
		tt.want.Line = tt.line
		if got := ParseTranslateLine(tt.line); got != tt.want {
			t.Errorf("ParseTranslateLine(%q) = %+v, want %+v", tt.line, got, tt.want)
		}
	}
}

func TestParseTranslationCheck(t *testing.T) {
	stale, missing := ParseTranslationCheck(
		"stale posts: a, b\nmissing translations: de/a, fi/a, de/c\n")
	if want := map[string]bool{"a": true, "b": true}; !reflect.DeepEqual(stale, want) {
		t.Errorf("stale = %v, want %v", stale, want)
	}
	want := map[string][]string{"a": {"de", "fi"}, "c": {"de"}}
	if !reflect.DeepEqual(missing, want) {
		t.Errorf("missing = %v, want %v", missing, want)
	}

	stale, missing = ParseTranslationCheck("")
	if len(stale) != 0 || len(missing) != 0 {
		t.Errorf("empty input gave stale=%v missing=%v", stale, missing)
	}
}
