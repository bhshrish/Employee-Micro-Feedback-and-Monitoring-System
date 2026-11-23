# CalmWork — Frontend Guidelines & Design System

Source of truth: the five brand reference images (palette, hero tile, logo variants, reset-password screen). Calm, confident, friendly, bold editorial feel. No dashboard clutter.

---

## 1. Color tokens (use ONLY these)

| Token | Hex | Use |
|---|---|---|
| `--cw-primary` | `#177687` | Teal. Large surfaces, cards, logo, links, headings on light backgrounds |
| `--cw-accent` | `#FFDD00` | Yellow. One emphasized word, tiny badges, focus ring on teal, a single stat. **Never a large background** |
| `--cw-cream` | `#FFFCF1` | Text and icons on teal; warm section background |
| `--cw-black` | `#202020` | Body text on light; circular action button |
| `--cw-white` | `#F8F8FF` | Page background, input fields |
| `--cw-grey` | `#8F8F8F` | Secondary text, placeholders, borders, disabled |
| `--cw-cream-60` | cream at 60% opacity | Eyebrow labels on teal |

Derived (allowed): `--cw-primary-hover` (teal 8% darker), `--cw-primary-10` (teal at 10% for tints), `--cw-error` use **cream text + yellow warning icon on teal**, and on white use `#B3261E` for error text only. No red-heavy UI.

```css
:root {
  --cw-primary:#177687; --cw-accent:#FFDD00; --cw-cream:#FFFCF1;
  --cw-black:#202020;  --cw-white:#F8F8FF;  --cw-grey:#8F8F8F;
  --radius-tile:48px; --radius-card:32px; --radius-sm:16px; --radius-pill:9999px;
}
```
Tailwind: extend `colors.cw.{primary,accent,cream,black,white,grey}`. **No hex values in components.**

Contrast rules: cream on teal, teal or black on white. Yellow text appears **only on teal**. Grey text on white must be at least 4.5:1 (grey `#8F8F8F` fails on white at small sizes, so use it only for placeholders and large text; use black at 70% for small secondary text).

## 2. Typography

- Font: **Figtree** (300, 400, 500, 700, 800, 900) via `next/font`.
- Headlines: 800–900, `letter-spacing:-0.03em`, `line-height:0.95–1.0`, fluid size `clamp(2.5rem, 7vw, 6rem)`.
- **Mixed-weight headline pattern:** one line light (300–400) + one line extra-bold (800–900), e.g. "Reset your" / **Password**.
- **Emphasis word:** italic, weight 300, accent yellow, inside a bold headline (e.g. "A *calmer* way to know how work feels."). Only on teal surfaces.
- Eyebrow: uppercase, bold, `letter-spacing:0.15em`, 12–14px, cream at 60%.
- Body: 400, 16–20px, line-height 1.5.
- Feature taglines: italic 400, one row, wide gaps, no bullets.

| Style | Size (desktop) | Weight |
|---|---|---|
| Display | 96px | 900 |
| H1 | 64px | 800 |
| H2 | 40px | 800 |
| H3 | 24px | 700 |
| Body L | 20px | 400 |
| Body | 16px | 400 |
| Caption | 13px | 500 |

## 3. Shape and spacing

- Main containers (hero tile, auth card): radius 40–56px. Cards: 32px. Small tiles and chips: 16px. Inputs and buttons: pill.
- Flat design: **no gradients, no heavy shadows, no glassmorphism.** If elevation is needed use `0 1px 2px rgba(32,32,32,.08)` on white surfaces only.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96. Generous padding (cards 32–48px).
- Max content width 1200px; auth card 520px.

## 4. Logo

Mark = dome/arc + solid circle (head) + infinity loop. Wordmark = **calm** (bold) + **work** (light), same size, one line.
- Variants: teal on white/light, cream on teal, icon-only for favicon/compact.
- Component: `<Logo variant="color|cream" iconOnly />` as inline SVG. **Use the exported brand SVG; do not redraw it.**
- Placement: top-left, 48–64px margin (24px on mobile). Clear space = height of the head circle on all sides.

