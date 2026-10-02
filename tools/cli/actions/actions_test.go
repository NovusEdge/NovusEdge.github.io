package actions

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// setupFixture builds a temp repo tree mirroring the real project's shape
// with realistic starting content, so the regex-based edits are exercised
// against the actual file formats rather than toy strings.
func setupFixture(t *testing.T) Paths {
	t.Helper()
	root := t.TempDir()
	must := func(err error) {
		t.Helper()
		if err != nil {
			t.Fatal(err)
		}
	}
	must(os.MkdirAll(filepath.Join(root, "src", "content", "blog"), 0o755))
	must(os.MkdirAll(filepath.Join(root, "src", "content", "blips"), 0o755))
	must(os.MkdirAll(filepath.Join(root, "src", "lib"), 0o755))

	must(os.WriteFile(filepath.Join(root, "src", "content", "blog", "hello-world.md"),
		[]byte("---\ntitle: Hello World\ndate: 2020-01-01\ntags: [personal]\ndescription: first post\n---\n\nbody\n"), 0o644))

	must(os.WriteFile(filepath.Join(root, "src", "content", "blog", "ai-industry-trends.md"),
		[]byte("---\ntitle: AI Industry Trends\ndate: 2026-01-01\ntags: [ai]\ndescription: draft post\ndraft: true\n---\n\nbody\n"), 0o644))

	must(os.MkdirAll(filepath.Join(root, "public", "assets"), 0o755))
	must(os.WriteFile(filepath.Join(root, "public", "assets", "a.png"), []byte("png"), 0o644))
	thumbsJSON := "{\n  \"aaa\": { \"hero\": \"/assets/a.png\" },\n  \"zzz\": { \"hero\": \"/assets/z.png\", \"list\": \"/assets/z-list.png\" }\n}\n"
	must(os.WriteFile(filepath.Join(root, "src", "content", "thumbnails.json"), []byte(thumbsJSON), 0o644))

	papersTS := `export type Paper = {
  slug: string
}

export const papers: Paper[] = [
  {
    slug: 'beyond-retrieval',
    title: 'Beyond Retrieval',
  },
]
`
	must(os.WriteFile(filepath.Join(root, "src", "content", "papers.ts"), []byte(papersTS), 0o644))

	blipsYAML := `# blips - short-form updates
#
# schema (one entry per - item):
#   date: YYYY-MM-DD    (required)

[]
`
	must(os.WriteFile(filepath.Join(root, "src", "content", "blips", "blips.yaml"), []byte(blipsYAML), 0o644))

	return NewPaths(root)
}

func TestNewBlogAndHidden(t *testing.T) {
	p := setupFixture(t)
	err := NewBlog(p, BlogInput{Slug: "my-post", Title: "My Post", Date: "2026-07-18", Tags: []string{"a", "b"}, Description: "desc"})
	if err != nil {
		t.Fatal(err)
	}
	raw, err := os.ReadFile(PostFilePath(p, "my-post"))
	if err != nil {
		t.Fatal(err)
	}
	got := string(raw)
	want := "---\ntitle: My Post\ndate: 2026-07-18\ntags: [a, b]\ndescription: desc\ndraft: true\n---\n\n"
	if got != want {
		t.Fatalf("unexpected content:\n%q\nwant:\n%q", got, want)
	}

	hidden := hiddenSlugs(t, p)
	if !contains(hidden, "my-post") || !contains(hidden, "ai-industry-trends") {
		t.Fatalf("expected my-post to be added, kept existing entries: %v", hidden)
	}

	// Publish it (unhide), then hide again.
	if err := SetHidden(p, "my-post", false); err != nil {
		t.Fatal(err)
	}
	hidden = hiddenSlugs(t, p)
	if contains(hidden, "my-post") {
		t.Fatalf("expected my-post to be removed: %v", hidden)
	}
	if err := SetHidden(p, "my-post", true); err != nil {
		t.Fatal(err)
	}
	hidden = hiddenSlugs(t, p)
	if !contains(hidden, "my-post") {
		t.Fatalf("expected my-post back in hidden: %v", hidden)
	}
}

func hiddenSlugs(t *testing.T, p Paths) []string {
	t.Helper()
	posts, err := ListPosts(p)
	if err != nil {
		t.Fatal(err)
	}
	var slugs []string
	for _, post := range posts {
		if post.Hidden {
			slugs = append(slugs, post.Slug)
		}
	}
	return slugs
}

