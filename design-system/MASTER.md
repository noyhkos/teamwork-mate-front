# 팀사주 Design System — MASTER

> **Source of truth.** Read before adding any UI.
> Live reference: `/design-system` — it renders every token and component on
> one page. When a rule here changes, change that page too.

Tokens live in `app/globals.css`. Components live in `components/ui/`.
Mobile-first: every rule below is written for a phone and relaxed upward.

---

## 1. Brand

- **Aesthetic** — 한지(hanji) paper, 먹(ink) type, 오방색(obangsaek) accents.
  Traditional Korean stationery, not a fortune-telling app.
- **Tone** — playful and light. This is 재미용, and the UI should never
  imply the reading is authoritative.
- **The seal** — 주홍(vermilion) is the single accent. It marks exactly one
  thing per screen: the action you came here for.
- **오행 rule** — the five-colour bar (`.ohaeng-rule`) is the brand mark. It
  appears as page chrome, sheet handle, and loading pulse. Nothing else may
  use the five colours as decoration.

---

## 2. Color tokens

CSS custom properties in `app/globals.css`, surfaced as Tailwind colours.
**Never write a hex or `rgb()` in a component.**

| Token | Hex | Use |
|---|---|---|
| `paper` | `#f6f0e1` | Page background |
| `paper-soft` | `#efe7d2` | Recessed blocks, code strips |
| `card` | `#fbf7ec` | Card surface (`.washi`) |
| `ink` | `#26221c` | Body text, primary button |
| `ink-soft` | `#6d6558` | Secondary text |
| `ink-faint` | `#b4aa96` | Captions, disabled, ordinals |
| `vermilion` | `#c3402b` | The seal — primary CTA, focus ring, errors |
| `wood` `fire` `earth` `metal` `water` | 오행 | Element chips + `.ohaeng-rule` only |

There is no dark mode. Hanji is a light material; a dark variant would be a
different brand, not a theme.

---

## 3. Typography

- **Display / headings** — MaruBuri (`font-serif`), local `.ttf`.
- **Body** — Noto Sans KR (`font-sans`), the default.
- **Eyebrow** — `text-tag` (11px / 0.28em tracking). Replaces every ad-hoc
  `text-xs tracking-[…]` pair.

Sizes are Tailwind defaults. **No arbitrary `text-[…]`** except the one
`text-[0.6875rem]` inside `Chip`'s suffix.

Korean wraps between words, never inside them — `word-break: keep-all` plus
`overflow-wrap: anywhere` is applied globally to `h1 h2 h3 p li`. Long
nicknames and archetype names are the reason.

Display sizes step down on phones: the archetype headline is `text-3xl`
and only reaches `text-4xl` at `sm:`.

---

## 4. Layout & spacing

- **Radius — three rungs, nothing between.**
  `rounded-card` (3px) for cards and surfaces · `rounded-control` (8px) for
  buttons, inputs, sheets · `rounded-full` for chips.
  Paper is cut, not moulded.
- **Card** = `.washi rounded-card p-5`, via `<Card>`.
- **Page chrome** — `mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10`.
- **Bottom padding** on the last element of a scrolling surface uses
  `pb-[max(…,env(safe-area-inset-bottom))]` so the iOS home indicator never
  covers content.

**Test at 320px** (iPhone SE). Every layout is single-column there; the only
multi-column grid in the app is the calendar's 7-day week.

---

## 5. Interaction

- **Tap targets ≥ 44×44px.** Enforced by `min-h-touch` (`--spacing-touch`),
  which `Button`, `Select`, `TextInput` and `CheckboxRow` all carry. Height,
  not padding, holds the floor so short copy cannot shrink a control.
  For a checkbox the target is the labelled row, not the 20px box.
  **One exception:** calendar day cells. Seven columns cannot each be 44px
  inside a 320px screen, so they land at ~29px — above the 24px WCAG 2.5.8
  minimum, and the same compromise every date picker makes. Nothing else
  may claim this exception.
- **Controls render at 16px** (`input, select, textarea { font-size: 1rem }`).
  This is not a taste choice: iOS Safari zooms the whole page when a focused
  control is smaller, and never zooms back out. Visual scale comes from
  padding.
- **`cursor-pointer`** explicitly on every clickable element.
- **Focus** — one treatment, `.focus-seal` → 2px vermilion outline with 2px
  offset. Never removed, never 1px.
- **Hover** — colour and opacity only. No `scale`, no `translate`.
- **Motion** — 150–250ms. A global `prefers-reduced-motion` block neutralises
  every animation and transition; animated utilities still pair with
  `motion-reduce:` for clarity at the call site.

---

## 6. Accessibility (binding)

