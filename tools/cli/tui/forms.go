package tui

import (
	"fmt"
	"image/color"
	"os"
	"slices"
	"strings"
	"time"

	tea "charm.land/bubbletea/v2"
	"charm.land/huh/v2"

	"novusedge/site-cli/actions"
)

const blipMaxLen = 255

func today() string { return time.Now().Format("2006-01-02") }

func validDate(s string) error {
	if _, err := time.Parse("2006-01-02", strings.TrimSpace(s)); err != nil {
		return fmt.Errorf("use YYYY-MM-DD")
	}
	return nil
}

func splitTags(s string) []string {
	var out []string
	for _, t := range strings.Split(s, ",") {
		if t = strings.TrimSpace(t); t != "" {
			out = append(out, t)
		}
	}
	return out
}

// changed reports whether any value differs from what it held when changed
// was called.
func changed(vals ...*string) func() bool {
	initial := make([]string, len(vals))
	for i, v := range vals {
		initial[i] = *v
	}
	return func() bool {
		for i, v := range vals {
			if *v != initial[i] {
				return true
			}
		}
		return false
	}
}

// assetValidator accepts an empty value and otherwise requires an existing
// file under public/.
func assetValidator(p actions.Paths) func(string) error {
	return func(s string) error {
		if s == "" {
			return nil
		}
		return actions.ValidateAssetPath(p, s)
	}
}

func required(name string) func(string) error {
	return func(s string) error {
		if strings.TrimSpace(s) == "" {
			return fmt.Errorf("%s is required", name)
		}
		return nil
	}
}

func (a *App) open(o overlay) tea.Cmd {
	a.overlay = o
	return o.Init()
}

// ask is a yes/no step in a multi-screen flow. esc offers to discard what the
// flow has collected so far, "Yes" opens the next step and "No" runs no. bg is
// a parameter because flows build their steps off the update loop.
func ask(bg color.Color, title string, dirty func() bool, yes func() overlay, no func() tea.Cmd) overlay {
	var v bool
	c := newFormOverlay(bg, nil, huh.NewGroup(
		huh.NewConfirm().Title(title).Affirmative("Yes").Negative("No").Value(&v),
	))
	c.then(func() overlayDoneMsg {
		if v {
			return overlayDoneMsg{next: yes()}
		}
		return overlayDoneMsg{cmd: no()}
	})
	return c.guard(bg, dirty)
}

func (a *App) editTags() tea.Cmd {
	p, ok := selectedPost(a.list)
	if !ok {
		return nil
	}
	tags, err := actions.GetTags(a.paths, p.Slug)
	if err != nil {
		a.setStatus(err.Error(), true)
		return nil
	}
	val := strings.Join(tags, ", ")
	paths := a.paths
	o := newFormOverlay(a.bg, func() tea.Cmd {
		return func() tea.Msg {
			if err := actions.EditTags(paths, p.Slug, splitTags(val)); err != nil {
				return writeDoneMsg{err: err, sel: p.Slug}
			}
			locales, err := actions.PostLocales(paths, p.Slug)
			if err != nil {
				return writeDoneMsg{status: "tags written, but listing translations failed: " + err.Error(), sel: p.Slug}
			}
			return writeDoneMsg{status: fmt.Sprintf("tags written to %d file(s), English + %d translation(s)", 1+len(locales), len(locales)), sel: p.Slug}
		}
	}, huh.NewGroup(
		huh.NewInput().Title("Tags for "+p.Slug).Description("comma separated").Value(&val),
	)).guard(a.bg, changed(&val))
	return a.open(o)
}

func (a *App) editThumb() tea.Cmd {
	p, ok := selectedPost(a.list)
	if !ok {
		return nil
	}
	cur, _, err := actions.GetThumbnail(a.paths, p.Slug)
	if err != nil {
		a.setStatus(err.Error(), true)
		return nil
	}
	hero, list := cur.Hero, cur.List
	paths := a.paths
	assetOK := assetValidator(paths)
	heroIn := huh.NewInput().Title("Hero").Description("path under public/, e.g. /assets/x.png").Value(&hero).
		Validate(func(s string) error {
			if s == "" && list != "" {
				return fmt.Errorf("hero is required when list is set")
			}
			return assetOK(s)
		})
	listIn := huh.NewInput().Title("List").Description("empty uses the hero").Value(&list).Validate(assetOK)
	o := newFormOverlay(a.bg, func() tea.Cmd {
		return func() tea.Msg {
			if err := actions.SetThumbnail(paths, p.Slug, actions.Thumb{Hero: hero, List: list}); err != nil {
				return writeDoneMsg{err: err, sel: p.Slug}
			}
			if hero == "" {
				return writeDoneMsg{status: "removed thumbnail for " + p.Slug, sel: p.Slug}
			}
			return writeDoneMsg{status: "thumbnail set for " + p.Slug, sel: p.Slug}
		}
	}, huh.NewGroup(heroIn, listIn).Title("Thumbnail for "+p.Slug)).guard(a.bg, changed(&hero, &list))
	o.live = []liveCheck{{heroIn, &hero, assetOK}, {listIn, &list, assetOK}}
	return a.open(o)
}