func TestEditTags(t *testing.T) {
	p := setupFixture(t)
	if err := EditTags(p, "hello-world", []string{"x", "y", "z"}); err != nil {
		t.Fatal(err)
	}
	tags, err := GetTags(p, "hello-world")
	if err != nil {
		t.Fatal(err)
	}
	if len(tags) != 3 || tags[0] != "x" || tags[2] != "z" {
		t.Fatalf("unexpected tags: %v", tags)
	}
	raw, _ := os.ReadFile(PostFilePath(p, "hello-world"))
	if !strings.Contains(string(raw), "title: Hello World") || !strings.Contains(string(raw), "body") {
		t.Fatalf("EditTags clobbered unrelated content:\n%s", raw)
	}
}

func TestThumbnailRoundTrip(t *testing.T) {
	p := setupFixture(t)
	orig, _ := os.ReadFile(p.ThumbnailsFile)
	if err := SetThumbnail(p, "aaa", Thumb{Hero: "/assets/a.png"}); err != nil {
		t.Fatal(err)
	}
	got, _ := os.ReadFile(p.ThumbnailsFile)
	if string(got) != string(orig) {
		t.Fatalf("no-op set changed bytes:\n%s", got)
	}

	if err := SetThumbnail(p, "mmm", Thumb{Hero: "/assets/m.png?a=1&b=2"}); err != nil {
		t.Fatal(err)
	}
	got, _ = os.ReadFile(p.ThumbnailsFile)
	want := "{\n  \"aaa\": { \"hero\": \"/assets/a.png\" },\n  \"mmm\": { \"hero\": \"/assets/m.png?a=1&b=2\" },\n  \"zzz\": { \"hero\": \"/assets/z.png\", \"list\": \"/assets/z-list.png\" }\n}\n"
	if string(got) != want {
		t.Fatalf("got:\n%s\nwant:\n%s", got, want)
	}
	th, ok, err := GetThumbnail(p, "zzz")
	if err != nil || !ok || th.List != "/assets/z-list.png" {
		t.Fatalf("got=%+v ok=%v err=%v", th, ok, err)
	}
	if _, ok, _ := GetThumbnail(p, "nope"); ok {
		t.Fatal("unexpected entry for missing slug")
	}
}

func TestSetThumbnailEmptyDeletes(t *testing.T) {
	p := setupFixture(t)
	if err := SetThumbnail(p, "zzz", Thumb{}); err != nil {
		t.Fatal(err)
	}
	got, _ := os.ReadFile(p.ThumbnailsFile)
	if want := "{\n  \"aaa\": { \"hero\": \"/assets/a.png\" }\n}\n"; string(got) != want {
		t.Fatalf("got:\n%s", got)
	}
	if err := SetThumbnail(p, "aaa", Thumb{}); err != nil {
		t.Fatal(err)
	}
	got, _ = os.ReadFile(p.ThumbnailsFile)
	if string(got) != "{}\n" {
		t.Fatalf("got:\n%s", got)
	}
}

func TestValidateAssetPath(t *testing.T) {
	p := setupFixture(t)
	cases := map[string]bool{
		"/assets/a.png":           true,
		"assets/a.png":            false,
		"/assets/missing.png":     false,
		"/assets":                 false,
		"/../package.json":        false,
		"/assets/../../x":         false,
		"/assets/../a.png":        false,
		"/assets/../assets/a.png": true,
	}
	if err := os.WriteFile(filepath.Join(p.Root, "package.json"), []byte("{}"), 0o644); err != nil {
		t.Fatal(err)
	}
	for path, want := range cases {
		if err := ValidateAssetPath(p, path); (err == nil) != want {
			t.Errorf("ValidateAssetPath(%q) = %v, want ok=%v", path, err, want)
		}
	}
}

func writeTranslation(t *testing.T, p Paths, locale, slug, content string) string {
	t.Helper()
	dir := filepath.Join(p.TranslationsDir, locale)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(dir, slug+".md")
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
	return path
}

