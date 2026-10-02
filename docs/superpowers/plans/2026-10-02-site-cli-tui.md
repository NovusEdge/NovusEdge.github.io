# site-cli TUI rebuild: implementation plan

Spec: `docs/superpowers/specs/2026-10-02-site-cli-tui-design.md` (binding).

## Global Constraints

- Repo root: `/home/novusedge/Projects/Personal/NovusEdge.github.io`. Go module: `tools/cli` (`novusedge/site-cli`), Go 1.26. Run Go commands from `tools/cli`.
- TUI deps after Task 4: `charm.land/bubbletea/v2` v2.0.10, `charm.land/bubbles/v2` v2.2.1, `charm.land/lipgloss/v2` v2.0.6, `charm.land/huh/v2` v2.0.3. No other new direct dependencies. The v1 `github.com/charmbracelet/*` modules leave `go.mod`.
- `actions/` stays free of any TUI import and keeps its tests passing (`go test ./...`).
- Commits: `git commit -s`, imperative one-line subject in the repo's style ("Move post thumbnails into a JSON map"), no `Co-Authored-By` trailer, no AI attribution, no em-dashes. Stage only the paths your task touches by name; the working tree holds unrelated untracked files (a blog post, translations, specs) that must not be committed.
- Comments: only facts the reader cannot get from the code (why a branch exists, an outside constraint, an ordering dependency). No paraphrase of code, no section banners, no narration of how the answer was found. Exported Go identifiers get real doc comments.
- Do not run `npm run translate:blog` without `--check` or `--dry-run`; a real run calls a paid API.

## Task 1: Thumbnails become a JSON map (site side)

Files: create `src/content/thumbnails.json`; rewrite `src/lib/thumbnails.ts`.

1. Before changing anything, record the current output of `getPostThumbnail(slug)` and `getListThumbnail(slug)` for every slug in `src/content/blog/*.md` (30 posts) into a scratch file, using a throwaway script outside the repo or under the git-ignored `.superpowers/`. Do not commit that script.
2. Create `src/content/thumbnails.json`: an object keyed by slug, keys sorted, two-space indent, trailing newline. Value: `{ "hero": "<path>" }` plus `"list": "<path>"` only where `getListThumbnail` currently overrides (4 slugs). Every `===` rule becomes an entry. The nine `slug.includes(...)` rules expand to the one current slug each matches:
   - `tiling-window-managers` → `linux-journeys-tiling-window-managers-and-linux-ricing`
   - `alfred` → `thm-writeup-alfred`
   - `blue` → `thm-blue-writeup`
   - `chocolate-factory` → `chocolate-factory-writeup`
   - `daily-bugle` → `daily-bugle-writeup`
   - `game-zone` → `game-zone-writeup`
   - `red` → `red-writeup`
   - `toolsrus` → `toolsrus-writeup`
   - `bootsplash` → `linux-journeys-customizing-the-bootsplash`
3. Rewrite `thumbnails.ts` to import the JSON and export the same two functions with the same signatures: `getPostThumbnail(slug)` returns `hero` or `null`; `getListThumbnail(slug)` returns `list ?? hero ?? null`. Keep the fact from the old comment that the OpenJev featured card plays the grid as an mp4 on hover and its `list` image is the resting frame. Drop the "other option: eros-resting" comment and mention that in your report. Enable `resolveJsonModule` in tsconfig only if the import needs it.
4. Re-run the step 1 dump against the new code and diff: zero differences allowed.
5. `npm test` and `npm run build` pass.

## Task 2: actions for thumbnails, translations, tags, blips, slugs

Files: `tools/cli/actions/paths.go`, `thumbnails.go` (rewrite), `posts.go`, `blips.go`, new `slug.go` or fold into `posts.go`, tests in `actions/actions_test.go` (or split per file).

