package actions

import (
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

	postsTS := `import { parseFrontmatter } from './frontmatter'

export type Post = {
  slug: string
}

const HIDDEN = ['ai-industry-trends', 'plan-a-ai']

export const posts: Post[] = []
`
	must(os.WriteFile(filepath.Join(root, "src", "lib", "posts.ts"), []byte(postsTS), 0o644))

	thumbsTS := `export function getListThumbnail(slug: string): string | null {
  return getPostThumbnail(slug)
}

export function getPostThumbnail(slug: string): string | null {
  if (slug.includes('tiling-window-managers')) return '/assets/img/LJ-TWM-01.png'
  return null
}
`
	must(os.WriteFile(filepath.Join(root, "src", "lib", "thumbnails.ts"), []byte(thumbsTS), 0o644))

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
	want := "---\ntitle: My Post\ndate: 2026-07-18\ntags: [a, b]\ndescription: desc\n---\n\n"
	if got != want {
		t.Fatalf("unexpected content:\n%q\nwant:\n%q", got, want)
	}

	hidden, err := ReadHidden(p)
	if err != nil {
		t.Fatal(err)
	}
	if !contains(hidden, "my-post") || !contains(hidden, "ai-industry-trends") {
		t.Fatalf("expected my-post to be added, kept existing entries: %v", hidden)
	}

	// Publish it (unhide), then hide again.
	if err := SetHidden(p, "my-post", false); err != nil {
		t.Fatal(err)
	}
	hidden, _ = ReadHidden(p)
	if contains(hidden, "my-post") {
		t.Fatalf("expected my-post to be removed: %v", hidden)
	}
	if err := SetHidden(p, "my-post", true); err != nil {
		t.Fatal(err)
	}
	hidden, _ = ReadHidden(p)
	if !contains(hidden, "my-post") {
		t.Fatalf("expected my-post back in hidden: %v", hidden)
	}
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

func TestSetThumbnail(t *testing.T) {
	p := setupFixture(t)
	if err := SetThumbnail(p, "hello-world", "/assets/img/hw.png"); err != nil {
		t.Fatal(err)
	}
	got, ok, err := GetThumbnail(p, "hello-world")
	if err != nil || !ok || got != "/assets/img/hw.png" {
		t.Fatalf("got=%q ok=%v err=%v", got, ok, err)
	}
	// Update existing mapping.
	if err := SetThumbnail(p, "hello-world", "/assets/img/hw2.png"); err != nil {
		t.Fatal(err)
	}
	got, _, _ = GetThumbnail(p, "hello-world")
	if got != "/assets/img/hw2.png" {
		t.Fatalf("expected updated thumbnail, got %q", got)
	}
	// Existing unrelated mapping untouched.
	got2, ok2, _ := GetThumbnail(p, "tiling-window-managers-post")
	_ = got2
	_ = ok2
	raw, _ := os.ReadFile(p.ThumbnailsFile)
	if !strings.Contains(string(raw), "tiling-window-managers") {
		t.Fatalf("clobbered existing mapping:\n%s", raw)
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

func TestNewBlip(t *testing.T) {
	p := setupFixture(t)
	if err := NewBlip(p, BlipInput{Date: "2026-07-18", Text: "shipped it", Tags: []string{"meta"}}); err != nil {
		t.Fatal(err)
	}
	raw, _ := os.ReadFile(p.BlipsYAML)
	s := string(raw)
	if !strings.Contains(s, "date: 2026-07-18") || !strings.Contains(s, `text: "shipped it"`) || !strings.Contains(s, "tags: [meta]") {
		t.Fatalf("unexpected blips.yaml:\n%s", s)
	}
	if strings.Contains(s, "[]") {
		t.Fatalf("placeholder [] should have been replaced:\n%s", s)
	}

	// A second blip should append, not clobber the first.
	if err := NewBlip(p, BlipInput{Date: "2026-07-19", Text: "second one"}); err != nil {
		t.Fatal(err)
	}
	raw, _ = os.ReadFile(p.BlipsYAML)
	s = string(raw)
	if !strings.Contains(s, "shipped it") || !strings.Contains(s, "second one") {
		t.Fatalf("expected both blips present:\n%s", s)
	}
}

func TestNewBlipMediaCopy(t *testing.T) {
	p := setupFixture(t)
	srcDir := t.TempDir()
	src := filepath.Join(srcDir, "shot.png")
	if err := os.WriteFile(src, []byte("fake png bytes"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := NewBlip(p, BlipInput{MediaPath: src}); err != nil {
		t.Fatal(err)
	}
	dest := filepath.Join(p.BlipsAssetsDir, "shot.png")
	if _, err := os.Stat(dest); err != nil {
		t.Fatalf("expected copied asset at %s: %v", dest, err)
	}
	raw, _ := os.ReadFile(p.BlipsYAML)
	if !strings.Contains(string(raw), "media: shot.png") {
		t.Fatalf("expected media reference:\n%s", raw)
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