func TestEditTagsSyncsTranslations(t *testing.T) {
	p := setupFixture(t)
	de := writeTranslation(t, p, "de", "hello-world", "---\ntitle: Hallo\ntags: [personal]\n---\n\nkoerper\n")
	fi := writeTranslation(t, p, "fi", "hello-world", "---\ntitle: Moi\ntags: [personal]\n---\n\nrunko\n")
	writeTranslation(t, p, "ja", "other-post", "---\ntitle: x\ntags: [q]\n---\n")

	locales, err := PostLocales(p, "hello-world")
	if err != nil || len(locales) != 2 || locales[0] != "de" || locales[1] != "fi" {
		t.Fatalf("locales=%v err=%v", locales, err)
	}
	if err := EditTags(p, "hello-world", []string{"x", "y"}); err != nil {
		t.Fatal(err)
	}
	for _, path := range []string{PostFilePath(p, "hello-world"), de, fi} {
		raw, _ := os.ReadFile(path)
		if !strings.Contains(string(raw), "tags: [x, y]\n") {
			t.Errorf("%s not updated:\n%s", path, raw)
		}
	}
	raw, _ := os.ReadFile(de)
	if !strings.Contains(string(raw), "koerper") {
		t.Errorf("body lost:\n%s", raw)
	}
}

func TestEditTagsTranslationWithoutFrontmatter(t *testing.T) {
	p := setupFixture(t)
	bad := writeTranslation(t, p, "de", "hello-world", "no frontmatter here\n")
	before, _ := os.ReadFile(PostFilePath(p, "hello-world"))
	err := EditTags(p, "hello-world", []string{"x"})
	if err == nil || !strings.Contains(err.Error(), bad) {
		t.Fatalf("expected error naming %s, got %v", bad, err)
	}
	after, _ := os.ReadFile(PostFilePath(p, "hello-world"))
	if string(before) != string(after) {
		t.Fatalf("English file changed:\n%s", after)
	}
}

func TestSetHiddenEnglishOnly(t *testing.T) {
	p := setupFixture(t)
	de := writeTranslation(t, p, "de", "hello-world", "---\ntitle: Hallo\n---\n")
	if err := SetHidden(p, "hello-world", true); err != nil {
		t.Fatal(err)
	}
	raw, _ := os.ReadFile(de)
	if strings.Contains(string(raw), "draft") {
		t.Fatalf("translation modified:\n%s", raw)
	}
}

func TestSlugify(t *testing.T) {
	cases := map[string]string{
		"Hello World":            "hello-world",
		"  Spaces   &  Symbols!": "spaces-symbols",
		"Already-kebab":          "already-kebab",
		"Version 2.0 release":    "version-2-0-release",
		"Café au lait":           "caf-au-lait",
		"---":                    "",
		"日本語 post":               "post",
	}
	for in, want := range cases {
		got := Slugify(in)
		if got != want {
			t.Errorf("Slugify(%q) = %q, want %q", in, got, want)
		}
		if got != "" && ValidateSlug(got) != nil {
			t.Errorf("Slugify(%q) = %q fails ValidateSlug", in, got)
		}
	}
}

func TestNewPaper(t *testing.T) {
	p := setupFixture(t)
	err := NewPaper(p, PaperInput{
		Slug: "new-paper", Title: "New Paper", Venue: "Preprint", Date: "2026",
		Abstract: "abstract text", URL: "https://example.com",
		Links: []PaperLink{{Label: "site", Href: "https://example.com"}},
	})
	if err != nil {
		t.Fatal(err)
	}
	raw, _ := os.ReadFile(p.PapersFile)
	s := string(raw)
	if !strings.Contains(s, "slug: 'new-paper'") || !strings.Contains(s, "slug: 'beyond-retrieval'") {
		t.Fatalf("expected both papers present:\n%s", s)
	}
	if strings.Count(s, "export const papers") != 1 {
		t.Fatalf("array header duplicated:\n%s", s)
	}
}

func TestNewPaperRejectsExistingSlug(t *testing.T) {
	p := setupFixture(t)
	slugs, err := PaperSlugs(p)
	if err != nil || !contains(slugs, "beyond-retrieval") {
		t.Fatalf("PaperSlugs = %v, %v", slugs, err)
	}
	err = NewPaper(p, PaperInput{Slug: "beyond-retrieval", Title: "T", URL: "https://example.com"})
	if err == nil || !strings.Contains(err.Error(), "already exists") {
		t.Fatalf("expected duplicate slug error, got %v", err)
	}
}

