# Omnify — Public Pages Design (Engineering Neo-Brutalism)

Authoritative design language for **public / marketing pages** (LandingPage, Features, About, Contact, Pricing, legal, SandboxGate). These pages are seen by every visitor and set the brand tone. They are intentionally bold and distinctive — the opposite register from the internal product app (see `DESIGN-INTERNAL.md`).

> Scope: public pages only. Do NOT apply this language to the dashboard / management / form pages — those follow `DESIGN-INTERNAL.md`.

---

## 1. Philosophy
- **Engineering Neo-Brutalism.** Raw, structural, built-by-engineers-for-operators. No soft "bubbly SaaS template" look (no pastel, no floating rounded cards, no blurry drop-shadows).
- **Structural integrity.** Everything locked into strict grids and rigid 1px borders. Elements don't float; they're contained.
- **Stark contrast.** Guide the eye with extreme contrast in size and color, not with shadows/gradients.
- **Mechanical interaction.** Interactions feel tactile and heavy — buttons physically depress/shift like switches.

## 2. Typography
- **Display (`font-logo` = Syne / `font-display` = Space Grotesk):** massive hero headlines, page titles, footer "OMNIFY" watermark. Strictly UPPERCASE, `font-extrabold` (800), tight tracking (`tracking-tight` / `-0.04em`), aggressive line-height (`leading-[0.9]`). Scales to `text-6xl`–`text-7xl`.
- **Technical / metadata (`font-mono` = Space Mono):** form labels, secondary buttons, index markers (`[01]`), timestamps, status. Tiny (`text-[10px]`–`text-[13px]`), UPPERCASE, bold, loose tracking (`tracking-widest`).
- **Body (`font-sans` = Manrope):** paragraphs. `text-[14px]`–`text-[15px]`, medium, relaxed line-height.

## 3. Color
CSS vars in `web/src/index.css`:
- `--omni-ink` (#0A2540, deep navy/black) — primary text, thick borders, big type, high-contrast blocks.
- `--omni-brand` (#635BFF, electric indigo) — kinetic accent, used sparingly but aggressively: hard block shadows, focus rings, critical CTAs.
- `--omni-border` / `--omni-bg-subtle` — the rigid 1px grid structure that replaces drop-shadows.

## 4. Layout & geometry
- **1px grid architecture:** sections (Features, Steps, QnA) built as a parent with a dark bg/border holding `bg-white` children separated by `gap-px` → flawless architectural wireframe.
- **Zero radius:** strictly `rounded-none`.
- **Asymmetric borders:** inputs/panels use `border-2` + heavier `border-b-4` for physical depth (no CSS blur).
- **Neo-brutalist shadows (hard, offset, never blurred):** `shadow-[16px_16px_0px_0px_var(--omni-brand)]` for big CTA blocks; `shadow-[0_8px_0_0_var(--omni-brand)]` for buttons that shift on hover.

## 5. Motion
- Hover: elements move (`-translate-y-1 -translate-x-1`) while solid shadows expand → 3D mechanical pop.
- Icons: muted (opacity 40%) → snap to full opacity + brand color on hover.
- Entrances: `framer-motion` staggered reveals; aggressive type starts `y: 20` and snaps in.

## 6. Reference implementations
`web/src/pages/public/*` and `web/src/components/public/*` — e.g. `FeaturesPage.tsx` (gap-px grid + brutalist callout), `PublicNav.tsx`, `Hero.tsx`, `Footer.tsx`.

Status: public pages are considered **done / approved** by the product owner. Match this language for any new public page.
