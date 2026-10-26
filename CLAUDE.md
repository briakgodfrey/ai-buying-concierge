# CLAUDE.md: AI Buying Concierge

Instructions for AI coding agents working in this repo. Read this before changing anything. The goal: any screen an agent builds should look and behave like it was designed here on purpose.

## What this is

A "Help me choose" assistant for small business laptop buyers. It asks a few plain questions, then recommends three laptops using only facts it can verify against the catalog. A self-initiated concept, not affiliated with any company.

Plain HTML, CSS and a little JavaScript. No framework, no build step, no dependencies. Do not add any.

## File map

| File | Role | Rule |
| --- | --- | --- |
| `css/tokens.css` | Design tokens. Mirrors the Figma variables one to one. | The only file where raw values (hex, px) live. |
| `css/base.css` | Reset, text styles, focus ring, theme switch | Shared foundations only. |
| `css/components.css` | Buttons, chips, answer options, recommendation card | Built only from semantic tokens. |
| `css/concierge.css` | The concierge flow and results | Built only from semantic tokens. |
| `js/catalog.js` | The invented catalog | The only source of specs, prices and stock. |
| `js/recommend.js` | Turns answers into picks with simple rules | Rules stand in for the AI model. Keep them readable. |
| `foundations.html`, `components.html` | Live specimens | Update these whenever a token or component changes. |

Keep CSS in `.css` files. Never add inline `style` attributes or `<style>` blocks.

## Tokens: the most important rules

Tokens have two layers:

1. **Primitives** (`--ink-700`, `--cobalt-600`, `--space-4`): raw values. Only `tokens.css` may define or use them.
2. **Semantic tokens** (`--color-text-secondary`, `--color-bg-accent`): what components use. Only this layer changes between light and dark.

- Components and pages use **semantic tokens only.** Never a primitive, never a hex code, never a raw px value for color, spacing, radius or type.
- If no semantic token fits, **stop and say so.** Propose a new one in both light and dark. Do not invent a one-off value.
- New tokens need a matching Figma variable. Flag it so the Figma file can be updated by hand.
- Spacing comes from the 4px scale (`--space-1` to `--space-16`). Radius from `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`.

## Color has meaning

| Color | Means | Never use it for |
| --- | --- | --- |
| Cobalt (accent) | Actions, and facts checked against the catalog | Decoration |
| Orchid (AI) | The "AI-assisted" label and AI-written reasons. Also the focus ring. | Anything that isn't AI or focus |
| Amber (warning) | Budget gaps and things the buyer should know | Errors |
| Red (critical) | Real errors the buyer caused or must fix | A catalog outage. That isn't the buyer's fault, so it never uses red. |

Status is never shown by color alone. Pair every color with a word or icon.

## Type

- Text styles come from the classes in `base.css`. Do not set font sizes directly.
- **Catalog facts (specs, prices, stock) are always set in Geist Mono** (`--font-mono`), so real data never looks like generated text.
- AI-written reasons are always labeled as AI-assisted and visually distinct from catalog facts.

## Every component needs every state

When you build or change a component, cover all of these and add them to `components.html`:

default, hover, focus-visible, active or selected, disabled, loading (if it fetches), empty, and error.

Selected must never rely on color alone.

## Accessibility (WCAG AA, non-negotiable)

- Every text and background pair must meet WCAG AA contrast **in both light and dark themes.** Check both before finishing.
- Interactive controls are at least `--size-touch-min` (44px) tall.
- Use real HTML controls (buttons, checkboxes, a native `<dialog>`) before building custom ones.
- Focus stays inside open dialogs, Escape closes them, and focus returns to the button that opened them.
- Respect `prefers-reduced-motion`. Any animation must have a reduced-motion version.

## Honesty rules for the concierge

These are product rules, not style preferences:

- **Never show a spec, price or stock level that isn't in `js/catalog.js`.** No guessing, no placeholders that look real.
- If the catalog can't be reached, show **no recommendations at all.** Say so plainly, keep the buyer's answers, and offer "Try again" or a sales rep.
- Every price is for the whole order. If a promo covers only some units, say how many and show the math.
- "Best fit" is the best match within budget, never the most expensive option. Flag anything over budget.
- Talking to a person is always one click away.

## Writing on screen

- Plain, calm language. Say what happened and what to do next.
- Gender-neutral language for buyers and reps.
- No em dashes in any copy.

## How to work in this repo

1. Work in small, reviewable changes. One component or one screen at a time.
2. Before editing, say which files you'll touch and which tokens you'll use.
3. After editing, list what changed and what still needs checking (both themes, contrast, keyboard, reduced motion).
4. **Do not commit or push.** Leave the changes for review, and give the git commands to run.

## Before you say you're done

- [ ] No hex codes, primitives or raw px values outside `tokens.css`
- [ ] Every state covered and shown in `components.html`
- [ ] Contrast checked in light and dark
- [ ] Keyboard and focus work
- [ ] Reduced motion respected
- [ ] No invented catalog data
- [ ] AI content is labeled
