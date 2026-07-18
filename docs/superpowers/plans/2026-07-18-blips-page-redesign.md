# Blips Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign /blips from rigid 3-column grid to loose Pinterest-style masonry with expand-in-place media cards.

**Architecture:** CSS Columns for masonry layout (no JS calculation needed). Framer-motion `layoutId` + `AnimatePresence` for FLIP-style expand animation. Single file change.

**Tech Stack:** React, Tailwind CSS, framer-motion (already installed)

## Global Constraints

- No new dependencies
- Keep existing tape decorations and rotation aesthetic
- Maintain dark/light theme support (charcoal/bone palette)

---

## File Structure

**Modify:** `src/routes/blips/index.tsx`
- Remove: `Lightbox` component
- Add: `useOutsideClick` hook
- Modify: `BlipCard` → split logic for media vs text-only
- Modify: `BlipsPage` → CSS columns layout + expand state

---

### Task 1: CSS Columns Layout + Font Bumps

**Files:**
- Modify: `src/routes/blips/index.tsx:123-157` (BlipsPage component)

**Produces:**
- Masonry layout via CSS columns
- Responsive column count (1/2/3/4)
- Larger font sizes throughout

- [ ] **Step 1: Replace grid with CSS columns**

In `BlipsPage`, replace the `<ul>` grid classes:

```tsx
// Before:
<ul className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">

// After:
<ul className="mt-16 columns-1 gap-8 sm:columns-2 lg:columns-3 xl:columns-4">
```

- [ ] **Step 2: Add break-inside-avoid to cards**

In `BlipCard`, add to the `<li>` element:

```tsx
// Before:
<li
  className="group relative bg-bone shadow-md transition-transform hover:z-10 hover:scale-[1.02] hover:rotate-0 dark:bg-charcoal/80"
  style={{ transform: `rotate(${rotation})` }}
>

// After:
<li
  className="group relative mb-8 break-inside-avoid bg-bone shadow-md transition-transform hover:z-10 hover:scale-[1.02] hover:rotate-0 dark:bg-charcoal/80"
  style={{ transform: `rotate(${rotation})` }}
>
```

Note: `mb-8` replaces the grid gap for vertical spacing in columns layout.

- [ ] **Step 3: Bump font sizes**

Update these classes in `BlipCard`:

```tsx
// Date: text-[10px] → text-xs
<time
  dateTime={blip.date}
  className="font-mono text-xs uppercase tracking-[0.15em] text-gold"
>

// Body text: text-sm → text-base
<p className="mt-2 text-base leading-relaxed text-charcoal/85 dark:text-bone/85">

// Tags: text-[9px] → text-[10px]
<span
  key={t}
  className="bg-charcoal px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-bone dark:bg-bone dark:text-charcoal"
>
```

- [ ] **Step 4: Verify layout**

Run: `pnpm dev`

Check:
- Cards flow in columns, variable heights pack naturally
- 1 col on mobile, 2 on sm, 3 on lg, 4 on xl
- Fonts are visibly larger
- Spacing feels loose, not cramped

- [ ] **Step 5: Commit**

```bash
git add src/routes/blips/index.tsx
git commit -m "feat(blips): CSS columns masonry layout + larger fonts"
```

---

### Task 2: useOutsideClick Hook

**Files:**
- Modify: `src/routes/blips/index.tsx:1-20` (add hook at top of file)

**Produces:**
- `useOutsideClick(ref, callback)` hook for dismissing expanded cards

- [ ] **Step 1: Add useOutsideClick hook**

Add after the imports, before `VIDEO_EXTENSIONS`:

```tsx
function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  callback: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      callback(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, callback])
}
```

- [ ] **Step 2: Add useRef to imports**

Update the React import:

```tsx
// Before:
import { useState } from 'react'

// After:
import { useEffect, useRef, useState } from 'react'
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/blips/index.tsx
git commit -m "feat(blips): add useOutsideClick hook"
```

---

### Task 3: Expand-in-Place for Media Cards

**Files:**
- Modify: `src/routes/blips/index.tsx` (full file restructure)