func TestNewBlipPlaceholderAndTopInsert(t *testing.T) {
	p := setupFixture(t)
	if err := NewBlip(p, BlipInput{Date: "2026-07-18", Text: "shipped it", Tags: []string{"meta"}}); err != nil {
		t.Fatal(err)
	}
	raw, _ := os.ReadFile(p.BlipsYAML)
	s := string(raw)
	if !strings.Contains(s, "date: 2026-07-18") || !strings.Contains(s, `text: "shipped it"`) || !strings.Contains(s, "tags: [meta]") {
		t.Fatalf("unexpected blips.yaml:\n%s", s)
	}
	if strings.Contains(s, "[]\n") {
		t.Fatalf("placeholder [] should have been replaced:\n%s", s)
	}

	if err := NewBlip(p, BlipInput{Date: "2026-07-19", Text: "second one"}); err != nil {
		t.Fatal(err)
	}
	raw, _ = os.ReadFile(p.BlipsYAML)
	s = string(raw)
	if strings.Index(s, "second one") > strings.Index(s, "shipped it") {
		t.Fatalf("newest entry should come first:\n%s", s)
	}
	if !strings.Contains(s, "  text: \"second one\"\n\n- date: 2026-07-18") {
		t.Fatalf("entries should be blank-line separated:\n%s", s)
	}
}

func TestNewBlipInsertsAfterHeader(t *testing.T) {
	p := setupFixture(t)
	existing := "# header\n\n- date: 2026-01-01\n  text: \"old\"\n\n# note\n- date: 2025-12-31\n  text: \"older\"\n"
	if err := os.WriteFile(p.BlipsYAML, []byte(existing), 0o644); err != nil {
		t.Fatal(err)
	}
	src := filepath.Join(t.TempDir(), "one.jpg")
	os.WriteFile(src, []byte("x"), 0o644)
	if err := NewBlip(p, BlipInput{Date: "2026-02-02", Text: "new", MediaPaths: []string{src}}); err != nil {
		t.Fatal(err)
	}
	raw, _ := os.ReadFile(p.BlipsYAML)
	want := "# header\n\n- date: 2026-02-02\n  text: \"new\"\n  media: one.jpg\n\n- date: 2026-01-01\n  text: \"old\"\n\n# note\n- date: 2025-12-31\n  text: \"older\"\n"
	if string(raw) != want {
		t.Fatalf("got:\n%s\nwant:\n%s", raw, want)
	}
}

func TestNewBlipTwoMediaAndCopy(t *testing.T) {
	p := setupFixture(t)
	srcDir := t.TempDir()
	var srcs []string
	for _, n := range []string{"a.png", "b.png"} {
		src := filepath.Join(srcDir, n)
		if err := os.WriteFile(src, []byte("fake"), 0o644); err != nil {
			t.Fatal(err)
		}
		srcs = append(srcs, src)
	}
	if err := NewBlip(p, BlipInput{Date: "2026-03-03", MediaPaths: srcs}); err != nil {
		t.Fatal(err)
	}
	for _, n := range []string{"a.png", "b.png"} {
		if _, err := os.Stat(filepath.Join(p.BlipsAssetsDir, n)); err != nil {
			t.Fatalf("expected copied asset %s: %v", n, err)
		}
	}
	raw, _ := os.ReadFile(p.BlipsYAML)
	if !strings.Contains(string(raw), "  media: [a.png, b.png]\n") {
		t.Fatalf("expected flow list:\n%s", raw)
	}
}

func TestNewBlipCommentOnlyAndEmptyFile(t *testing.T) {
	for name, start := range map[string]string{"comment-only": "# header\n", "empty": ""} {
		p := setupFixture(t)
		os.WriteFile(p.BlipsYAML, []byte(start), 0o644)
		if err := NewBlip(p, BlipInput{Date: "2026-04-04", Text: "hi"}); err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		raw, _ := os.ReadFile(p.BlipsYAML)
		if want := start + "- date: 2026-04-04\n  text: \"hi\"\n"; string(raw) != want {
			t.Fatalf("%s: got %q want %q", name, raw, want)
		}
	}
}

func TestNewBlipRejectsBadDate(t *testing.T) {
	p := setupFixture(t)
	for _, d := range []string{"2026-13-01", "2026-02-30", "26-01-01", "yesterday"} {
		if err := NewBlip(p, BlipInput{Date: d, Text: "x"}); err == nil {
			t.Errorf("date %q accepted", d)
		}
	}
}

