# ok fine: three directions

Files (all in this folder, standalone, open from disk):

- `direction-a.html`: one arc, cut paper (paper-led, built on the teaser's grammar)
- `direction-b.html`: characters only (ASCII-led)
- `direction-c.html`: typescript and blue pencil (hybrid)

Each has a light/dark button in the top right, a sound toggle on the centrepiece (off by default), and was checked in headless Chromium at 1280 and 390 wide, light and dark, with and without `prefers-reduced-motion`. No horizontal overflow at either width. Not checked: Firefox, Safari, and the sound (headless has no audio).

## The reference

**What I could see.** The 20 frames of the Opus 5.5 teaser supplied in `ref-video/` (contact sheet and f01 to f20). I could not find or watch the Fable 5.2 teaser: YouTube redirected to a consent page, and web search found no stills or written description of either teaser's look. So everything below about the teaser comes from those 20 frames of one video.

**What the frames show.**

- One shape, a curved horizon in the lower third, holds its position for the whole piece. Everything else changes.
- About one hard cut a second. The material under the arc is replaced each time: atmosphere, a dish rim, bread crust, chalk on blue, a leaf, pottery, a manuscript drawing, a false-colour scan, denim over printed cloth, agate, rock, a stem cross-section, an ink sketch. No dissolves that I can see between frames.
- The materials are physical and close-up, many of them paper or print. Grain everywhere.
- A serif word sits on the arc and bends with it. The word stays the same across several cuts while the ground under it changes.
- The colour above the arc changes with each cut too, as a flat field, so the word's colour flips between dark and light.
- It ends on near-black, small type, and the first image returning.

**What I took from it.** The grammar only: a fixed shape, hard match cuts under it, the word seated on the curve, one cut per beat, a bookend. Every texture in the mocks is generated in SVG or CSS. No footage, no wordmark, no product names, no copied frame.

**The announcement pages.** I did screenshot the two anthropic.com pages before the correction arrived. They are not the reference and nothing in the mocks is taken from them. For the record, they are a centred serif title over a full-bleed image, a numbered contents list with dotted leaders, a single narrow serif column, and bordered benchmark tables.

## Direction A: one arc, cut paper

**Idea.** The teaser's structure applied to the post's own claim. "ok fine" sits on one arc and never changes. The paper under it is cut nine times, three materials for each way of saying it: halftone, sunburst and stacked cut paper for "yep, sounds good"; chalk on blueprint, greeked newsprint and denim weave for "whatever"; ash, carbon hatch and ink scribble for "I'm done arguing". A pitch line is drawn in the material under the words for each reading. Then the paper cuts to blank, and in the only slow move of the piece the arc and the pitch line both go straight and the letters stand up. What is left is a typed line on a rule.

**How it enacts the argument.** The words are literally the one thing that does not change across twelve seconds. Everything that told you which "ok fine" it was lived under them, and the transcription step removes exactly that. The ending runs the last move backwards on scroll: the flat line gets its curve and its paper back as you reach "they need more than the words".

**Other parts.** Hero is the same stage with the title on the arc. Stats: tokens-per-second is shown as three paper tapes punched at the real rates for five seconds (1, 3 and 100 holes a second), which makes the "hundred to one" sentence visible. 39 and 10 bits a second are separate paper tags beside their own paragraphs, never side by side, because the post says they are not comparable.

**Fonts.** IM Fell English (display), Spectral (prose), IBM Plex Mono (labels and figures). All three are already loaded by the site's `index.html`.

**Libraries.**

| Effect | Library |
|---|---|
| Letters seated on the arc | GSAP SplitText (chars), positions computed from the circle |
| The whole centrepiece, with hard cuts as `tl.set` | GSAP timeline |
| Pitch lines drawing in time with the utterance | GSAP DrawSVG |
| Arc to straight rule, pitch line to straight line | GSAP MorphSVG |
| Autoplay on entry, tape start/pause, tag drop, ending scrub | GSAP ScrollTrigger |
| Hero entrance (arc ruled from the middle, layers rising) | GSAP timeline + DrawSVG |

**Reduced motion.** Nothing autoplays. The stage rests on the typed end state, and the 1 / 2 / 3 / typed buttons jump straight to the finished frame of each reading. Tapes show one second's worth of holes. The ending shows the bent arc with its paper.

**Build risks.**

- The letter positions are measured from the DOM, so the timeline is rebuilt on width change. In React this wants `useGSAP` with a `ResizeObserver` and `contextSafe`, and it must wait for `document.fonts.ready` or the letters are measured in the fallback face.
- Nine materials are roughly 1,500 SVG nodes (most of them halftone dots) with four filters. It ran smoothly here, but it needs a check on a real mid-range phone. If it drops frames, the cheapest fix is to rasterise each material once to a canvas.
- The stage's colours are driven by CSS variables set from the timeline. The site's dark mode is a `.dark` class, which the mock already uses, but the accessibility panel's `.a11y-reduced-motion` class also has to be read (`prefersReducedMotion()` in `src/lib/motion.ts`), not only the media query.
- The page replaces the shared prose shell, like the other bespoke posts in `src/routes/blog/post.tsx`. The figures have to be placed between specific paragraphs, so the markdown needs markers or the page has to split on headings.
- Translations: the stage text is "ok fine" plus three quotes from the post. Those need to come from the translated post, and the arc maths has to cope with longer strings and CJK.

## Direction B: characters only

**Idea.** One monospace face and nothing else. The title is printed as a block-letter banner and then falls apart into plain `> ok fine` with a cursor. The centrepiece is a 36 by 7 character field: each column is a slice of time, the lit character is the pitch, and the characters under it are that reading's material (`+*o`, `~-.`, `.: `). "ok" and "fine" slide apart or together to match the pause. A second box labelled "typed" receives the same two words after every reading. At the end the line drops to one level, turns into dashes, is deleted from the right, and the field closes.

**How it enacts the argument.** The "typed" box fills with three identical lines while the "said" box shows three different shapes, so the loss is on screen the whole time, not only at the end. This direction also carries the second moment: two logs run the same refactor, one press of "no wait, not that" reaches both, the spoken side stops after a few files and the typed side holds the message until all forty are changed. It presses itself if nobody does.

**Other parts.** Stats are a plain table plus one `#` per token printed at real speed. 39 and 10 bits a second are single lines with dotted leaders under their own paragraphs. The ending is `> ok fine` answered by `?` and a cursor.

**Fonts.** JetBrains Mono, already the site's mono.

**Libraries.**

| Effect | Library |
|---|---|
| Banner print and collapse | anime.js timeline, `stagger` with `grid` from centre |
| Field reveal per column, wipes between readings | anime.js timeline, function-based delays, grid `stagger` |
| Flatten, erase, field closing, word spacing | anime.js timeline |
| Token race | anime.js `animate` on a plain object, `onScroll` to play and pause |
| Interrupt logs | anime.js `animate` on plain objects |

The centrepiece and interrupt figure start from an `IntersectionObserver`, not `onScroll`. One headless run under load did not start the centrepiece; it started in every later run, but the trigger deserves a second look in the port.

**Reduced motion.** The banner and the plain title are both shown. All three readings are drawn at once, stacked, with the three identical lines beside them. The race shows one second. The interrupt figure shows its outcome: stopped at 3 of 40 against 40 of 40.

**Build risks.**

- About 440 spans animated individually. Fine on desktop; check on a phone. Canvas text is the fallback, at the cost of selectable characters.
- The field's font size is derived from viewport width so 36 columns always fit. That formula assumes JetBrains Mono's 0.6em advance; the zh and ja fallbacks in `global.css` have different widths and would break the grid, so the figure should pin its own font stack.
- The timeline's callbacks paint glyphs, so it only plays forwards. There is no scrubbing here, by design.
- An essay set entirely in monospace is a real readability cost over 1,100 words. A variant with the site's prose face for paragraphs and mono only in figures would be the safe version.
- The agent log lines ("changing files", "stopped. 12 files changed") are new copy, kept as plain as I could. They need the author's eye and translation.

## Direction C: typescript and blue pencil

**Idea.** The post is a typed sheet on a desk. The machine's part is typewriter type; the human part is blue pencil. Three typed lines of "ok fine" are marked up in pencil with a pitch line and what was meant. A scanner light passes down the sheet. On the copy beside it each line arrives as type, its pencil arrives as a ghost, goes flat and vanishes. This borrows a real print fact: non-photo blue pencil does not reproduce on a copy.

**How it enacts the argument.** The original keeps its pencil and the copy never has it, so the before and after sit next to each other when the sequence is over. It is the most literal picture of "transcribe first, then send the text" of the three, and the quietest.

**Other parts.** The title is typed key by key and then circled. Stats are a typed table with "about 1" and "50 to 200" ringed in pencil; 39 and 10 bits a second are underlined in pencil where they occur in the prose. The ending is a typed "ok fine" with a pencilled question mark.

**Fonts.** Courier Prime (new to the site) and Caveat (already loaded). IBM Plex Mono is the no-new-font fallback and loses some of the manuscript feel.

**Libraries.**

| Effect | Library |
|---|---|
| Title typed with uneven strike | GSAP SplitText |
| Pencil ring, underlines, pitch lines, question mark | GSAP DrawSVG |
| Scan sequence and copy reveal | GSAP timeline |
| Ghost pitch line going flat on the copy | GSAP MorphSVG |
| Marks landing on scroll, autoplay on entry | GSAP ScrollTrigger |

**Reduced motion.** The timeline is set to its end: original fully marked up, copy with three plain lines. All pencil marks are drawn. No autoplay.

**Build risks.**

- It reuses Caveat as a hand, which the In Search of Meaning treatment already owns. The two posts may read as related when they are not.
- Pencil rings and underlines are stretched SVGs on inline text, held on one line with `nowrap`. Long translated phrases will need a different mark.
- The paper stays light in dark mode on purpose (only the desk goes dark). That is a large bright area on a dark site and should be a deliberate yes.
- It does not use the teaser's grammar at all. If the arc is the thing the author liked, this is the weakest fit.

## Shared

- **Pitch contours** are hand-authored in one `READS` array per file: pitch points per word, plus start and end times so the pause is real. They are plausible, not measured. Swapping in f0 tracks from real recordings is a data change.
- **Sound** is a WebAudio hum that follows the contour, with no words in it. Recorded clips can replace it behind the same toggle.
- **Skipped text.** A and C leave out the middle of the post and mark the gap; B includes more of it because the interrupt figure needs its paragraph. No prose was rewritten.
- **New copy to review:** figure labels ("said", "typed", "transcribed", "one hole, one token", "drawn at 100", "counted a different way") and B's agent log lines. The question mark at the end of B and C is a mark the post does not contain.
- **Second moment.** Only B builds the interruption. In A it would be a second run of the stage where a cut is stopped mid-sequence; in C a pencil strike through a reply being typed.

## a2: second pass on direction A

File: `direction-a2.html`. `direction-a.html` is untouched.

Checked in headless Chromium at 1280 and 390 wide, light and dark, with and without reduced motion. No horizontal overflow. The centrepiece ran three iterations in real time (36.8 s, 16.75 s per cycle) with no errors, and while it was on screen the other four loops were paused. Not checked: Firefox, Safari, a real phone.

**What changed**

- The stage sentence is now "I didn't say she stole the money" in the hero, the centrepiece and the ending. The centrepiece is seven cuts, one per word. On each cut the stressed word leaves the arc along its normal, grows and thickens, the other six sink and dim, the pitch line moves its peak under that word, and the paper is replaced. After the seventh the paper goes blank, every word drops to one baseline and the arc and pitch line go straight. It holds, then bends back and starts again.
- Seven materials, each a stack of cut discs with soft shadows and its own printed surface: halftone on gold, black and white bands, greeked newsprint, chalk on blueprint, carbon and ink scribble, ledger rules, engraver's waves. A fibre layer sits over all of them and one grain overlay covers the whole page.
- Hero and ending are full-bleed, 100svh, near-black. In the hero a light travels along the horizon and the word above it lifts; the sentence is on screen from the first frame. The ending starts as the flat typed line, gets its curve, light and coloured paper back, then loses them again.
- The prose column is the site's: `max-w-4xl` (56rem) with `px-6`, as in `src/routes/blog/post.tsx`. The centrepiece is 2rem wider than the column on desktop and edge to edge on a phone. Only the bookends are full-bleed. Nothing floats in the margins.
- Controls are gone. Every animation loops, pauses when it is offscreen, and has one small pause button in its corner (`aria-label`, `aria-pressed`, focusable). No sound.
- The token-rate figure is three punched cards: one hole per token at the real rates, and the model finishes a hundred-hole card every second and stacks it.
- The 39 and 10 tags are dropped. Both numbers stay in their own paragraphs, set in mono.
- The interruption figure is in, as forty paper sheets twice. I put it under the "changed forty files" paragraph, not the last paragraph, because that is the sentence it draws.
- Body prose is the whole of `ok-fine.md`, unchanged.

**Fonts**

Instrument Serif replaces IM Fell English for the sentence and headings. It is narrower, so seven words fit on a 390px phone at 31px (102px in the bookends and 73px in the centrepiece at 1280), and its edges stay clean at small sizes where IM Fell's ink texture turns to noise. It is new to the site. Spectral (prose) and IBM Plex Mono (labels) are already loaded.

**Libraries per effect**

| Effect | Library |
|---|---|
| Words and letters split, seated on the arc, lifted per word | GSAP SplitText (words and chars) |
| Centrepiece loop; cuts as `tl.set` on the beat | GSAP timeline, `repeat: -1` |
| Pitch line first draw and final retract | GSAP DrawSVG |
| Pitch peak moving word to word; arc and pitch line going straight and bending back | GSAP MorphSVG |
| `okOut`, `okInOut`, `okLift`, used for every eased move on the page | GSAP CustomEase |
| Pause offscreen, resume on screen | GSAP ScrollTrigger |
| Hero light, card punching and stacking, forty sheets, ending | GSAP timelines |

anime.js is not used in a2.

**Reduced motion**

No loops and no pause buttons. Hero: the sentence seated on the arc with the last word lit. Centrepiece: the flat typed sentence with all seven glosses listed under it. Cards: one second's worth (1, 3, 100 holes). Sheets: 4 of 40 and 40 of 40. Ending: the bent arc with its paper.

**New copy to review**

- The stage sentence itself: "I didn't say she stole the money".
- The seven glosses: **I** someone else said it; **didn't** flat denial; **say** I only implied it; **she** someone else did it; **stole** maybe she borrowed it; **the** a different sum; **money** she took something else.
- Card labels: "typing", "speaking", "a model", "52 words a minute", "about 1 token a second", "150 words a minute", "about 3 tokens a second", "50 to 200 tokens a second", "shown at 100", "one hole, one token".
- Sheet labels: "spoken", "typed", "N of 40 changed". "no wait, not that" is the post's own phrase.
- The hero still shows the post title "ok fine" above the sentence, and the body still opens on "ok fine". The stage and the prose now use different examples until the prose is revised.

**Port risks**

- The sentence is sized by measuring it, and every letter is placed from its measured position, so the timelines are rebuilt on width change and again when fonts finish loading. In React that is `useGSAP` plus a `ResizeObserver`, and a rebuild must keep the timeline's time and paused state, as the mock does.
- On a 390px phone the sentence is 31px. It fits and reads, but it is a third of its desktop size. A two-line setting for narrow screens is the alternative.
- A translated sentence breaks the device: stress-shift on these seven words is an English example. The stage sentence and glosses probably stay in English in every locale, with the glosses translated.
- Five looping timelines over generated SVG with five filters. Only the one on screen runs. The fibre filter and the fixed grain overlay are the likely cost on a slow phone; both can be baked to images.
- The pause rule reads the media query only. The site's `.a11y-reduced-motion` class also has to switch every stage to its static state (`prefersReducedMotion()` in `src/lib/motion.ts`).
- The bookends are near-black in both themes and the page between them follows the theme. In dark mode the contrast between cinema and page is small.
- Prose at 1.2rem across 56rem runs to about 120 characters a line. That is the site's width, as asked, but it is a long measure for a serif.

## a3: third pass, driven by the recordings

File: `direction-a3.html`. `direction-a2.html` is untouched. Open it at `http://127.0.0.1:8765/ok-fine-mocks/direction-a3.html`; from disk the fetch fails and the centrepiece stays on its static frame.

Checked in headless Chromium by real mouse clicks at 1280 and 390, light and dark, reduced motion, no horizontal overflow. Not checked: Firefox, Safari, a real phone, and how it sounds.

**Centrepiece**

- It reads `../didnt-say/stage.json`: five stressed readings (I, say, she, stole, money), then the flat one. One loop is 23.6 s.
- Each cut lasts its clip's duration plus 0.55 s. The stage keeps all seven words; only five are ever stressed.
- Every word brightens at its own start time. The stressed word lifts at its start and comes back 0.14 s after its end.
- The pitch line is the clip's f0. Time goes to x by putting each word's start and end on that word's measured edges on the arc. It is drawn with DrawSVG through an ease built from the stroke's own length, so the pen stays under the sound.
- Height is semitones about the clip's median, 9 semitones to full height. I did not stretch each clip to its own range: that would draw the flat reading as tall as the stressed ones. Say if you want range normalisation instead.
- f0 cleanup: points more than 13 semitones from the median are dropped as tracker octave errors, gaps over 90 ms split the line (unvoiced), and a 5-point average smooths it. The real contours are rougher than the invented ones in a2, and the flat reading still falls at the end.
- The flat reading plays on blank paper with every word equal, then the arc, letters and strokes go straight as before.
- Five glosses, as given.

**Sound**

- One speaker button beside the pause button, off by default, with `aria-pressed` and a label that flips between "Turn sound on" and "Turn sound off".
- WebAudio buffers, decoded once after the first pointer or key event. The timeline is the clock: each cut starts its clip, and a resume or a toggle mid-cut starts the clip at the matching offset. Pausing or scrolling away stops it. A guard restarts the clip if it ever drifts more than 70 ms.
- Measured with sound on, comparing the audio clock to timeline time inside each cut: the largest gap over two full loops and into a third was 17 ms. After pause and resume it was 5 ms; after scrolling away and back, 9 ms.
- Reduced motion: no pause button and nothing autoplays; the speaker button plays the six clips in order.

**Theme toggle: cause and fix**

The handler and the class were working. Clicking it in a2 changed the page's computed colours. The cause was placement: the only toggle sat inside the hero, and the hero was near-black in both themes, so a click changed nothing you could see until you scrolled, and by then the button was gone. `body` also had no background of its own.

Fixed in a3: the toggle is `position: fixed`, `body` takes the paper colour, and the paper under the hero's horizon changes with the theme (charcoal stack in dark, the coloured stack dimmed in light).

Verified by clicking while the centrepiece ran: body and page went from rgb(243, 236, 221) to rgb(26, 25, 23), prose from rgb(31, 29, 26) to rgb(233, 226, 211), and back on the second click. The centrepiece's paper changes the same way during the flat reading. During the five material cuts the stage shows that material's own colours in both themes, on purpose.

**Hero**

The hero is now the sentence once, as the `h1`, flat and stacked on three lines with a caret: the typed version. About every three seconds one word takes the stress for a moment (lift, weight, warm colour) and the horizon lights under it, then it is plain text again. Date and byline sit under it in small mono. The arc is low in the frame as ground, not as the title's baseline; the title only gets seated on the arc in the centrepiece. I took the coordinator's idea and added the stack, so the title is 152px at 1280 and 64px on a phone instead of one small line. The byline name comes from the site's `og:site_name`.

**Prose**

Body is `src/content/blog/didnt-say.md` as-is. The opening list is set as seven rows of the sentence in the display serif, with the stressed word lifted, heavier and full ink and the rest at half strength, and the meaning beside it in mono. The 39 and 10 bits paragraphs are gone from the post, so nothing is set for them. The interruption figure moved under "Then there's interrupting"; the cards sit under "Typing is also slow".

**Libraries**

As a2, plus DrawSVG with a per-stroke function ease for the pitch line and WebAudio for sound. Still no anime.js.

**Port risks, new in a3**

- `stage.json` and six mp3s have to ship in `public/`; the page needs a static frame for when they fail to load.
- Sound follows the GSAP timeline. A long main-thread stall will be heard as a restart of the clip.
- The list shows seven readings and the stage plays five. A reader may look for "didn't" and "the".
- The clips sit in different pitch ranges (75 to 195 Hz in the first, 125 to 312 Hz in the second), so pitch height is only comparable inside one clip.

## a4: fourth pass, the list carries the sound

File: `direction-a4.html`, at `http://127.0.0.1:8765/ok-fine-mocks/direction-a4.html`. `direction-a3.html` is untouched.

Checked in headless Chromium by real mouse clicks and key presses at 1280 and 390, light and dark, reduced motion, no horizontal overflow. Not checked: Firefox, Safari, a real phone, and how it sounds.

**What changed**

- No hero. The page opens on paper with the sentence as a plain `h1` in the display serif, the date and byline under it, then the first paragraph and the list.
- The list of seven is upgraded in place from the markdown list: each line becomes one `button` holding the sentence, a small pitch trace, the meaning and a small speaker glyph. There is no button row.
- At rest a line looks as it did in a3: the stressed word lifted and heavier, the others at half strength, plus that reading's pitch trace drawn faintly under it, so the seven lines already look different before anything plays.
- On tap the line plays its clip. The stressed word drops flat, every word brightens at its own start time, and the stressed word lifts at its real start and stays up. The trace is redrawn in full ink in time with the sound. When the clip ends the line returns to rest.
- One line at a time. Tapping another stops the first; tapping the playing line stops it. Enter and Space work. Each button's label reads "Play: I didn't say she stole the money, stressed on she. Someone else did."
- Audio starts only on a tap. Clips are fetched and decoded on first use and cached.
- The centrepiece sits directly after "Typed out, all seven are the same sentence." It uses only the `loop: true` entries: I, say, she, stole, money, then flat. One loop is 19.8 s. It is silent by default and keeps its pause button and speaker toggle.
- If the centrepiece's sound is on and a list line is tapped, the centrepiece goes quiet until the line finishes, then picks its clip up at the right offset.
- The ending bookend is unchanged. The cards and the forty sheets are unchanged.
- Clip names are read from `stage.json` only.

**Verified**

| Line tapped | Clip that played | Word lifted |
|---|---|---|
| 1 | `i.mp3` | I |
| 2 | `didnt.mp3` | didn't |
| 3 | `say.mp3` | say |
| 4 | `she.mp3` | she |
| 5 | `stole.mp3` | stole |
| 6 | `the.mp3` | the |
| 7 | `money.mp3` | money |

- Second tap on another line: only the second was playing. Tap on the playing line: stopped. Enter and Space on a focused line: played `say.mp3` and lifted "say".
- Centrepiece with sound on, over two loops and into a third: the audio clock stayed within 16 ms of the timeline, except one sample taken 6 ms after a cut, which read 32 ms.
- Reduced motion: tapping a line plays the clip with nothing moving; the centrepiece is the static typed line with its five glosses and a speaker button; no pause buttons.

**Libraries**

GSAP SplitText (words in each list line), GSAP timeline per tap, DrawSVG with the per-stroke time ease for the trace, CustomEase (`okOut`, `okLift`), WebAudio. The rest is as a3.

**Port risks, new in a4**

- The list is built by rewriting the rendered markdown list, matched to `stage.json` by position. If the prose list changes order or length, the clips go to the wrong lines. Matching on the bold word would be safer.
- The button's `aria-label` replaces its content for screen readers, so the label has to carry the sentence, the stressed word and the meaning. Translated posts need translated labels; the clips stay English.
- In the last line the full stop sits apart from "money" because the stressed word has side margins.
- Seven clips plus the flat one are fetched on demand; a slow connection delays the first tap on each line.
- The centrepiece shows five readings and the list seven, now by design (`loop` flag).

## a5: fifth pass, the list collapses into the typed line

File: `direction-a5.html`, at `http://127.0.0.1:8765/ok-fine-mocks/direction-a5.html`. `direction-a4.html` is untouched.

Checked in headless Chromium at 1280 and 390, light and dark, by scrolling down and up twice with real clicks before and after, and under reduced motion. No console errors and no horizontal overflow. Not checked: Firefox, Safari, a real phone, touch scrolling, and how it sounds.

**What changed**

- The boxed centrepiece, its glosses, its pause button and its speaker toggle are gone, with all their code.
- The list makes the "typed" point itself. A ScrollTrigger-scrubbed timeline starts when the top of the "Typed out, all seven are the same sentence" paragraph reaches 88% of the viewport height and ends at 40%.
  1. Each stressed word settles to the baseline and loses its weight and the gap around it. The pitch traces go straight. The meanings fade.
  2. The seven rows, now identical, slide down onto the last row and the first six fade out.
  3. One line is left, in full ink, with a straight rule under it and a blinking caret.
- Scrolling back up reverses it.
- It is transforms and opacity only. The list keeps its height, so the paragraph never moves: its document position was identical at every point in both passes, at both widths. I chose reserving the height over pinning because pinning stops the page under the reader's finger. The cost is an empty gap above the typed line where the rows were, which is above the reader's eye by then.
- Collapsed, tapping the line plays `flat.mp3`: every word brightens as it is spoken and nothing lifts. Its label becomes "Play: I didn't say she stole the money, typed, with no stress", and the six hidden rows leave the tab order.
- Open, each row plays its own clip as in a4. Rows cannot be tapped while they are moving, and anything playing stops when the scrub starts.
- Reduced motion: no scrub. The list stays open and a static typed line with a caret sits under the paragraph; tapping it plays `flat.mp3`.
- `loop` in `stage.json` is not read by anything.
- Everything else is as a4: title, cards, forty sheets, ending bookend, theme toggle.

**Verified**

- Down: all seven rows at the same position, six hidden, state typed. Up: every row back at its original position, all visible, state open. Same result on the second pass.
- Open, tap on row 3: `say.mp3`, "say" lifted. Collapsed, tap on the line: `flat.mp3`, nothing lifted.
- Final line: all eight pieces (seven words and the full stop) at opacity 1 in the ink colour.

**Libraries**

GSAP timeline scrubbed by ScrollTrigger; MorphSVG for the traces going straight; SplitText words; CustomEase. I did not use Flip: the rows only need a vertical offset, which is measured once per build.

**Bug found on the way**

Clearing all inline styles on the words before a rebuild also removed SplitText's own `inline-block`, which stacked every word on its own line. The rebuild now clears only the properties the scrub sets.

**Port risks, new in a5**

- Tweening the margin around the stressed word reflows seven short lines during the first third of the scrub. It was smooth here; if it stutters on a phone, replace it with a transform on the words after it.
- Midway, seven lines of text sit on top of each other and look heavy for a moment before six fade.
- The scrub range is tied to the paragraph that follows the list. If the prose puts anything between them, the trigger has to move.
- On a phone the meanings sit under each sentence, so the gap left above the typed line is taller (about 590px against 520px on desktop).

## a6: sixth pass, title, prose formatting, closing scene

File: `direction-a6.html`, at `http://127.0.0.1:8765/ok-fine-mocks/direction-a6.html`. `direction-a5.html` is untouched by me.

Checked in headless Chromium at 1280 and 390, light and dark, scrubbing down and up twice, with real clicks on rows 6 and 7 and on the collapsed line, and under reduced motion. No console errors, no horizontal overflow, no fixed-position element inside the page or the closing scene. Not checked: Firefox, Safari, a real phone, touch scrolling, how it sounds.

**Title**

"Text != Tone", as written. "Text" and "Tone" are in the display serif; "!=" is two characters in IBM Plex Mono with ligatures off, in the emphasis colour. `<title>` is updated.

**Prose**

Re-pulled whole from `src/content/blog/text-is-not-tone.md`. In the list, the stressed word is now `<strong>` (the markdown is `**word**`), which frees `<em>` for the new italic in "just not *that* money".

**The fold**

It now triggers on "Now type it." and runs from the paragraph's top at 68% of the viewport to 28%. In a5 it started at 88%, which meant rows 6 and 7 had already started folding by the time they were in comfortable reach, and could not be tapped. That is fixed: both play their own clips while open. It is still reserved height plus a scrubbed transform, no pin.

**Inline formatting**

| Element | Treatment | Contrast on the page, light / dark |
|---|---|---|
| Body | Spectral 400 | 14.3 / 13.6 |
| Italic | Spectral Italic 500, a real face, in a rust colour (`#8a3a1c` / `#f0a47c`) | 6.6 / 8.6 |
| Bold | Spectral 700, a real face | as body |
| Links | Blue (`#2f5f8f` / `#a9c7e6`) with an underline; on hover the underline thickens and goes solid and the link gets a tint | 5.7 / 10.0 |
| Headings | Spectral 700 at 2rem against 1.2rem body | as body |
| Stats | IBM Plex Mono 500, tabular figures, on 80%, 59%, 78%, 93% and the five rate phrases | as body |
| Small labels | unchanged | 4.7 / 5.7 |

`font-synthesis: none` is set on the column, so a missing face shows as upright text and not as a faked slant. The browser reported Spectral Italic 500 and Spectral 700 as loaded. Headings moved from Instrument Serif to Spectral Bold because Instrument Serif has one weight and could not give a weight step.

**Closing scene**

- The ending stage is 66svh and the site footer follows it with no gap, on one background. Measured: both `rgb(11, 10, 9)`, 0px between them, 528px + 560px at 800px tall.
- The paper under the horizon is now six thin bands that end in the footer's own black, with a short fade at the bottom of the stage, so no band is cut off at the join. The footer's hands, "@" and faint word read as the end card under the horizon.
- The footer in the mock is a stand-in copied from `src/components/site-footer.tsx`: same layout, the real hand images from the dev server as masks in flat gold, the real fonts from Fontshare, the word "Creation", the credit line. It has no dithering, no pet and no contact card.

Scoped class and the CSS the port needs:

```css
/* on the page root, like .pal-space and .vg-space */
.tone-night .site-footer { background-color: #0b0a09; }
```

The ending stage's own background has to be the same `#0b0a09`. Nothing else in the footer is changed.

**Constraints from `.page-enter`**

- The fold does not pin.
- The grain overlay was `position: fixed` on `body`. It is now absolute, on the page block and on the closing scene.
- ScrollTrigger is used only for scrub and for pausing loops offscreen.

**Mock-only elements, not to port**

- The "← blog" link at the top.
- The light/dark toggle (fixed; the site header's toggle replaces it).
- The date and byline line, if the site's post header replaces it.
- The footer stand-in and its two Fontshare `<link>` tags.
- `window.readings`, `window.collapse` and `window.film`-style hooks, which exist for the checks.

**Port risks, new in a6**

- The rust italic and blue link colours are new to the site's palette (the site uses `paper-deep` for links). They pass contrast, but they are a choice to confirm.
- The closing scene depends on the footer being the next thing after the stage. Anything the layout puts between them (the post signoff, for instance) breaks the single frame.
- The list upgrade runs after `stage.json` loads. On a slow load the list is plain markdown for a moment, then gains buttons and traces; in one loaded-down test run that took over three seconds.

## a7: seventh pass, other scripts, icons, nav chip

File: `direction-a7.html`, at `http://127.0.0.1:8765/ok-fine-mocks/direction-a7.html`. `direction-a6.html` is untouched.

Checked in headless Chromium at 1280 and 390, light and dark: the fold scrubbed down and up twice, a real click on row 7, both new figures captured across their loops, and reduced motion. No console errors, no horizontal overflow, no fixed-position element in the page or closing scene. Not checked: Firefox, Safari, a real phone, and a reader of Arabic or Chinese looking at it.

**Prose**

Re-pulled from `src/content/blog/text-is-not-tone.md` after the last renames. A script compared the mock against the file block by block: all 32 blocks match, with the five headings "So... what'd get lost?", "What if it's NOT English?", "Typing is just kinda slow", "Can't we just use voice then?" and "Why tho?", and 16 italics in each. No figure was anchored on heading text: the fold follows the list's next paragraph, and the others are placed in the markup.

**Mandarin figure**, after the Mandarin paragraph

- Four cells: the tone drawn as a pitch line, the character, the pinyin, the meaning. Tone 1 is level and high, 2 rises, 3 dips, 4 falls.
- Loop, 9 s: the four lines go level, the tone marks come off (mā, má, mǎ, mà become "ma" in the mono), the characters and meanings fade, and the four cells slide onto one spot, leaving one "ma" under one flat line. Then it opens again.
- The poem line sits under it and does the same move at the same time: the characters dim and the toned pinyin is replaced by "shi" twelve times.
- Reduced motion: all four words with their lines, each with its toneless form under it, and the poem with both romanisations.

**Arabic figure**, after the Arabic paragraph

- Four cells, each كتب: one stays bare ("k-t-b, as written"), and the vowel marks fade in on the other three in turn with their transliteration and meaning, then all fade back to four identical bare words. Loop, 9 s.
- Every Arabic run has `lang="ar"` and `dir="rtl"`, in the figure and in the prose. Computed direction is rtl and the face in use is Noto Naskh Arabic.
- Rendering check at both widths: the three letters join correctly, and the marks sit where they should (kataba: three fathas above; kutiba: damma above, kasra below the middle letter, fatha above; kutub: two dammas, none on the last letter).
- The marked word is laid over the bare one. Measured, the two are the same width with a 0px offset (133.2px at 1280, 79.4px at 390), so only the marks appear to arrive. Once a marked word is fully in, the bare copy under it is switched off; with both showing the letters drew heavier than the bare cell beside them.
- Reduced motion: the bare word and all three readings, with their glosses.

Both figures are flat and ruled like the list, with no card, loop silently, pause offscreen and have one pause button.

**Fonts added**

- Noto Serif SC 500, requested with `text=` for only the 16 characters the post uses.
- Noto Naskh Arabic 500, whole.
- Chinese runs carry `lang="zh-Hans"`. The site already loads Noto Sans SC for its zh locale; this is the serif, for this post only.

**Icons and controls**

No typed arrows or glyphs are left in the file (searched for the arrow, triangle and pause characters: none). Each control and what it maps to in the site:

| Control in the mock | Icon | In the port |
|---|---|---|
| "back to blog" chip at the top | lucide `arrow-left` | The existing back chip in `src/routes/blog/post.tsx` (`TLink` with `rounded border ... font-mono text-xs uppercase tracking-[0.2em] text-paper-deep hover:border-gold`), plus `<ArrowLeft/>` from lucide-react. The site's label is `[ back to blog ]`; I dropped the brackets because the icon replaces them. |
| Pause button on each looping figure | lucide `pause` / `play` | New small component; `<Pause/>` and `<Play/>` from lucide-react. Nothing equivalent exists in the site yet. |
| Speaker mark on each list row and on the typed line | lucide `volume-2` | `<Volume2/>` from lucide-react, inside the row button. |
| Theme toggle | text only | Mock only; the site header's toggle. |

`volume-x` is not used: nothing on the page has a muted state since the looping centrepiece was removed in a5. The chip has a hover state (gold border, the arrow nudges left), a pressed state (drops 1px, gold tint) and a gold focus ring. `src/components/icons.tsx` has `ArrowRight` and `ArrowDown` at stroke 2.25; lucide's default is 2, which is what the mock uses, so pick one when porting.

**Mock-only elements, not to port**

As a6: the theme toggle, the date and byline line if the site's post header replaces it, the footer stand-in and its Fontshare links, and the `window.*` test hooks. The back chip is now a stand-in for the site's own.

**Port risks, new in a7**

- The Mandarin fold measures the four cells and moves them to the middle of their row, so it is rebuilt on width change like the list fold. On a phone the cells are a 2 by 2 grid and converge on its centre.
- The Arabic overlay relies on the marked and bare words having the same advance width. That holds for Noto Naskh Arabic here; a fallback face may not, so the figure should not render until the font has loaded.
- The pinyin tone marks need Spectral Italic's Latin Extended range, which Google Fonts serves as a separate subset; a self-hosted copy has to include it.
- Two more web fonts for one post. The CJK request is small because of `text=`; if the prose gains a character, the list has to be updated or that character falls back.

## Recommendation

A, with B's interrupt figure restyled into it. A is the direction that uses what the author liked about the teaser, and it is the one where the motion is the argument. B is the strongest on the "typed" side of the story and has the only working interruption. C is the safe one.

Lazier option: A's centrepiece alone, dropped into the existing shared prose shell as one component, with the stock hero and no tapes or scroll ending.
