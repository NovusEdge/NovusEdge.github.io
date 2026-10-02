package actions

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
)

// Editor is an installed editor that can open a post.
type Editor struct {
	Name string
	// Path is the resolved executable.
	Path string
	// Args come from $VISUAL / $EDITOR values such as "code --wait".
	Args []string
	// Terminal editors need the terminal; GUI editors are started detached.
	Terminal bool
}

type editorCandidate struct {
	command  string
	terminal bool
}

var fixedEditors = []editorCandidate{
	{"nvim", true}, {"vim", true}, {"nano", true},
	{"typora", false}, {"obsidian", false}, {"zed", false}, {"marktext", false},
}

// FindEditors lists the editors available on PATH: $VISUAL and $EDITOR first
// (split on spaces, first field is the command), then nvim, vim, nano and the
// GUI editors. An editor reachable under two names, such as $EDITOR=vi
// symlinked to vim, appears once, under its first name.
func FindEditors(visual, editor string) []Editor {
	var cands []editorCandidate
	for _, env := range []string{visual, editor} {
		if env = strings.TrimSpace(env); env != "" {
			cands = append(cands, editorCandidate{env, true})
		}
	}
	cands = append(cands, fixedEditors...)

	var found []Editor
	seen := map[string]bool{}
	for _, c := range cands {
		fields := strings.Fields(c.command)
		path, err := exec.LookPath(fields[0])
		if err != nil {
			continue
		}
		real := path
		if r, err := filepath.EvalSymlinks(path); err == nil {
			real = r
		}
		if seen[real] {
			continue
		}
		seen[real] = true
		found = append(found, Editor{
			Name:     filepath.Base(fields[0]),
			Path:     path,
			Args:     fields[1:],
			Terminal: c.terminal,
		})
	}
	return found
}

// FindEditorsFromEnv is FindEditors with $VISUAL and $EDITOR.
func FindEditorsFromEnv() []Editor {
	return FindEditors(os.Getenv("VISUAL"), os.Getenv("EDITOR"))
}

// Command returns the command that opens file in e.
func (e Editor) Command(file string) *exec.Cmd {
	return exec.Command(e.Path, append(append([]string{}, e.Args...), file)...)
}

// StartDetached launches a GUI editor in its own session with no stdio, so
// closing the TUI neither kills it nor lets it write over the screen.
func (e Editor) StartDetached(file string) error {
	cmd := e.Command(file)
	cmd.SysProcAttr = &syscall.SysProcAttr{Setsid: true}
	if err := cmd.Start(); err != nil {
		return err
	}
	return cmd.Process.Release()
}
