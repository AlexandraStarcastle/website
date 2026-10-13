# Pronomic Lifting Advisor

A short questionnaire for website visitors. It asks 8 questions about their lift and recommends the best-fitting lifting solutions, with a "Talk to an expert" button that passes their answers to sales.

Plain HTML/CSS/JavaScript with no build step and no dependencies, so it can be embedded in any CMS page.

## Files

| File | What it is |
| --- | --- |
| `advisor-config.js` | **Questions and product catalogue. Edit this file.** |
| `advisor.js` | Recommendation engine and UI. |
| `advisor.css` | Styles. Brand colours and fonts are CSS variables at the top. |
| `index.html` | Stand-alone demo page. Open it in a browser. |
| `advisor.test.js` | Scenario tests: `node product-advisor/advisor.test.js` |

## Embed on the website

```html
<link rel="stylesheet" href="/path/to/advisor.css">
<div id="pronomic-advisor"></div>
<script src="/path/to/advisor-config.js"></script>
<script src="/path/to/advisor.js"></script>
<script>PronomicAdvisor.mount("#pronomic-advisor");</script>
```

## Questions asked

1. Type of load (boxes, rolls, panels, servers, drums, parts, other)
2. Heaviest weight
3. Load surface (vacuum-friendly, irregular, lifting eyes)
4. Where the load goes (workstation, larger area, around the building, between floors)
5. Lifting height
6. How often
7. Does it need turning or tilting
8. Environment (hygiene, ATEX, low ceiling, narrow aisles)

## How recommendations are made

Each product in `advisor-config.js` has:

- `capacityKg`: products that can't take the chosen weight are dropped.
- `exclude`: answers that rule the product out (e.g. cranes when there is a low ceiling).
- `score`: points per answer. The highest total wins, and the top 3 are shown.
- `reasons`: the "why this fits" bullets shown on the result card.

To add a product, copy an existing entry and adjust it. Then run the tests and add a scenario for the new product.

## Before going live

- [ ] Check the URLs and capacities marked `// verify` in `advisor-config.js` against the live product pages.
- [ ] Set `contact.url` (contact form) or `contact.email` (opens an email with the answers pre-filled).
- [ ] Add product images (`image` field).
- [ ] Match the colours in `advisor.css` to the brand. The headings use Barlow Condensed (see `index.html` for the font link); set `--pa-font-display` to use the site's own display font instead.
- [ ] Optional: translate the texts in `advisor-config.js` for the local-language sites.

## Analytics

If Google Tag Manager is on the page, these events are pushed to `dataLayer`:
`lifting_advisor_start`, `_complete`, `_results`, `_product_click`, `_contact_click` and `_restart`.
They are also dispatched as DOM events (`advisor:results` etc.) on the container.
