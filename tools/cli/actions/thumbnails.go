package actions

import (
	"fmt"
	"os"
	"regexp"
	"strings"
)

// GetThumbnail returns the current mapping (if any) for a slug in the
// getPostThumbnail function of thumbnails.ts.
func GetThumbnail(p Paths, slug string) (string, bool, error) {
	raw, err := os.ReadFile(p.ThumbnailsFile)
	if err != nil {
		return "", false, err
	}
	fnStart, fnEnd, err := postThumbnailFuncRange(string(raw))
	if err != nil {
		return "", false, err
	}
	body := string(raw)[fnStart:fnEnd]
	re := slugMappingRe(slug)
	m := re.FindStringSubmatch(body)
	if m == nil {
		return "", false, nil
	}
	return m[1], true, nil
}

// SetThumbnail adds or updates the slug -> thumbnail mapping inside
// getPostThumbnail() in src/lib/thumbnails.ts.
func SetThumbnail(p Paths, slug, thumbPath string) error {
	raw, err := os.ReadFile(p.ThumbnailsFile)
	if err != nil {
		return err
	}
	content := string(raw)
	fnStart, fnEnd, err := postThumbnailFuncRange(content)
	if err != nil {
		return err
	}
	body := content[fnStart:fnEnd]

	line := fmt.Sprintf("  if (slug === '%s') return '%s'\n", slug, thumbPath)
	re := slugMappingRe(slug)
	var newBody string
	if re.MatchString(body) {
		newBody = re.ReplaceAllString(body, strings.TrimSuffix(line, "\n"))
	} else {
		// Insert right before the function's closing "return null" line.
		idx := strings.LastIndex(body, "return null")
		if idx == -1 {
			return fmt.Errorf("could not find insertion point in getPostThumbnail")
		}
		newBody = body[:idx] + line + body[idx:]
	}

	updated := content[:fnStart] + newBody + content[fnEnd:]
	return os.WriteFile(p.ThumbnailsFile, []byte(updated), 0o644)
}

func slugMappingRe(slug string) *regexp.Regexp {
	return regexp.MustCompile(fmt.Sprintf(`if \(slug === '%s'\) return '([^']*)'\n?`, regexp.QuoteMeta(slug)))
}

// postThumbnailFuncRange locates the byte range of the getPostThumbnail
// function body within thumbnails.ts.
func postThumbnailFuncRange(content string) (start, end int, err error) {
	marker := "export function getPostThumbnail"
	start = strings.Index(content, marker)
	if start == -1 {
		return 0, 0, fmt.Errorf("could not find getPostThumbnail in thumbnails.ts")
	}
	// end of function: the closing brace on its own line following start.
	rest := content[start:]
	closeIdx := strings.Index(rest, "\n}")
	if closeIdx == -1 {
		return 0, 0, fmt.Errorf("could not find end of getPostThumbnail in thumbnails.ts")
	}
	end = start + closeIdx + len("\n}")
	return start, end, nil
}
