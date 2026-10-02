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
	Date       string   // YYYY-MM-DD, defaults to today if empty
	Text       string   // optional, max 255 chars
	MediaPaths []string // optional, source paths of files to copy into assets/
	Tags       []string
}

const maxBlipTextLen = 255

// NewBlip copies the media files (if any) into src/content/blips/assets/ and
// inserts the entry at the top of blips.yaml.
func NewBlip(p Paths, in BlipInput) error {
	if len(in.Text) > maxBlipTextLen {
		return fmt.Errorf("text is too long (%d chars, max %d)", len(in.Text), maxBlipTextLen)
	}
	date := strings.TrimSpace(in.Date)
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	if _, err := time.Parse("2006-01-02", date); err != nil {
		return fmt.Errorf("date must be a real YYYY-MM-DD date, got %q", date)
	}

	var media []string
	for _, src := range in.MediaPaths {
		name, err := copyMediaAsset(p, src)
		if err != nil {
			for _, done := range media {
				os.Remove(filepath.Join(p.BlipsAssetsDir, done))
			}
			return err
		}
		media = append(media, name)
	}

	return insertBlipEntry(p, formatBlipEntry(date, in.Text, media, in.Tags))
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

func formatBlipEntry(date, text string, media, tags []string) string {
	var b strings.Builder
	b.WriteString("- date: ")
	b.WriteString(date)
	b.WriteString("\n")
	if text != "" {
		fmt.Fprintf(&b, "  text: %s\n", yamlQuote(text))
	}
	switch len(media) {
	case 0:
	case 1:
		fmt.Fprintf(&b, "  media: %s\n", media[0])
	default:
		fmt.Fprintf(&b, "  media: [%s]\n", strings.Join(media, ", "))
	}
	if len(tags) > 0 {
		b.WriteString("  tags: [" + strings.Join(tags, ", ") + "]\n")
	}
	return b.String()
}

func yamlQuote(s string) string {
	return strconv.Quote(s)
}

// insertBlipEntry puts entry before the first existing item, after the
// leading comments and blank lines, so the file stays newest-first. The file
// may be empty, comment-only, or hold the "[]" placeholder.
func insertBlipEntry(p Paths, entry string) error {
	raw, err := os.ReadFile(p.BlipsYAML)
	if err != nil {
		return err
	}
	content := string(raw)
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

	switch {
	case valueStart == -1:
		if content != "" && !strings.HasSuffix(content, "\n") {
			content += "\n"
		}
		content += entry
	case strings.TrimSpace(lines[valueStart]) == "[]":
		lines[valueStart] = strings.TrimSuffix(entry, "\n")
		content = strings.Join(lines, "\n")
	default:
		head := strings.Join(lines[:valueStart], "\n")
		if valueStart > 0 {
			head += "\n"
		}
		content = head + entry + "\n" + strings.Join(lines[valueStart:], "\n")
	}
	return os.WriteFile(p.BlipsYAML, []byte(content), 0o644)
}
