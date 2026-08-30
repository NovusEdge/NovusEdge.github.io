# Portfolio Adjustments Design

## 1. Fix Portfolio Light/Dark Theme Support

**Problem:** 
The portfolio index (`src/routes/portfolio/index.tsx`) hardcodes dark mode classes (`bg-charcoal`, `text-bone`, `border-bone/*`, and `bg-charcoal-tint/*`) across the entire page, slider, cards, search input, and section headers. Because of this, when the theme is toggled via the header, the rest of the site switches to light mode but the portfolio remains in a hybrid broken state.

**Solution:**
- Update all container and component styles to use adaptive classes.
- Use `bg-bone dark:bg-charcoal` for backgrounds.
- Use `text-charcoal dark:text-bone` for typography.
- Use `border-charcoal/12 dark:border-bone/12` and `bg-bone-tint/30 dark:bg-charcoal-tint/20` for borders and glass elements.
- Ensure the hero background (`PixelBlast`), crop marks, carousel, and group headers render with the correct contrast in both light and dark modes.

## 2. Floating `TooltipCard` for Outbound Projects

**Problem:**
Some projects don't have dedicated case study pages (i.e. `!hasPage(p.slug)`). These cards can feel somewhat "mid" and like dead ends compared to the rich detail pages of featured projects.

**Solution:**
- Implement a floating tooltip card based on the Aceternity UI component (`src/components/tooltip-card.tsx`).
- Use `framer-motion` (`motion.div`, `AnimatePresence`, `useMotionValue`, `useSpring`) to track the cursor with smooth spring physics when hovering over these outbound project cards.
- **Visuals:** A glassmorphic floating dossier card (`backdrop-blur-md border border-gold/30 bg-bone/95 dark:bg-charcoal/95 shadow-xl`).
- **Content within Tooltip:**
  - **Header:** Project title, Japanese glyph, target icon (e.g., `GitHub ↗`), and outbound destination domain.
  - **Body:** Expanded description and primary thesis.
  - **Footer:** Tech stack badges, language pill, phase/status indicator, and a call-to-action ("Click to view repository ↗").

## 3. Elevating Card Polish & Interactivity

**Problem:**
The project cards in the grid layout lack the premium, tactile feel present in other parts of the site.

**Solution:**
- **Radial Spotlight Glow:** Add a mouse-tracking ambient gold spotlight glow on the cards on hover to provide a premium feel.
- **Clear Hierarchy & Visual Cues:**
  - Case study cards (where `hasPage(p.slug)` is true) will get a prominent gold "Case Study →" indicator.
  - Outbound cards will trigger the new floating `TooltipCard` on hover and display a clean outbound icon badge.
- **Card Framing:** Retain the editorial corner registration crop marks (`Crops`) but add a subtle gold corner flash interaction on hover.
