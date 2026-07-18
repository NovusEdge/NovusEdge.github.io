package actions

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"
)

// PostMeta is the subset of a blog post's frontmatter the TUI needs to
// display in pickers and listings.
type PostMeta struct {
	Slug   string
	Title  string
	Date   string
	Tags   []string
	Hidden bool
}

// BlogInput is the user-supplied data for creating a new blog post.
type BlogInput struct {
	Slug        string
	Title       string
	Date        string // YYYY-MM-DD, defaults to today if empty
	Tags        []string
	Description string
}

var slugRe = regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)

// ValidateSlug enforces the lowercase-kebab-case convention used across
// src/content/blog.
func ValidateSlug(slug string) error {
	if slug == "" {
		return fmt.Errorf("slug is required")
	}
	if !slugRe.MatchString(slug) {
		return fmt.Errorf("slug must be lowercase kebab-case (letters, digits, hyphens), got %q", slug)
	}
	return nil
}

const blogTemplate = `---
title: %s
date: %s
tags: %s
description: %s
---

`

// NewBlog creates src/content/blog/{slug}.md from a minimal template and
// marks the post as hidden (draft) until it's explicitly published.
func NewBlog(p Paths, in BlogInput) error {
	if err := ValidateSlug(in.Slug); err != nil {
		return err
	}
	if in.Title == "" {
		return fmt.Errorf("title is required")
	}
	date := strings.TrimSpace(in.Date)
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}

	path := filepath.Join(p.BlogDir, in.Slug+".md")
	if _, err := os.Stat(path); err == nil {
		return fmt.Errorf("post already exists: %s", path)
	}

	content := fmt.Sprintf(blogTemplate, in.Title, date, TagsValue(in.Tags), in.Description)
	if err := os.MkdirAll(p.BlogDir, 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		return err
	}

	return SetHidden(p, in.Slug, true)
}

// ListPosts reads every markdown file in the blog dir and cross-references
// the HIDDEN array to report each post's title, date, tags, and draft status.
func ListPosts(p Paths) ([]PostMeta, error) {
	entries, err := os.ReadDir(p.BlogDir)
	if err != nil {
		return nil, err
	}
	hidden, err := ReadHidden(p)
	if err != nil {
		return nil, err
	}
	hiddenSet := make(map[string]bool, len(hidden))
	for _, h := range hidden {
		hiddenSet[h] = true
	}

	var posts []PostMeta
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") {
			continue
		}
		slug := strings.TrimSuffix(e.Name(), ".md")
		raw, err := os.ReadFile(filepath.Join(p.BlogDir, e.Name()))
		if err != nil {
			return nil, err
		}
		fm, ok := ParseFrontmatter(string(raw))
		meta := PostMeta{Slug: slug, Hidden: hiddenSet[slug]}
		if ok {
			if title, ok := fm.Get("title"); ok {
				meta.Title = title
			}
			if date, ok := fm.Get("date"); ok {
				meta.Date = date
			}
			if tags, ok := fm.Get("tags"); ok {
				meta.Tags = ParseTagsValue(tags)
			}
		}
		if meta.Title == "" {
			meta.Title = slug
		}
		posts = append(posts, meta)
	}
	sort.Slice(posts, func(i, j int) bool { return posts[i].Date > posts[j].Date })
	return posts, nil
}

// PostFilePath returns the markdown file path for a slug.
func PostFilePath(p Paths, slug string) string {
	return filepath.Join(p.BlogDir, slug+".md")
}

// GetTags reads the current tags for a post from its frontmatter.
func GetTags(p Paths, slug string) ([]string, error) {
	raw, err := os.ReadFile(PostFilePath(p, slug))
	if err != nil {
		return nil, err
	}
	fm, ok := ParseFrontmatter(string(raw))
	if !ok {
		return nil, fmt.Errorf("%s has no frontmatter block", slug)
	}
	tags, _ := fm.Get("tags")
	return ParseTagsValue(tags), nil
}

// EditTags rewrites the tags: line in a post's frontmatter.
func EditTags(p Paths, slug string, tags []string) error {
	path := PostFilePath(p, slug)
	raw, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	fm, ok := ParseFrontmatter(string(raw))
	if !ok {
		return fmt.Errorf("%s has no frontmatter block", slug)
	}
	fm.Set("tags", TagsValue(tags))
	return os.WriteFile(path, []byte(fm.String()), 0o644)
}

var hiddenArrayRe = regexp.MustCompile(`(?s)(const HIDDEN = \[)(.*?)(\])`)

// ReadHidden extracts the slugs currently listed in posts.ts's HIDDEN array.
func ReadHidden(p Paths) ([]string, error) {
	raw, err := os.ReadFile(p.PostsFile)
	if err != nil {
		return nil, err
	}
	m := hiddenArrayRe.FindStringSubmatch(string(raw))
	if m == nil {
		return nil, fmt.Errorf("could not find HIDDEN array in %s", p.PostsFile)
	}
	return parseStringArray(m[2]), nil
}

// WriteHidden replaces the contents of the HIDDEN array in posts.ts.
func WriteHidden(p Paths, slugs []string) error {
	raw, err := os.ReadFile(p.PostsFile)
	if err != nil {
		return err
	}
	if !hiddenArrayRe.Match(raw) {
		return fmt.Errorf("could not find HIDDEN array in %s", p.PostsFile)
	}
	replacement := "${1}" + formatStringArray(slugs) + "${3}"
	updated := hiddenArrayRe.ReplaceAllString(string(raw), replacement)
	return os.WriteFile(p.PostsFile, []byte(updated), 0o644)
}

// SetHidden adds or removes a slug from the HIDDEN array (dedupes, no-op if
// already in the desired state).
func SetHidden(p Paths, slug string, hidden bool) error {
	current, err := ReadHidden(p)
	if err != nil {
		return err
	}
	has := false
	var next []string
	for _, s := range current {
		if s == slug {
			has = true
			if hidden {
				next = append(next, s) // keep, avoid duplicate below
			}
			continue
		}
		next = append(next, s)
	}
	if hidden && !has {
		next = append(next, slug)
	}
	return WriteHidden(p, next)
}

var stringLitRe = regexp.MustCompile(`'([^']*)'|"([^"]*)"`)

func parseStringArray(s string) []string {
	matches := stringLitRe.FindAllStringSubmatch(s, -1)
	out := make([]string, 0, len(matches))
	for _, m := range matches {
		if m[1] != "" {
			out = append(out, m[1])
		} else {
			out = append(out, m[2])
		}
	}
	return out
}

func formatStringArray(slugs []string) string {
	quoted := make([]string, len(slugs))
	for i, s := range slugs {
		quoted[i] = "'" + s + "'"
	}
	return strings.Join(quoted, ", ")
}
