# Pronomic Lifting Advisor

A short questionnaire for website visitors. It asks 5 simple questions about what they lift and gives plain-language advice on how to solve it: the type of solution, a tip for their load, which Pronomic products to look at, and the next step (ProBldr for lifting trolleys, otherwise "Talk to an expert"). It guides, it does not configure: detailed configuration happens in ProBldr or with sales.

Plain HTML/CSS/JavaScript with no build step and no dependencies, so it can be embedded in any CMS page.

## Files

| File | What it is |
| --- | --- |
| `advisor-config.js` | **Questions, solutions, product links and tips. Edit this file.** |
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

1. What do you need to lift? (boxes, sacks, rolls, panels, drums, components, wheels, servers, other)
2. Roughly how heavy?
3. Where does the load need to go? (one workstation, around the building, along a line, between floors, just a better working height)
4. How often?
5. Anything else? (turning/tilting, nothing can be mounted, hygiene)

## Solutions it can recommend

Mobile lifting trolley (Lift&Drive, with ProBldr link), server lifter, vacuum tube lifter (Easyhand, Vacuhand, Easycrane), jib crane with hoist and gripper (Mechcrane, MobiArm, Mobichain, hoists, grippers), overhead rail system (Mechrail), manipulator (Mechlift Pro), lifting table, goods lift.

## How recommendations are made

Each solution in `advisor-config.js` has:

- `capacityKg`: products that can't take the chosen weight are dropped.
- `exclude`: answers that rule the product out (e.g. cranes when there is a low ceiling).
- `score`: points per answer. The highest total wins, and the top 3 are shown.
- `reasons`: the "why this fits" bullets shown on the result card.

Each solution also has `advice` (the main text), `loadTips` (a tip per load type), `products` (product families with links) and `probldr` (show the ProBldr button).

To add a solution, copy an existing entry and adjust it. Then run the tests and add a scenario for it.

## Before going live

- [ ] Check the values marked `// verify` in `advisor-config.js`. Product links and the figures shown to visitors come from pronomic.com.
- [ ] Decide on `probldr.deepLink`: when `true`, the ProBldr button opens a new configuration for the suggested trolley model instead of the model selector. Test the link while logged out first.
- [ ] Set `contact.url` (contact form) or `contact.email` (opens an email with the answers pre-filled).
- [ ] Add product images (`image` field).
- [ ] Match the colours in `advisor.css` to the brand. The headings use Barlow Condensed (see `index.html` for the font link); set `--pa-font-display` to use the site's own display font instead.
- [ ] Optional: translate the texts in `advisor-config.js` for the local-language sites.

## Analytics

If Google Tag Manager is on the page, these events are pushed to `dataLayer`:
`lifting_advisor_start`, `_complete`, `_results`, `_product_click`, `_probldr_click`, `_contact_click` and `_restart`.
They are also dispatched as DOM events (`advisor:results` etc.) on the container.
