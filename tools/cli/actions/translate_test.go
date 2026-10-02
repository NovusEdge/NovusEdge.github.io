package actions

import (
	"reflect"
	"testing"
)

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
