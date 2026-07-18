package actions

import (
	"fmt"
	"os"
	"strings"
)

// PaperLink is a label+href pair in a paper's links list.
type PaperLink struct {
	Label string
	Href  string
}

// PaperInput is the user-supplied data for a new research card.
type PaperInput struct {
	Slug     string
	Title    string
	Venue    string
	Date     string
	Abstract string
	URL      string
	Thumb    string // optional
	Links    []PaperLink
}

// NewPaper appends a Paper object literal to the `papers` array in
// src/content/papers.ts.
func NewPaper(p Paths, in PaperInput) error {
	if err := ValidateSlug(in.Slug); err != nil {
		return err
	}
	if in.Title == "" || in.URL == "" {
		return fmt.Errorf("title and url are required")
	}

	raw, err := os.ReadFile(p.PapersFile)
	if err != nil {
		return err
	}
	content := string(raw)

	closeIdx := strings.LastIndex(content, "\n]")
	if closeIdx == -1 {
		return fmt.Errorf("could not find closing ']' of papers array in %s", p.PapersFile)
	}

	entry := formatPaperEntry(in)
	updated := content[:closeIdx+1] + entry + content[closeIdx+1:]
	return os.WriteFile(p.PapersFile, []byte(updated), 0o644)
}

func tsQuote(s string) string {
	s = strings.ReplaceAll(s, `\`, `\\`)
	s = strings.ReplaceAll(s, `'`, `\'`)
	return "'" + s + "'"
}

func formatPaperEntry(in PaperInput) string {
	var b strings.Builder
	b.WriteString("  {\n")
	fmt.Fprintf(&b, "    slug: %s,\n", tsQuote(in.Slug))
	fmt.Fprintf(&b, "    title: %s,\n", tsQuote(in.Title))
	fmt.Fprintf(&b, "    venue: %s,\n", tsQuote(in.Venue))
	fmt.Fprintf(&b, "    date: %s,\n", tsQuote(in.Date))
	fmt.Fprintf(&b, "    url: %s,\n", tsQuote(in.URL))
	if in.Thumb != "" {
		fmt.Fprintf(&b, "    thumb: %s,\n", tsQuote(in.Thumb))
	}
	fmt.Fprintf(&b, "    abstract: %s,\n", tsQuote(in.Abstract))
	b.WriteString("    links: [\n")
	for _, l := range in.Links {
		fmt.Fprintf(&b, "      { label: %s, href: %s },\n", tsQuote(l.Label), tsQuote(l.Href))
	}
	b.WriteString("    ],\n")
	b.WriteString("  },\n")
	return b.String()
}
