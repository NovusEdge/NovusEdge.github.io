package actions

import (
	"fmt"
	"regexp"
	"strings"
)

// frontmatter is intentionally simple: the blog posts in this repo use a flat
// key: value YAML frontmatter block (see src/lib/frontmatter.ts on the site
// side). We parse it as an ordered list of raw lines so we can round-trip
// edits without reformatting fields we don't touch.
type Frontmatter struct {
	Lines []string // raw "key: value" lines, in original order
	Body  string    // everything after the closing ---
}

var fmBlockRe = regexp.MustCompile(`(?s)\A---\n(.*?)\n---\n?(.*)\z`)

// ParseFrontmatter splits a markdown file's contents into its frontmatter
// lines and body. Returns ok=false if no frontmatter block is present.
func ParseFrontmatter(content string) (fm Frontmatter, ok bool) {
	m := fmBlockRe.FindStringSubmatch(content)
	if m == nil {
		return Frontmatter{}, false
	}
	raw := m[1]
	var lines []string
	if raw != "" {
		lines = strings.Split(raw, "\n")
	}
	return Frontmatter{Lines: lines, Body: m[2]}, true
}

// String renders the frontmatter block back into full markdown file contents.
func (fm Frontmatter) String() string {
	var b strings.Builder
	b.WriteString("---\n")
	for _, l := range fm.Lines {
		b.WriteString(l)
		b.WriteString("\n")
	}
	b.WriteString("---\n")
	if fm.Body != "" {
		b.WriteString(fm.Body)
	}
	return b.String()
}

// Get returns the raw value of a "key: value" line, if present.
func (fm Frontmatter) Get(key string) (string, bool) {
	prefix := key + ":"
	for _, l := range fm.Lines {
		if strings.HasPrefix(strings.TrimSpace(l), prefix) {
			return strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(l), prefix)), true
		}
	}
	return "", false
}

// Set replaces the value of an existing "key: ..." line, or appends a new
// one if the key isn't present yet.
func (fm *Frontmatter) Set(key, value string) {
	prefix := key + ":"
	for i, l := range fm.Lines {
		if strings.HasPrefix(strings.TrimSpace(l), prefix) {
			fm.Lines[i] = fmt.Sprintf("%s: %s", key, value)
			return
		}
	}
	fm.Lines = append(fm.Lines, fmt.Sprintf("%s: %s", key, value))
}

// TagsValue formats a tag slice the way the site's frontmatter expects:
// tags: [a, b, c]
func TagsValue(tags []string) string {
	return "[" + strings.Join(tags, ", ") + "]"
}

// ParseTagsValue parses a "[a, b, c]" style value into a slice. Falls back to
// treating the whole string as a single tag if it isn't bracketed.
func ParseTagsValue(v string) []string {
	v = strings.TrimSpace(v)
	v = strings.TrimPrefix(v, "[")
	v = strings.TrimSuffix(v, "]")
	if v == "" {
		return nil
	}
	parts := strings.Split(v, ",")
	tags := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		p = strings.Trim(p, `"'`)
		if p != "" {
			tags = append(tags, p)
		}
	}
	return tags
}
