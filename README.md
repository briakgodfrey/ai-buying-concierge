# AI Buying Concierge

A "Help me choose" assistant that asks small business buyers a few plain questions, then recommends three laptops using only facts it can verify against the catalog.

A self-directed concept project. Not built for or affiliated with any company. The product spec and wireframes are written up in the [case study](https://briakgodfrey.github.io/portfolio/work/concierge.html).

## Status

- [x] Product spec and wireframes
- [x] Design tokens: color (light and dark), type, spacing, radius
- [ ] Components
- [ ] Question step, results, no match, and catalog unavailable screens

## How it's built

Plain HTML, CSS and a little JavaScript. No framework and no build step.

| File | What's in it |
| --- | --- |
| `css/tokens.css` | Design tokens as CSS variables. Primitives first, then semantic tokens for light and dark. These match the Figma variables one to one. |
| `css/base.css` | Reset, one class per text style, focus ring, and the theme switch |
| `js/theme.js` | Light and dark mode. Starts in your system theme and remembers your choice. |
| `foundations.html` | A live specimen of the tokens |

## Design decisions

- **Pine** marks actions and facts checked against the catalog.
- **Iris** is reserved for the "AI-assisted" label, so AI content is always marked.
- **Amber** flags budget gaps. Nothing uses alarm red for a catalog outage, because that isn't the buyer's error.
- **Catalog facts** (specs, prices, stock) are set in Geist Mono, so real data never looks like generated text.
- Every text color pair meets WCAG AA in both themes. Controls are at least 44px tall.