**Consumes:**
- `useOutsideClick` hook from Task 2

**Produces:**
- `ExpandedCard` component with framer-motion animation
- Media cards expand on click, text-only cards don't
- Click outside or Escape to dismiss

- [ ] **Step 1: Add framer-motion imports**

```tsx
import { AnimatePresence, motion } from 'framer-motion'
```

- [ ] **Step 2: Remove Lightbox component**

Delete the entire `Lightbox` function (lines ~18-48 in current file).

- [ ] **Step 3: Add ExpandedCard component**

Add after `useOutsideClick` hook:

```tsx
function ExpandedCard({
  blip,
  onClose,
}: {
  blip: Blip
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useOutsideClick(ref, onClose)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const mediaSrc = blip.media ? getBlipMediaUrl(blip.media) : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 p-4 backdrop-blur-sm dark:bg-black/80"
    >
      <motion.div
        ref={ref}
        layoutId={`blip-${blip.date}-${blip.media}`}
        className="relative max-h-[85vh] w-full max-w-2xl overflow-auto bg-bone p-6 shadow-2xl dark:bg-charcoal"
      >
        {/* Tape decoration */}
        <div className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-1 bg-gold/60" />

        {mediaSrc && (
          <div className="mb-4 overflow-hidden">
            {isVideo(blip.media!) ? (
              <video src={mediaSrc} controls autoPlay className="w-full rounded" />
            ) : (
              <img src={mediaSrc} alt="" className="w-full rounded object-contain" />
            )}
          </div>
        )}

        <time
          dateTime={blip.date}
          className="font-mono text-xs uppercase tracking-[0.15em] text-gold"
        >
          {blip.date}
        </time>

        {blip.text && (
          <p className="mt-3 text-base leading-relaxed text-charcoal/85 dark:text-bone/85">
            {blip.text}
          </p>
        )}

        {blip.tags && blip.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {blip.tags.map((t) => (
              <span
                key={t}
                className="bg-charcoal px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-bone dark:bg-bone dark:text-charcoal"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 4: Update BlipCard for conditional click behavior**

Replace the `BlipCard` component:

```tsx
function BlipCard({
  blip,
  index,
  onExpand,
}: {
  blip: Blip
  index: number
  onExpand?: () => void
}) {
  const rotation = ROTATIONS[index % ROTATIONS.length]
  const tapeStyle = TAPE_STYLES[index % TAPE_STYLES.length]
  const mediaSrc = blip.media ? getBlipMediaUrl(blip.media) : null
  const hasMedia = !!mediaSrc
  const isClickable = hasMedia

  const cardContent = (
    <>
      {/* Tape decorations */}
      {tapeStyle === 'top' && (
        <div className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-2 bg-gold/50" />
      )}
      {tapeStyle === 'corners' && (
        <>
          <div className="absolute -left-3 -top-2 h-6 w-10 -rotate-[35deg] bg-gold/50" />
          <div className="absolute -right-3 -top-2 h-6 w-10 rotate-[35deg] bg-gold/50" />
        </>
      )}

      <div className="p-4">
        {hasMedia && (
          <div className="mb-3 overflow-hidden border border-charcoal/10 dark:border-bone/10">
            {isVideo(blip.media!) ? (
              <video src={mediaSrc!} muted className="aspect-video w-full object-cover" />
            ) : (
              <img src={mediaSrc!} alt="" className="aspect-video w-full object-cover" />
            )}
          </div>
        )}

        <time
          dateTime={blip.date}
          className="font-mono text-xs uppercase tracking-[0.15em] text-gold"
        >
          {blip.date}
        </time>

        {blip.text && (
          <p className="mt-2 text-base leading-relaxed text-charcoal/85 dark:text-bone/85">
            {blip.text}
          </p>
        )}

        {blip.tags && blip.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {blip.tags.map((t) => (
              <span
                key={t}
                className="bg-charcoal px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-bone dark:bg-bone dark:text-charcoal"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  )

  const baseClasses =
    'group relative mb-8 break-inside-avoid bg-bone shadow-md transition-all duration-300 hover:z-10 hover:scale-[1.02] hover:rotate-0 hover:shadow-lg dark:bg-charcoal/80'

  if (isClickable) {
    return (
      <motion.li
        layoutId={`blip-${blip.date}-${blip.media}`}
        className={`${baseClasses} cursor-pointer`}
        style={{ transform: `rotate(${rotation})` }}
        onClick={onExpand}
        whileHover={{ rotate: 0 }}
      >
        {cardContent}
      </motion.li>
    )
  }

  return (
    <li
      className={baseClasses}
      style={{ transform: `rotate(${rotation})` }}
    >
      {cardContent}
    </li>
  )
}
```

- [ ] **Step 5: Update BlipsPage with expand state**

Replace the `BlipsPage` component:

```tsx
export default function BlipsPage() {
  const [expandedBlip, setExpandedBlip] = useState<Blip | null>(null)

  return (
    <>
      <Meta title="Blips" description="Short-form updates: notes, screenshots, and clips as they happen." />

      <section className="relative mx-auto max-w-5xl px-6 pb-24 pt-36">
        <div className="relative">
          <SectionNumber n="05" label="blips" />
          <div className="relative mt-3 w-fit">
            <div className="absolute -left-10 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex">
              <JPLabel>断片</JPLabel>
              <span aria-hidden className="h-4 w-px bg-gold/50" />
            </div>
            <h1 className="font-display text-5xl font-black text-charcoal dark:text-bone">
              <DecryptedText text="Blips" speed={50} delay={100} />
            </h1>
          </div>
        </div>
        <Rule className="mt-4" />

        {blips.length === 0 && (
          <p className="mt-16 font-mono text-xs font-medium uppercase tracking-[0.25em] text-charcoal/65 dark:text-bone/65">
            nothing here yet
          </p>
        )}

        <ul className="mt-16 columns-1 gap-8 sm:columns-2 lg:columns-3 xl:columns-4">
          {blips.map((blip, i) => (
            <BlipCard
              key={`${blip.date}-${i}`}
              blip={blip}
              index={i}
              onExpand={blip.media ? () => setExpandedBlip(blip) : undefined}
            />
          ))}
        </ul>
      </section>

      <AnimatePresence>
        {expandedBlip && (
          <ExpandedCard blip={expandedBlip} onClose={() => setExpandedBlip(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
```

- [ ] **Step 6: Verify expand behavior**

Run: `pnpm dev`

Check:
- Media cards show pointer cursor, expand on click
- Text-only cards have no click behavior
- Expanded card animates smoothly (FLIP transition)
- Click outside or Escape dismisses
- Backdrop has blur effect

- [ ] **Step 7: Commit**

```bash
git add src/routes/blips/index.tsx
git commit -m "feat(blips): expand-in-place for media cards with framer-motion"
```

---

### Task 4: Polish and Cleanup

**Files:**
- Modify: `src/routes/blips/index.tsx`

**Produces:**
- Cleaned up code (remove unused state from old Lightbox pattern)
- Wider container for better masonry spread

- [ ] **Step 1: Verify no unused imports/code**

Check that these are removed:
- `Lightbox` component (deleted in Task 3)
- Any `expanded` state in `BlipCard` (replaced with parent state)

- [ ] **Step 2: Test full flow**

Run: `pnpm dev`

Verify:
- [ ] Mobile (1 col): cards stack, spacing loose
- [ ] Tablet (2 cols): masonry flows naturally
- [ ] Desktop (3 cols): good density
- [ ] Wide (4 cols): spreads nicely
- [ ] Hover: cards lift, shadow, rotation straightens
- [ ] Media card click: smooth expand animation
- [ ] Escape key: dismisses expanded card
- [ ] Click outside: dismisses expanded card
- [ ] Text-only cards: no click reaction
- [ ] Dark mode: all styles work

- [ ] **Step 3: Final commit**

```bash
git add src/routes/blips/index.tsx
git commit -m "feat(blips): complete redesign - masonry layout with expand-in-place"
```