## 5. Core components (all in `components/ui/`)

| Component | Spec |
|---|---|
| `Button` | Variants: `circle-arrow` (black `#202020`, white arrow, 56–64px, thin white ring when inside input), `solid` (teal bg, cream text, pill), `outline` (teal border), `ghost`. Min touch target 44px. |
| `PillInput` | White, 64px tall, fully rounded, no border, 20px padding. Label above in cream (on teal). Circle-arrow submit docked on the right when it is a single-field form. |
| `TealCard` | Teal bg, radius 48px, padding 48px, cream text. Auth card width 520px, portrait proportions, empty space at bottom. |
| `Heading` | Props: `light`, `bold`, `emphasis`. Renders the mixed-weight + italic-yellow pattern. |
| `Eyebrow`, `TaglineRow`, `Badge`, `Stat`, `TrialBanner`, `EmptyState`, `Toast`, `Modal`, `DataTable`, `RiskPill`, `ScoreRing`, `TrendChart` | Built from the tokens above. |

Inside the app (after login): white page, teal headings, cream (`#FFFCF1`) section backgrounds, teal rounded cards. Yellow only for small highlights (selected state, one key stat).

Risk bands (never red): **Healthy** = teal tint, **Watch** = yellow tint with black text, **At risk** = teal solid with a cream alert icon + label. Always pair color with text/icon.

## 6. Form states (every input)

- Default: white pill.
- Focus: 3px ring, **yellow on teal surfaces, teal on white surfaces**.
- Error: inline message below, cream text on teal with a yellow warning icon (on white: `#B3261E` text + icon). Set `aria-invalid` and `aria-describedby`.
- Loading: arrow replaced by spinner, input disabled.
- Success: form replaced by a "Check your inbox" style message.
- Disabled: grey text, 60% opacity.

## 7. Key screens (build to match the references)

1. **Hero tile:** teal rounded tile, cream logo top-left, muted uppercase eyebrow, 3-line display headline with the yellow italic word, taglines row at bottom, lots of empty space in between.
2. **Auth pages** (sign in, sign up, join with code, forgot/reset password): white page, teal logo top-left, centered teal card with "← Back to sign in" link, mixed-weight heading, helper text, label + pill input + circle-arrow button.
3. **Business dashboard / Employee dashboard / Check-in / Planner / Reports / Billing:** white background, teal headings, cream sections, teal cards.

## 8. Microcopy

Warm, reassuring, privacy-first, short sentences. Say "private", "anonymous", "no surveillance". Avoid alarming language ("critical", "failing", "danger"). Alerts say "Worth a conversation", not "Problem detected".

## 9. Conventions

- File names: components `PascalCase.jsx`, hooks `useThing.js`, utils `kebab-case.js`.
- One component per file; keep component props and expected data shapes clear and consistent.
- Server Components by default; add `"use client"` only when needed.
- No inline styles; Tailwind classes using token colors (`bg-cw-primary`). No arbitrary hex like `bg-[#177687]`.
- No `any`. No data fetching inside presentational components; use hooks in `lib/hooks/`.
- Every API call through `lib/api.js` and React Query. Show loading skeletons, empty states, and error states for every data view.
- Forms: react-hook-form + zod, same schema as backend.

## 10. Responsiveness

- Mobile first. Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.
- On mobile the teal card goes full-width, radius 32px, headline uses `clamp()`.
- Tables become stacked cards under `md`. Wide tables/charts scroll inside their own `overflow-x-auto` container; the page body never scrolls sideways.
- Safe-area padding for notches (`viewport-fit=cover`, `env(safe-area-inset-*)`).

## 11. Accessibility

- 4.5:1 minimum text contrast; visible focus on every interactive element.
- Icon-only buttons need `aria-label` (e.g. the arrow submit: "Send reset link").
- Full keyboard support; modals trap focus and close on Esc.
- Respect `prefers-reduced-motion`. Motion is minimal and gentle (150–250ms fades).
- Never convey status by color alone.
- Support `prefers-color-scheme` only after a dark palette is defined; until then, light only.