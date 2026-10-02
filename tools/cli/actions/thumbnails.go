package actions

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
)

// Thumb is one slug's entry in src/content/thumbnails.json. List falls back
// to Hero on the site when empty.
type Thumb struct {
	Hero string `json:"hero"`
	List string `json:"list,omitempty"`
}

func readThumbnails(p Paths) (map[string]Thumb, error) {
	raw, err := os.ReadFile(p.ThumbnailsFile)
	if err != nil {
		return nil, err
	}
	m := map[string]Thumb{}
	if err := json.Unmarshal(raw, &m); err != nil {
		return nil, fmt.Errorf("parse %s: %w", p.ThumbnailsFile, err)
	}
	return m, nil
}

// GetThumbnail returns the entry for slug and whether one exists.
func GetThumbnail(p Paths, slug string) (Thumb, bool, error) {
	m, err := readThumbnails(p)
	if err != nil {
		return Thumb{}, false, err
	}
	t, ok := m[slug]
	return t, ok, nil
}

// SetThumbnail stores t for slug, or removes the slug when t is empty. The
// file is rewritten in its checked-in layout (sorted keys, one entry per
// line) so unchanged entries stay byte-identical and diffs show one line.
func SetThumbnail(p Paths, slug string, t Thumb) error {
	m, err := readThumbnails(p)
	if err != nil {
		return err
	}
	if t == (Thumb{}) {
		delete(m, slug)
	} else {
		m[slug] = t
	}

	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var b strings.Builder
	b.WriteString("{")
	for i, k := range keys {
		if i > 0 {
			b.WriteString(",")
		}
		e := m[k]
		b.WriteString("\n  " + jsonString(k) + ": { \"hero\": " + jsonString(e.Hero))
		if e.List != "" {
			b.WriteString(", \"list\": " + jsonString(e.List))
		}
		b.WriteString(" }")
	}
	if len(keys) > 0 {
		b.WriteString("\n")
	}
	b.WriteString("}\n")
	return os.WriteFile(p.ThumbnailsFile, []byte(b.String()), 0o644)
}

// jsonString quotes s without escaping <, > and & the way json.Marshal does.
func jsonString(s string) string {
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	enc.SetEscapeHTML(false)
	_ = enc.Encode(s)
	return strings.TrimSuffix(buf.String(), "\n")
}

// ValidateAssetPath checks that path is a site-absolute URL path ("/assets/...")
// naming an existing file under public/.
func ValidateAssetPath(p Paths, path string) error {
	if !strings.HasPrefix(path, "/") {
		return fmt.Errorf("path must start with /, got %q", path)
	}
	info, err := os.Stat(p.PublicDir + path)
	if err != nil || info.IsDir() {
		return fmt.Errorf("no file at public%s", path)
	}
	return nil
}
