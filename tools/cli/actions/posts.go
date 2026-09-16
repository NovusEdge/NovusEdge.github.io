package actions

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
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
draft: true
---

`

// NewBlog creates src/content/blog/{slug}.md from a minimal template with
// draft: true set, so the post stays out of the build until it's published.
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
	return os.WriteFile(path, []byte(content), 0o644)
}

// ListPosts reads every markdown file in the blog dir and reports each post's
// title, date, tags, and draft status.
func ListPosts(p Paths) ([]PostMeta, error) {
	entries, err := os.ReadDir(p.BlogDir)
	if err != nil {
		return nil, err
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
		meta := PostMeta{Slug: slug}
		if ok {
			meta.Hidden = isDraft(fm)
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

// src/lib/posts.ts compares the raw frontmatter string, so only the literal
// "true" hides a post.
func isDraft(fm Frontmatter) bool {
	v, _ := fm.Get("draft")
	return strings.TrimSpace(v) == "true"
}

// ReadHidden returns the slugs of every post marked draft: true.
func ReadHidden(p Paths) ([]string, error) {
	posts, err := ListPosts(p)
	if err != nil {
		return nil, err
	}
	var slugs []string
	for _, post := range posts {
		if post.Hidden {
			slugs = append(slugs, post.Slug)
		}
	}
	return slugs, nil
}

// SetHidden sets or clears draft: true in a post's frontmatter.
func SetHidden(p Paths, slug string, hidden bool) error {
	path := PostFilePath(p, slug)
	raw, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	fm, ok := ParseFrontmatter(string(raw))
	if !ok {
		return fmt.Errorf("%s has no frontmatter block", slug)
	}
	fm.Set("draft", strconv.FormatBool(hidden))
	return os.WriteFile(path, []byte(fm.String()), 0o644)
}