func (a *App) newPost() tea.Cmd {
	var title, slug, date, tags, desc string
	date = today()
	paths := a.paths
	autoSlug := ""
	slugOK := func(s string) error {
		if err := actions.ValidateSlug(s); err != nil {
			return err
		}
		if _, err := os.Stat(actions.PostFilePath(paths, s)); err == nil {
			return fmt.Errorf("a post with this slug already exists")
		}
		return nil
	}
	slugIn := huh.NewInput().Title("Slug").Value(&slug).Validate(slugOK)
	dateIn := huh.NewInput().Title("Date").Value(&date).Validate(validDate)
	o := newFormOverlay(a.bg, func() tea.Cmd {
		in := actions.BlogInput{Slug: slug, Title: strings.TrimSpace(title), Date: strings.TrimSpace(date), Tags: splitTags(tags), Description: desc}
		return func() tea.Msg {
			if err := actions.NewBlog(paths, in); err != nil {
				return writeDoneMsg{err: err}
			}
			return writeDoneMsg{status: "created draft " + in.Slug, sel: in.Slug}
		}
	}, huh.NewGroup(
		huh.NewInput().Title("Title").Value(&title).Validate(required("title")),
		slugIn,
		dateIn,
		huh.NewInput().Title("Tags").Description("comma separated").Value(&tags),
		huh.NewInput().Title("Description").Value(&desc),
	).Title("New post")).guard(a.bg, changed(&title, &slug, &date, &tags, &desc))
	o.live = []liveCheck{{slugIn, &slug, slugOK}, {dateIn, &date, validDate}}
	// The slug follows the title until the user types in the slug field.
	following, atEnd := true, false
	o.after = func() {
		if !following {
			return
		}
		// SetValue leaves the cursor where it was, so a field filled while
		// unfocused would be entered with the cursor near its start.
		if focused := o.form.GetFocusedField() == slugIn; focused != atEnd {
			atEnd = focused
			if focused {
				slugIn.Update(tea.KeyPressMsg{Code: tea.KeyEnd})
			}
		}
		if slug != autoSlug {
			following = false
			return
		}
		if next := actions.Slugify(title); next != slug {
			slug, autoSlug = next, next
			slugIn.Value(&slug)
		}
	}
	return a.open(o)
}

func (a *App) newBlip() tea.Cmd {
	var date, text, tags string
	date = today()
	paths, bg := a.paths, a.bg
	var media []string
	finish := func() tea.Cmd {
		in := actions.BlipInput{Date: strings.TrimSpace(date), Text: text, MediaPaths: media, Tags: splitTags(tags)}
		return func() tea.Msg {
			if err := actions.NewBlip(paths, in); err != nil {
				return writeDoneMsg{err: err}
			}
			return writeDoneMsg{status: fmt.Sprintf("blip added to blips.yaml (%d media)", len(in.MediaPaths))}
		}
	}
	fieldsChanged := changed(&text, &tags)
	dirty := func() bool { return len(media) > 0 || fieldsChanged() || date != today() }
	dateIn := huh.NewInput().Title("Date").Value(&date).Validate(validDate)
	textIn := huh.NewText().Title("Text").Lines(4).CharLimit(blipMaxLen).Value(&text).
		DescriptionFunc(func() string {
			return fmt.Sprintf("%d left", blipMaxLen-len([]rune(text)))
		}, &text)
	var pickFile, offer func() overlay
	offer = func() overlay { return ask(bg, "Attach a media file?", dirty, pickFile, finish) }
	pickFile = func() overlay {
		var path string
		var again bool
		home, _ := os.UserHomeDir()
		picker := huh.NewFilePicker().Title("Media file").CurrentDirectory(home).Picking(true).Height(10).Value(&path).
			Validate(required("file"))
		o := newFormOverlay(bg, nil,
			huh.NewGroup(picker),
			huh.NewGroup(huh.NewConfirm().Title("Add another file?").Value(&again)),
		).tall(picker)
		o.then(func() overlayDoneMsg {
			if again {
				return overlayDoneMsg{next: pickFile()}
			}
			return overlayDoneMsg{cmd: finish()}
		})
		// Esc steps back to the attach question, whose "No" finishes the blip.
		o.cancel = func() tea.Msg { return overlayDoneMsg{next: offer()} }
		// Appended on the Update path: dirty reads media while the submit
		// command runs on another goroutine.
		appended := false
		o.after = func() {
			if o.form.State == huh.StateCompleted && !appended {
				appended = true
				media = append(media, path)
			}
		}
		return o
	}
	o := newFormOverlay(bg, nil, huh.NewGroup(
		dateIn,
		textIn,
		huh.NewInput().Title("Tags").Description("comma separated").Value(&tags),
	).Title("New blip")).tall(textIn).guard(bg, dirty)
	o.then(func() overlayDoneMsg { return overlayDoneMsg{next: offer()} })
	o.live = []liveCheck{{dateIn, &date, validDate}}
	return a.open(o)
}

