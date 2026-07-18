// Package actions contains the file-manipulation logic used by the TUI.
// It is kept separate from the tui package so it can be unit tested without
// spinning up a bubbletea program.
package actions

import (
	"fmt"
	"os"
	"path/filepath"
)

// Paths bundles the repo-relative locations the CLI needs to touch, resolved
// to absolute paths against a discovered repo root.
type Paths struct {
	Root            string
	BlogDir         string
	BlipsYAML       string
	BlipsAssetsDir  string
	PapersFile      string
	ThumbnailsFile  string
	PostsFile       string
}

// FindRepoRoot walks up from the current working directory looking for the
// markers of this project (go it's fine to run from the repo root, but this
// makes the tool resilient if invoked from a subdirectory).
func FindRepoRoot() (string, error) {
	dir, err := os.Getwd()
	if err != nil {
		return "", err
	}
	for {
		if _, err := os.Stat(filepath.Join(dir, "src", "content", "blog")); err == nil {
			return dir, nil
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return "", fmt.Errorf("could not locate repo root (looked for src/content/blog) from %s", dir)
		}
		dir = parent
	}
}

// NewPaths resolves all the paths the CLI cares about relative to root.
func NewPaths(root string) Paths {
	return Paths{
		Root:           root,
		BlogDir:        filepath.Join(root, "src", "content", "blog"),
		BlipsYAML:      filepath.Join(root, "src", "content", "blips", "blips.yaml"),
		BlipsAssetsDir: filepath.Join(root, "src", "content", "blips", "assets"),
		PapersFile:     filepath.Join(root, "src", "content", "papers.ts"),
		ThumbnailsFile: filepath.Join(root, "src", "lib", "thumbnails.ts"),
		PostsFile:      filepath.Join(root, "src", "lib", "posts.ts"),
	}
}