- Every control has a `<label htmlFor>`. `<Field>` generates the id and wires
  `aria-describedby` / `aria-invalid` so callers cannot forget.
- Errors carry `role="alert"` and are Korean.
- Single-choice groups use `<Segmented>` → `role="radiogroup"` + `role="radio"`
  + `aria-checked`, with Korean `aria-label` per option.
- The calendar is a `role="grid"` with `role="gridcell"` buttons, a roving
  tabindex, arrow-key navigation and `aria-selected`.
- `<Sheet>` owns the modal contract: focus enters on open and returns to the
  trigger on close, Tab is trapped, ESC closes, body scroll is locked,
  `role="dialog" aria-modal aria-labelledby`.
- Icon-only buttons carry a Korean `aria-label`; decorative SVG and the
  `.ohaeng-rule` carry `aria-hidden`.
- Emoji appear **in copy** (🔮 ✨ 🌊) as tone, never as the label of an
  interactive control — an icon-only button always gets an inline SVG.

---

## 7. Surfaces

| Surface | Shape |
|---|---|
| `/` landing | Centred headline, one card with the create form, optional "이어서 하기" |
| `/t/[token]` team | Header · state slot · compact link row · roster · add |
| `/r/[slug]` report | Long scroll: header, share card, harmony, ranked roles, pairs, balance, CTA |
| `/design-system` | This system, rendered |

The team page is the waiting room. The **roster is the body of the page** — a
vertical stack of member cards, not chips — and a single slot above it holds
whichever state the team is in: the generate button, the "명식을 짓는 중"
card, or the link to the finished report. The invite link is one 44px row
that copies on tap, because it is plumbing rather than content. It polls
itself into the next state; no other screen exists between creating a team
and reading the report.

`.washi-marked` flags the one row that belongs to the person looking.

---

## 8. Voice

- `-요` throughout. Warm, short sentences.
- Never assert the reading is true. "…로 보여요", "…기운이에요".
- Numbers are framed as 적합도/점수, never as ranking a person's worth.
- The bottom rung of the role ladder is `일반 멤버` — a real role, never
  rendered as leftover or "duplicate".

---

## 9. Anti-patterns

| Don't | Do |
|---|---|
| `rounded-lg`, `rounded-xl`, `rounded-2xl` | `rounded-card` / `rounded-control` / `rounded-full` |
| `text-sm` on an `<input>` | 16px is mandatory — iOS zoom |
| Two-column form grid on a phone | Single column; `Segmented` for short choices |
| `<input type="date">` | `<DateField>` — locale-independent `yyyy-mm-dd` |
| Bare `<button>` with custom classes | `<Button>` |
| The native `<select>` arrow (it sits hard against the border) | `.select-chevron` — drawn 12px in, mirroring the left padding |
| `text-xs tracking-[0.35em]` | `text-tag` |
| Raw hex / `rgba()` in a component | A colour token — the only exception is the swatch list on `/design-system`, which documents the hexes |
| Emoji as an icon-only button label | Inline SVG + Korean `aria-label` |
| `<a href>` to an in-app route | `<Link>` |
| Reading `localStorage` in an effect | `useStored` / `setStored` (`lib/storage.ts`) |

---

## 10. Component inventory

| Component | File | Notes |
|---|---|---|
| `Button` | `components/ui/button.tsx` | `primary` `seal` `outline` `quiet`; `loading`; 44px floor |
| `Card` / `SectionTitle` | `components/ui/card.tsx` | The hanji sheet |
| `Chip` | `components/ui/chip.tsx` | Read-only pill; optional colour dot |
| `Field` / `TextInput` / `Select` / `CheckboxRow` | `components/ui/field.tsx` | Label + aria + error wiring |
| `Segmented` | `components/ui/segmented.tsx` | 2–3 option radiogroup |
| `Sheet` | `components/ui/sheet.tsx` | Bottom sheet, full modal contract |
| `DateField` | `components/ui/date-field.tsx` | Typed digits + custom calendar popover |
| `MemberForm` | `components/MemberForm.tsx` | Composed from the above |
| `ShareBar` | `components/ShareBar.tsx` | `navigator.share` → clipboard |

No component library. Radix and shadcn/ui were both considered and skipped:
the app has four surfaces, and the one genuinely custom control it needs (a
birth-date calendar that opens on a chosen year) would have been fought
rather than helped by a generic date picker.

---

## 11. When to bump this doc

- A new colour token enters the theme.
- A pattern is reused a third time — promote it to `components/ui/`.
- A new surface appears.
- An accessibility rule changes.

Update `/design-system` in the same commit. One-off tokens fragment the
system fast; push back unless the need is written down here.