- `Paths`: `ThumbnailsFile` now `src/content/thumbnails.json`; add `TranslationsDir` (`src/content/blog/translations`) and `PublicDir` (`public`).
- Thumbnails: `type Thumb struct { Hero string \`json:"hero"\`; List string \`json:"list,omitempty"\` }`. `GetThumbnail(p, slug) (Thumb, bool, error)`. `SetThumbnail(p, slug string, t Thumb) error` writes the whole map back with sorted keys, two-space indent, trailing newline, HTML escaping off; an all-empty `Thumb` deletes the slug. `ValidateAssetPath(p, path) error`: path must start with `/` and exist as a file at `PublicDir + path`.
- Translations: `PostLocales(p, slug) ([]string, error)` returns the sorted locale dir names under `TranslationsDir` that contain `<slug>.md`.
- `EditTags` writes the `tags:` line in the English post and in every translation from `PostLocales`. A translation without frontmatter is an error naming the file; the English file must not be left changed if any translation fails to parse (parse all first, then write).
- `SetHidden` unchanged: English file only.
- `Slugify(title string) string`: lowercase, ASCII letters and digits kept, every other run of characters becomes one `-`, trimmed of `-`; result must pass `ValidateSlug` for any title with at least one letter or digit. Non-ASCII letters are dropped (no transliteration).
- Blips: `BlipInput` becomes `{ Date string; Text string; MediaPaths []string; Tags []string }`. Date must match `YYYY-MM-DD` and parse as a real date (empty means today). Each media file is copied into `BlipsAssetsDir` as now. `media:` is a scalar for one file and a flow list `[a.jpg, b.jpg]` for several, matching the existing entries in `src/content/blips/blips.yaml`. The new entry is inserted at the top of the list: after the leading comment and blank lines, before the first entry, followed by one blank line so entries stay blank-line separated. Keep handling for an empty file, a comment-only file, and the `[]` placeholder.
- Tests for each item above, including: thumbnails round-trip leaves other entries byte-identical; deleting via empty `Thumb`; `ValidateAssetPath` both ways; tag sync across two fake locales plus the no-frontmatter failure leaving English untouched; blip insertion at top with a header comment, with one and with two media; `Slugify` table.

## Task 3: translation progress and stale check

Files: `scripts/translate-blog.mjs`, new `tools/cli/actions/translate.go` + test.

- Script: immediately before `let failed = false` (after the `nothing to translate` exit), print `translating ${todoSlugs.length * LOCALES.length} file(s)` with `console.log`. No other script change.
- `TranslateEvent` parsing: `ParseTranslateLine(line string) TranslateEvent` recognises `translating N file(s)` (total), `wrote <path>` (one file done; extract slug and locale from `.../translations/<locale>/<slug>.md`), `nothing to translate` (done, zero work), and anything else (log line).
- `TranslateCmd(p Paths) *exec.Cmd`: `npm run translate:blog` with `Dir = p.Root`.
- `TranslationStatus(p Paths) (stale map[string]bool, missing map[string][]string, err error)`: runs `node scripts/translate-blog.mjs --check` in `p.Root`, parses its stderr lines `stale posts: a, b` and `missing translations: de/slug, fi/slug`. Exit code 1 with those lines is a normal result, not an error; any other failure is an error.
- Split the parsing into pure functions and table-test them; do not test by spawning node.

## Task 4: Bubble Tea v2 shell, post list and detail, publish

Files: `tools/cli/go.mod`, `go.sum`, `main.go`, `tui/*` (new files as needed; old screens may be left in place until Task 7 but must compile or be deleted).

- Migrate to the v2 modules. Read the upgrade guides first: https://github.com/charmbracelet/bubbletea/blob/main/UPGRADE_GUIDE_V2.md and https://github.com/charmbracelet/bubbles/blob/main/UPGRADE_GUIDE_V2.md. Alt screen is a `tea.View` field in v2.
- Root model owns: window size, the post list (`bubbles/v2/list`, filter with `/`, drafts marked), status line, key map with `bubbles/v2/help` (`?` toggles full help), an optional overlay model, and the translation status from Task 3 (loaded asynchronously at startup via a `tea.Cmd`, shown as "checking..." until it arrives).
- Exactly one size path: the root stores the size and lays out children from it on every `WindowSizeMsg` and whenever a child is created.
- Layout per spec: width ≥ 80 → list left (about 45%), detail right, footer with status and short help. Width < 80 → list only; `enter` opens the detail full screen, `esc` returns. Below 50×15 → centered resize notice.
- Detail pane: title, slug, date, draft/published, description, tags, hero and list thumbnails (list shown as "uses hero" when empty), locales from `PostLocales`, and stale/missing from the translation status.
- Status messages clear on the next keypress.
- After any action that writes files, reload posts and keep the selection on the same slug and the active filter.
- `p`: `huh` confirm overlay ("Publish <slug>?" / "Hide <slug> as draft?"), then `actions.SetHidden`; status reports the result.
- `q` and `ctrl+c` quit; `q` must not quit while the list filter input is focused or an overlay is open.

