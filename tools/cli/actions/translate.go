package actions

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// TranslateEventKind classifies one line of translate-blog.mjs output.
type TranslateEventKind int

const (
	TranslateLog     TranslateEventKind = iota // any other line
	TranslateTotal                             // "translating N file(s)"
	TranslateWrote                             // "wrote <path>": one file done
	TranslateNothing                           // "nothing to translate": done, no work
)

// TranslateEvent is a parsed line of translate-blog.mjs stdout.
type TranslateEvent struct {
	Kind   TranslateEventKind
	Total  int    // TranslateTotal
	Locale string // TranslateWrote
	Slug   string // TranslateWrote
	Line   string // the raw line
}

// ParseTranslateLine classifies a line of translate-blog.mjs output.
func ParseTranslateLine(line string) TranslateEvent {
	ev := TranslateEvent{Kind: TranslateLog, Line: line}
	switch {
	case line == "nothing to translate":
		ev.Kind = TranslateNothing
	case strings.HasPrefix(line, "translating ") && strings.HasSuffix(line, " file(s)"):
		n, err := strconv.Atoi(strings.TrimSuffix(strings.TrimPrefix(line, "translating "), " file(s)"))
		if err == nil {
			ev.Kind, ev.Total = TranslateTotal, n
		}
	case strings.HasPrefix(line, "wrote "):
		// The script may print the path relative or absolute.
		p := filepath.ToSlash(strings.TrimPrefix(line, "wrote "))
		if !strings.HasSuffix(p, ".md") {
			break
		}
		parts := strings.Split(p, "/")
		if len(parts) >= 3 && parts[len(parts)-3] == "translations" {
			ev.Kind = TranslateWrote
			ev.Locale = parts[len(parts)-2]
			ev.Slug = strings.TrimSuffix(parts[len(parts)-1], ".md")
		}
	}
	return ev
}

// TranslateCmd returns the command that runs the blog translation script.
// A real run calls a paid API.
func TranslateCmd(p Paths) *exec.Cmd {
	cmd := exec.Command("npm", "run", "translate:blog")
	cmd.Dir = p.Root
	return cmd
}

// ParseTranslationCheck parses the stderr of `translate-blog.mjs --check`.
func ParseTranslationCheck(stderr string) (stale map[string]bool, missing map[string][]string) {
	stale = map[string]bool{}
	missing = map[string][]string{}
	for _, line := range strings.Split(stderr, "\n") {
		line = strings.TrimSpace(line)
		switch {
		case strings.HasPrefix(line, "stale posts:"):
			for _, s := range strings.Split(strings.TrimPrefix(line, "stale posts:"), ",") {
				if s = strings.TrimSpace(s); s != "" {
					stale[s] = true
				}
			}
		case strings.HasPrefix(line, "missing translations:"):
			for _, s := range strings.Split(strings.TrimPrefix(line, "missing translations:"), ",") {
				locale, slug, ok := strings.Cut(strings.TrimSpace(s), "/")
				if ok {
					missing[slug] = append(missing[slug], locale)
				}
			}
		}
	}
	return stale, missing
}

const translationStatusTimeout = 20 * time.Second

// TranslationStatus runs the script's --check mode. A hung node is killed
// after translationStatusTimeout and reported as an error.
func TranslationStatus(p Paths) (stale map[string]bool, missing map[string][]string, err error) {
	ctx, cancel := context.WithTimeout(context.Background(), translationStatusTimeout)
	defer cancel()
	cmd := exec.CommandContext(ctx, "node", "scripts/translate-blog.mjs", "--check")
	cmd.Dir = p.Root
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	return interpretCheck(cmd.Run(), stderr.String())
}

// interpretCheck turns the outcome of --check into a result. Exit 1 means the
// translations are out of date, but a node crash also exits 1, so exit 1 only
// counts when the report lines were actually printed.
func interpretCheck(runErr error, stderr string) (map[string]bool, map[string][]string, error) {
	detail := func() error {
		if s := strings.TrimSpace(stderr); s != "" {
			return fmt.Errorf("%w: %s", runErr, s)
		}
		return runErr
	}
	var exitErr *exec.ExitError
	if runErr != nil && !(errors.As(runErr, &exitErr) && exitErr.ExitCode() == 1) {
		return nil, nil, detail()
	}
	stale, missing := ParseTranslationCheck(stderr)
	if runErr != nil && len(stale)+len(missing) == 0 {
		return nil, nil, detail()
	}
	return stale, missing, nil
}