func TestNewBlipRemovesAssetsWhenInsertFails(t *testing.T) {
	p := setupFixture(t)
	if err := os.Remove(p.BlipsYAML); err != nil {
		t.Fatal(err)
	}
	if err := os.Mkdir(p.BlipsYAML, 0o755); err != nil {
		t.Fatal(err)
	}
	src := filepath.Join(t.TempDir(), "shot.png")
	if err := os.WriteFile(src, []byte("png"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := NewBlip(p, BlipInput{Date: "2026-03-03", MediaPaths: []string{src}}); err == nil {
		t.Fatal("expected an error")
	}
	entries, _ := os.ReadDir(p.BlipsAssetsDir)
	if len(entries) != 0 {
		t.Errorf("assets left behind: %v", entries)
	}
}

func TestValidateSlug(t *testing.T) {
	cases := map[string]bool{
		"my-post":   true,
		"my_post":   false,
		"My-Post":   false,
		"":          false,
		"a":         true,
		"a-b-c-123": true,
	}
	for slug, want := range cases {
		if err := ValidateSlug(slug); (err == nil) != want {
			t.Errorf("ValidateSlug(%q) = %v, want ok=%v", slug, err, want)
		}
	}
}

func contains(ss []string, s string) bool {
	for _, x := range ss {
		if x == s {
			return true
		}
	}
	return false
}

func TestNewPaperEscapesStrings(t *testing.T) {
	p := setupFixture(t)
	abstract := "line one\nline \"two\" it's a back\\slash\tand ä"
	err := NewPaper(p, PaperInput{
		Slug: "tricky", Title: "It's \"quoted\"", Venue: "v", Date: "2026",
		Abstract: abstract, URL: "https://example.com/?a=1&b=<2>",
	})
	if err != nil {
		t.Fatal(err)
	}
	raw, _ := os.ReadFile(p.PapersFile)
	for _, line := range strings.Split(string(raw), "\n") {
		trimmed := strings.TrimSpace(line)
		if !strings.HasPrefix(trimmed, "abstract: ") {
			continue
		}
		lit := strings.TrimSuffix(strings.TrimPrefix(trimmed, "abstract: "), ",")
		var got string
		if err := json.Unmarshal([]byte(lit), &got); err != nil || got != abstract {
			t.Fatalf("abstract literal %s -> %q, %v", lit, got, err)
		}
		if !strings.Contains(string(raw), "url: \"https://example.com/?a=1&b=<2>\"") {
			t.Fatalf("url escaped unexpectedly:\n%s", raw)
		}
		slugs, _ := PaperSlugs(p)
		if !contains(slugs, "tricky") {
			t.Fatalf("slug not found: %v", slugs)
		}
		return
	}
	t.Fatalf("no abstract line:\n%s", raw)
}

func TestNewBlipTextRoundTripsSiteParser(t *testing.T) {
	p := setupFixture(t)
	if err := NewBlip(p, BlipInput{Date: "2026-05-05", Text: "she said \"hi\"\nthen  left"}); err != nil {
		t.Fatal(err)
	}
	raw, _ := os.ReadFile(p.BlipsYAML)
	var line string
	for _, l := range strings.Split(string(raw), "\n") {
		if strings.HasPrefix(strings.TrimSpace(l), "text:") {
			line = strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(l), "text:"))
		}
	}
	// Mirrors parseValue in src/lib/blips.ts: strip one quote at each end.
	got := strings.TrimSuffix(strings.TrimPrefix(line, `"`), `"`)
	if want := `she said "hi" then left`; got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}

func TestNewBlipCountsRunes(t *testing.T) {
	p := setupFixture(t)
	if err := NewBlip(p, BlipInput{Date: "2026-05-05", Text: strings.Repeat("ä", 255)}); err != nil {
		t.Fatalf("255 runes rejected: %v", err)
	}
	if err := NewBlip(p, BlipInput{Date: "2026-05-05", Text: strings.Repeat("ä", 256)}); err == nil {
		t.Fatal("256 runes accepted")
	}
}

func TestCopyMediaSanitizesName(t *testing.T) {
	p := setupFixture(t)
	src := filepath.Join(t.TempDir(), "my shot, final [1].png")
	os.WriteFile(src, []byte("x"), 0o644)
	if err := NewBlip(p, BlipInput{Date: "2026-05-05", MediaPaths: []string{src}}); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(p.BlipsAssetsDir, "my-shot-final-1-.png")); err != nil {
		t.Fatal(err)
	}
}

func TestListPostsStripsQuotes(t *testing.T) {
	p := setupFixture(t)
	os.WriteFile(filepath.Join(p.BlogDir, "q.md"),
		[]byte("---\ntitle: \"Shader Journeys: Part 1\"\ndate: 2026-02-02\ndescription: 'It is fine'\n---\n\nbody\n"), 0o644)
	posts, err := ListPosts(p)
	if err != nil {
		t.Fatal(err)
	}
	for _, m := range posts {
		if m.Slug == "q" && (m.Title != "Shader Journeys: Part 1" || m.Description != "It is fine") {
			t.Fatalf("got %q / %q", m.Title, m.Description)
		}
	}
}
