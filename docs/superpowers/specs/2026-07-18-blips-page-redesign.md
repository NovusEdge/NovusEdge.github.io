# Blips Page Redesign

Redesign the /blips page from a rigid 3-column grid to a loose, Pinterest-style masonry layout with expand-in-place media cards.

## Layout

CSS Columns masonry with responsive column count:
- Mobile: 1 column
- Tablet (sm): 2 columns
- Desktop (lg): 3 columns
- Wide (xl): 4 columns

Generous gutters (`gap-6` to `gap-8`). Cards use `break-inside-avoid` to prevent splitting across columns.

## Card Variants

### Media Cards (prominent)
- Larger size, media fills top portion
- Text/date/tags below media
- Tape decoration on top
- Subtle rotation (-2deg to +2deg)
- Clickable — expands in place

### Text-only Cards (compact)
- Smaller footprint
- Just text + date + tags
- Same tape/rotation treatment
- Not clickable, read in place

## Typography

Bump font sizes:
- Date: `text-[10px]` → `text-xs`
- Body text: `text-sm` → `text-base`
- Tags: `text-[9px]` → `text-[10px]`

## Hover Effect (both card types)

- Scale up slightly (`scale-[1.02]`)
- Rotation straightens to `0deg`
- Subtle shadow lift
- Smooth transition

## Expand Interaction (Media Cards Only)

**Trigger:** Click on media card

**Animation:** framer-motion `layoutId` for FLIP-style transition (~300ms)
- Card expands from its position to centered overlay
- Background dims with backdrop blur

**Expanded state:**
- Media shown larger (max-width constrained to viewport)
- Full text content visible below
- Date + tags displayed
- Keeps polaroid styling (tape, shadow)

**Dismiss:**
- Click outside expanded card
- Press Escape key
- Card animates back to original position

**Accessibility:**
- Focus trapped while expanded
- Escape key closes
- `useOutsideClick` hook pattern

## What's Removed

- Rigid 3-column CSS Grid
- Separate lightbox modal component
- Cramped spacing

## Dependencies

- framer-motion (already installed)
- No new packages

## Files to Modify

- `src/routes/blips/index.tsx` — main page, layout + cards + expand logic
- `src/components/inline-blips.tsx` — no changes needed (just links to /blips)