## Task 5: huh forms for tags, thumbnails and new content

Files: `tui/*`.

- All forms open as overlays over the list using `huh` v2 forms embedded as models (huh issue #421: focus may need to be given to the first field explicitly). Validation runs per field as you type.
- `esc` on a form: if any value differs from its initial value, show a `huh` confirm "Discard changes?"; otherwise close immediately.
- `t`: one input prefilled with current tags, comma separated → `actions.EditTags`. Status names how many files were written (English + locales).
- `i`: hero and list inputs prefilled from `GetThumbnail`; each non-empty value validated with `ValidateAssetPath` → `SetThumbnail`.
- `n`: title, slug, date (default today), tags, description. Slug fills from `Slugify(title)` as the title is typed until the user edits the slug field, after which it stops following. Validates slug (also not already existing), title required, date `YYYY-MM-DD`. → `NewBlog`; afterwards the list selects the new post.
- `b`: date (default today), text (max 255, show remaining count), media, tags → `NewBlip`. Media: `huh` file picker; if it cannot select several files at once, use a loop of pick-one-file then a confirm "Add another file?". The status names the blips file.
- `r`: slug, title, venue, date, abstract (multi-line text), URL, thumb (optional, validated with `ValidateAssetPath` when set), then links as label/URL pairs added one group at a time with an "Add another link?" confirm → `NewPaper`.

## Task 6: editor launcher and translation run

Files: `tui/*`, possibly `actions/editors.go` + test for detection.

- `e`: editor picker overlay (`huh` select) listing only editors found with `exec.LookPath`. Terminal: `$VISUAL`, `$EDITOR`, `nvim`, `vim`, `nano` (deduplicated by resolved path; env values may contain arguments, split on spaces). GUI: `typora`, `obsidian`, `zed`, `marktext`.
- Terminal editors run through `tea.ExecProcess`; on return, reload posts and keep selection.
- GUI editors start detached: stdin/stdout/stderr nil, `SysProcAttr.Setsid = true`, `Start()` then `Process.Release()`. Status "opened in <name>".
- `T`: confirm overlay ("Translate N stale post(s)? This calls the Gemini API.", with N from the translation status; if N is 0 say so and do nothing). Then a progress screen: runs `actions.TranslateCmd`, streams stdout and stderr lines as messages, drives a `bubbles/v2/progress` bar from `ParseTranslateLine` (total, then one step per `wrote`), labelled `done/total · slug (locale)`, and shows the last ~6 non-progress lines as a log. On exit 0: back to the list with a status line and the translation status reloaded. On non-zero exit: keep the screen with the log and "press any key". `esc` while running asks "Stop translation?" and kills the process if confirmed.

## Task 7: cleanup and verification

Files: `tui/*`, `actions/posts.go`, `main.go`, `.gitignore`, `tools/cli/mod.just` if needed.

- Delete screens and helpers the new TUI no longer uses (old menu, picker, info screen, drafts list, old forms, `ReadHidden` if unused). `go vet ./...`, `go test ./...`, `go build` clean.
- Add `tools/cli/site-cli` (the built binary) to `.gitignore`.
- Update the package doc comments in `main.go` and `tui` to describe the new shape in one or two sentences.
- Run the TUI in a real terminal (tmux: `tmux new-session -d -x 120 -y 40 'go run .'`, then `tmux capture-pane -p`) and capture: two-pane layout at 120×40, single pane at 70×30, resize notice at 45×12. Exercise the read-only paths only (navigation, filter, detail, help); do not write content in the real repo.
