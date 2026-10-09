# AI Buying Concierge

A "Help me choose" assistant that asks small business buyers a few plain questions, then recommends three laptops using only facts it can verify against the catalog.

A self-directed concept project. Not built for or affiliated with any company. The product spec and wireframes are written up in the [case study](https://briakgodfrey.github.io/portfolio/work/concierge.html).

## Status

- [x] Product spec and wireframes
- [x] Design tokens: color (light and dark), type, spacing, radius
- [x] Components: buttons, chips, answer options and recommendation cards, with every state
- [x] Question step: five plain questions in an accessible dialog, starting with quantity
- [ ] Results, no match, and catalog unavailable screens

## How it's built

Plain HTML, CSS and a little JavaScript. No framework and no build step.

| File | What's in it |
| --- | --- |
| `css/tokens.css` | Design tokens as CSS variables. Primitives first, then semantic tokens for light and dark. These match the Figma variables one to one. |
| `css/base.css` | Reset, one class per text style, focus ring, and the theme switch |
| `js/theme.js` | Light and dark mode. Starts in your system theme and remembers your choice. |
| `css/components.css` | Buttons, chips, answer options and the recommendation card, built only from tokens |
| `foundations.html` | A live specimen of the tokens |
| `components.html` | Every component and state, live and clickable |
| `demo.html`, `css/concierge.css`, `js/concierge.js` | The concierge itself: a demo store page and the question flow |

## Design decisions

- **Pine** marks actions and facts checked against the catalog.
- **Iris** is reserved for the "AI-assisted" label, so AI content is always marked.
- **Amber** flags budget gaps. Nothing uses alarm red for a catalog outage, because that isn't the buyer's error.
- **Catalog facts** (specs, prices, stock) are set in Geist Mono, so real data never looks like generated text.
- Every text color pair meets WCAG AA in both themes. Controls are at least 44px tall.
- Answer options are real checkboxes, so keyboards and screen readers work without extra code. Selected never relies on color alone.
- Questions come one at a time in a native dialog, so focus stays inside, Escape closes it, and focus returns to the button. Answers are kept if the buyer closes it, and each answer chip jumps back to that question.
- Quantity is the first question, so every price can be shown for the whole order.
- On each recommendation, catalog facts and the AI-written reason are labeled differently, so a buyer can always tell which is which.