func (a *App) newCard() tea.Cmd {
	var slug, title, venue, date, abstract, url, thumb string
	year := time.Now().Format("2006")
	date = year
	paths, bg := a.paths, a.bg
	var links []actions.PaperLink
	finish := func() tea.Cmd {
		in := actions.PaperInput{Slug: slug, Title: strings.TrimSpace(title), Venue: venue, Date: strings.TrimSpace(date),
			Abstract: abstract, URL: strings.TrimSpace(url), Thumb: thumb, Links: links}
		return func() tea.Msg {
			if err := actions.NewPaper(paths, in); err != nil {
				return writeDoneMsg{err: err}
			}
			return writeDoneMsg{status: "research card added: " + in.Slug}
		}
	}
	fieldsChanged := changed(&slug, &title, &venue, &abstract, &url, &thumb)
	dirty := func() bool { return len(links) > 0 || fieldsChanged() || date != year }
	assetOK := assetValidator(paths)
	slugOK := func(s string) error {
		if err := actions.ValidateSlug(s); err != nil {
			return err
		}
		taken, err := actions.PaperSlugs(paths)
		if err != nil {
			return err
		}
		if slices.Contains(taken, s) {
			return fmt.Errorf("a research card with this slug already exists")
		}
		return nil
	}
	slugIn := huh.NewInput().Title("Slug").Value(&slug).Validate(slugOK)
	// The site renders the date verbatim and existing cards use a bare year.
	dateIn := huh.NewInput().Title("Date").Description("shown as written, e.g. 2026").Value(&date).Validate(required("date"))
	abstractIn := huh.NewText().Title("Abstract").Lines(4).Value(&abstract)
	thumbIn := huh.NewInput().Title("Thumb").Description("optional, path under public/").Value(&thumb).Validate(assetOK)
	var linkForm, linkAsk func() overlay
	linkAsk = func() overlay { return ask(bg, "Add a link?", dirty, linkForm, finish) }
	linkForm = func() overlay {
		var label, href string
		var again bool
		o := newFormOverlay(bg, nil, huh.NewGroup(
			huh.NewInput().Title("Link label").Value(&label).Validate(required("label")),
			huh.NewInput().Title("Link URL").Value(&href).Validate(required("url")),
			huh.NewConfirm().Title("Add another link?").Value(&again),
		))
		o.then(func() overlayDoneMsg {
			if again {
				return overlayDoneMsg{next: linkForm()}
			}
			return overlayDoneMsg{cmd: finish()}
		})
		// Esc steps back to the link question, whose "No" finishes the card.
		o.cancel = func() tea.Msg { return overlayDoneMsg{next: linkAsk()} }
		appended := false
		o.after = func() {
			if o.form.State == huh.StateCompleted && !appended {
				appended = true
				links = append(links, actions.PaperLink{Label: strings.TrimSpace(label), Href: strings.TrimSpace(href)})
			}
		}
		return o
	}
	o := newFormOverlay(bg, nil, huh.NewGroup(
		slugIn,
		huh.NewInput().Title("Title").Value(&title).Validate(required("title")),
		huh.NewInput().Title("Venue").Value(&venue),
		dateIn,
		abstractIn,
		huh.NewInput().Title("URL").Value(&url).Validate(required("url")),
		thumbIn,
	).Title("New research card")).tall(abstractIn).guard(bg, dirty)
	o.then(func() overlayDoneMsg { return overlayDoneMsg{next: linkAsk()} })
	o.live = []liveCheck{{slugIn, &slug, slugOK}, {thumbIn, &thumb, assetOK}}
	return a.open(o)
}
