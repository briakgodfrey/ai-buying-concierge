# AI Buying Concierge

A "Help me choose" assistant that asks small business buyers a few plain questions, then recommends three laptops using only facts it can verify against the catalog.

A self-directed concept project. Not built for or affiliated with any company. The product spec and wireframes are written up in the [case study](https://briakgodfrey.github.io/portfolio/work/concierge.html).

## Status

- [x] Product spec and wireframes
- [x] Design tokens: color (light and dark), type, spacing, radius
- [x] Components: buttons, chips, answer options and recommendation cards, with every state
- [x] Question step: five plain questions in an accessible dialog, starting with quantity
- [x] Results: Good, Better and Best picks with team totals, promo limits and stock for the full quantity
- [x] No match: the closest option, the gap per laptop and for the whole order, and tested ways to close it
- [x] Catalog unavailable: no guesses shown, answers saved, Try again or talk to a sales rep
- [x] Sales rep handoff: a short form, a summary of what goes with the request, and a promise based on the reps' real hours

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
| `demo.html`, `css/concierge.css`, `js/concierge.js` | The concierge itself: a demo store page, the question flow and the results |
| `js/catalog.js` | A small invented catalog. The only source of specs, prices and stock |
| `js/recommend.js` | Turns answers into picks. Simple rules stand in for the AI model, so the logic is easy to read |

## Design decisions

- **Cobalt** marks actions and facts checked against the catalog.
- **Orchid** is reserved for the "AI-assisted" label, so AI content is always marked.
- **Amber** flags budget gaps. Nothing uses alarm red for a catalog outage, because that isn't the buyer's error.
- **Catalog facts** (specs, prices, stock) are set in Geist Mono, so real data never looks like generated text.
- Every text color pair meets WCAG AA in both themes, and dark mode goes further than the minimum: text is softened from pure white to avoid glare, secondary text sits at 7.7:1 or higher, and cards are lighter than the dialog behind them so surfaces separate without shadows. Controls are at least 44px tall.
- Answer options are real checkboxes, so keyboards and screen readers work without extra code. Selected never relies on color alone.
- Questions come one at a time in a native dialog, so focus stays inside, Escape closes it, and focus returns to the button. Answers are kept if the buyer closes it, and each answer chip jumps back to that question.
- Quantity is the first question, so every price can be shown for the whole order.
- Every price is shown for the whole order. If a promo only covers some units, the card says how many and shows the math.
- Stock is checked for the full quantity, so "in stock" means every laptop can ship, with dates.
- When nothing fits, the concierge explains why in plain words, then offers only fixes it has checked will work, such as "Raise the budget to $1,200 per laptop" with how many picks that unlocks.
- If the catalog can't be reached, it shows no recommendations at all. It would rather say nothing than guess. The demo page has a switch to simulate this.
- Talking to a person is always one click away. The handoff shows exactly what the rep will see, and after hours it promises the next business morning instead of pretending someone is waiting.
- Best fit goes to the best match within budget, never the most expensive pick. Anything over budget is flagged.
- On each recommendation, catalog facts and the AI-written reason are labeled differently, so a buyer can always tell which is which.
