# site-cli TUI rebuild

The content TUI in `tools/cli` is rebuilt around the blog post list, moved to Bubble Tea v2 with `huh` forms, and fixed where it has drifted from the site's content format.

## Stack

- `charm.land/bubbletea/v2` v2.0.10, `charm.land/bubbles/v2` v2.2.1, `charm.land/lipgloss/v2` v2.0.6, `charm.land/huh/v2` v2.0.3.
- `huh` v2 pins Bubble Tea v2 in its `go.mod`, so the migration is the price of the forms. v1 with hand-built forms keeps the code that causes most of the UX problems; tview and Phoenix would replace the whole UI library.
- `actions/` keeps its API shape and its tests. Only the `tui/` package is rewritten. The uncommitted sizing and edit-post work in `tui/` is superseded.

## Layout

One screen. Left: the post list, newest first, filterable with `/`, drafts marked. Right: the selected post's detail.

```
┌ posts (/ filter) ─────────┐┌ in-search-of-meaning-01 ─┐
│› In Search of Meaning #1 D││ 2026-09-16   draft       │
│  OpenJev on 62695 A/B     ││ tags: essay, thoughts    │
│  What did we all miss     ││ hero:  (none)            │
│  Google's 13B in Finland  ││ list:  (uses hero)       │
│  ...                      ││ translations: de fi ja zh│
└───────────────────────────┘└──────────────────────────┘
 e edit  t tags  i thumb  p publish  T translate  n post  b blip  r research  q quit
```

- Detail shows date, draft state, description, tags, hero and list thumbnails, and which of de/fi/ja/zh exist and whether `translate:blog --check` reports the post stale.
- Below 80 columns the detail pane drops and the list takes the full width; `enter` opens the detail as a full screen. Below 50×15 a resize notice shows.
- Status messages appear in the footer and clear on the next keypress. The selection and filter survive every action; after creating a post the list selects it.
- `?` toggles the full key help (`bubbles/help`).

## Actions

| Key | Action |
|---|---|
| `e` | Pick an editor, open the post. Terminal editors (`$EDITOR`, `$VISUAL`, nvim, vim, nano) run through `tea.ExecProcess`, which suspends the TUI. GUI editors (Typora, Obsidian, Zed, Marktext) start detached with output discarded. Only editors found on `PATH` are listed. The post list reloads afterwards. |
| `t` | `huh` input prefilled with current tags. Writes `tags:` in the English post and every existing translation, since translated pages read tags from their own file. |
| `i` | `huh` form with hero and list fields. Paths are checked to exist under `public/`. Empty list field means "use hero". |
| `p` | `huh` confirm ("Publish plan-a-ai?"), then toggles `draft:` in the English post only. The site reads draft state only from the English file (`src/lib/posts.ts:47`). |
| `T` | Runs `npm run translate:blog` with a progress bar (see below). |
| `n` | New post form. Slug is derived from the title as you type and stays editable; slug, title and date validate inline. |
| `b` | New blip form: date (default today), text (255 max, live counter), media via `huh` file picker allowing several files, tags. |
| `r` | New research card form: links are added as label/URL pairs one group at a time instead of the `a\|b ; c\|d` string. |
| `esc` | Closes a form. If any field was changed, asks before discarding. |

## Translation progress

`scripts/translate-blog.mjs` gains one line before its loop, `translating N file(s)` with N = stale posts × locales. The TUI runs the npm script with piped output, reads that total, and advances a `bubbles/progress` bar on each `wrote <path>` line, labelled with the current slug and locale. Stderr lines show in a short log under the bar. Exit status ends the run: success returns to the list with a status message, failure keeps the log on screen. `nothing to translate` finishes immediately. A missing `GEMINI_API_KEY` surfaces as the script's own error.

## Content format changes

- Thumbnails move to `src/content/thumbnails.json`, keyed by slug: `{ "hero": "...", "list": "..." }`, `list` optional. `src/lib/thumbnails.ts` keeps `getPostThumbnail` and `getListThumbnail` as lookups, so callers don't change. The nine `slug.includes(...)` rules are expanded to the exact slugs they match today, which removes false matches such as `'red'` in any slug containing "red". The TUI writes the file with sorted keys and two-space indent.
- `blips.yaml`: new entries are inserted at the top of the list, after the header comment, matching the file's newest-first order. `media` is written as a scalar for one file and a flow list for several, as the existing entries do.

## Bugs fixed by the rebuild

- Window size never reached screens: `SetSize` had a pointer receiver while screens were stored as values, and `App` swallowed `WindowSizeMsg`.
- The editor launcher ran terminal editors under the alt screen with shared stdio.
- Set thumbnail could not read or override `includes` rules.
- New blip had no date field, accepted one media file, and appended to the bottom of the file.
- Publish toggled on a single Enter; esc discarded forms silently.

## Testing

- `actions/`: table tests for thumbnails JSON read/write, tag sync across translations, blip top insertion with single and multiple media, and parsing the translate script's progress lines.
- `tui/`: none beyond `go vet`; checked by running the TUI against the real repo and a scratch copy for writes.
- Site: `npm run build` and `npm test` after the thumbnails move, plus a visual check that every post's hero and list thumbnails are unchanged.

## Out of scope

Editing or deleting existing blips and research cards, remembering the last editor, non-blog content (projects, stack).
