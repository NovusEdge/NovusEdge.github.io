package actions

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// BlipInput is the user-supplied data for a new blip entry.
type BlipInput struct {
	Date      string // YYYY-MM-DD, defaults to today if empty
	Text      string // optional, max 255 chars
	MediaPath string // optional, source path of a file to copy into assets/
	Tags      []string
}

const maxBlipTextLen = 255

// NewBlip copies the media file (if any) into src/content/blips/assets/ and
// appends the entry to blips.yaml.
func NewBlip(p Paths, in BlipInput) error {
	if len(in.Text) > maxBlipTextLen {
		return fmt.Errorf("text is too long (%d chars, max %d)", len(in.Text), maxBlipTextLen)
	}
	date := strings.TrimSpace(in.Date)
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}

	var mediaFilename string
	if in.MediaPath != "" {
		name, err := copyMediaAsset(p, in.MediaPath)
		if err != nil {
			return err
		}
		mediaFilename = name
	}

	entry := formatBlipEntry(date, in.Text, mediaFilename, in.Tags)
	return appendBlipEntry(p, entry)
}

func copyMediaAsset(p Paths, srcPath string) (string, error) {
	src, err := os.Open(srcPath)
	if err != nil {
		return "", fmt.Errorf("could not open media file: %w", err)
	}
	defer src.Close()

	if err := os.MkdirAll(p.BlipsAssetsDir, 0o755); err != nil {
		return "", err
	}

	base := filepath.Base(srcPath)
	dest := uniqueAssetName(p.BlipsAssetsDir, base)
	out, err := os.OpenFile(filepath.Join(p.BlipsAssetsDir, dest), os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0o644)
	if err != nil {
		return "", err
	}
	defer out.Close()

	if _, err := io.Copy(out, src); err != nil {
		return "", err
	}
	return dest, nil
}

// uniqueAssetName appends -1, -2, ... before the extension if base already
// exists in dir.
func uniqueAssetName(dir, base string) string {
	ext := filepath.Ext(base)
	stem := strings.TrimSuffix(base, ext)
	candidate := base
	for i := 1; ; i++ {
		if _, err := os.Stat(filepath.Join(dir, candidate)); os.IsNotExist(err) {
			return candidate
		}
		candidate = fmt.Sprintf("%s-%d%s", stem, i, ext)
	}
}

func formatBlipEntry(date, text, media string, tags []string) string {
	var b strings.Builder
	b.WriteString("- date: ")
	b.WriteString(date)
	b.WriteString("\n")
	if text != "" {
		fmt.Fprintf(&b, "  text: %s\n", yamlQuote(text))
	}
	if media != "" {
		fmt.Fprintf(&b, "  media: %s\n", media)
	}
	if len(tags) > 0 {
		b.WriteString("  tags: [" + strings.Join(tags, ", ") + "]\n")
	}
	return b.String()
}

func yamlQuote(s string) string {
	return strconv.Quote(s)
}

// appendBlipEntry inserts entry into blips.yaml. The file may currently hold
// the empty flow-style list "[]" (the checked-in placeholder) or a block of
// "- ..." items; either way the new entry is added as a block-style list
// item so existing comments/formatting are preserved.
func appendBlipEntry(p Paths, entry string) error {
	raw, err := os.ReadFile(p.BlipsYAML)
	if err != nil {
		return err
	}
	content := string(raw)

	// Find the first non-comment, non-blank line: that's where the YAML
	// value starts.
	lines := strings.Split(content, "\n")
	valueStart := -1
	for i, l := range lines {
		trimmed := strings.TrimSpace(l)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		valueStart = i
		break
	}

	if valueStart == -1 {
		// File is only comments (or empty); append the value at the end.
		if !strings.HasSuffix(content, "\n") && content != "" {
			content += "\n"
		}
		content += entry
		return os.WriteFile(p.BlipsYAML, []byte(content), 0o644)
	}

	if strings.TrimSpace(lines[valueStart]) == "[]" {
		lines[valueStart] = strings.TrimSuffix(entry, "\n")
		return os.WriteFile(p.BlipsYAML, []byte(strings.Join(lines, "\n")), 0o644)
	}

	// Block-style list already has entries; append at the end of the file.
	if !strings.HasSuffix(content, "\n") {
		content += "\n"
	}
	content += entry
	return os.WriteFile(p.BlipsYAML, []byte(content), 0o644)
}
