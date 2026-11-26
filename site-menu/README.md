# Pronomic site menu

A new main menu for the whole website. It is built around how visitors actually arrive and convert. It guides people who have a lifting problem, gets people who know the product there in one click, and makes it clear on every page that Pronomic tailors its lifting solutions.

Plain HTML/CSS/JavaScript, no build step and no dependencies, like the Lifting Advisor.

## Files

| File | What it is |
| --- | --- |
| `menu-config.js` | **Structure, texts and links. Edit this file.** |
| `menu.js` | Header, mega menus, in-menu guide, search, mobile drawer, analytics. |
| `menu.css` | Styles. Pronomic Visual Guide colours and Ubuntu (variables at the top). |
| `index.html` | Demo page. Open in a browser and resize to see the mobile menu. |
| `menu.test.js` | Checks: `node site-menu/menu.test.js` |

## Structure

**Top bar (every page):** the promise *"Every lifting solution adapted to your load, by our application experts"*, plus Customer cases · Downloads · About us · Log in · Language.

**Main bar:** Logo · **Find your solution** · Products · **Tailor-made** · Applications · Knowledge · Search · **Talk to an expert**

| Menu | What it does |
| --- | --- |
| Find your solution | A 3-step guide inside the menu: *What do you lift? How heavy? Where does it go?* It shows the best-fitting type of solution right away, then hands over to the Lifting Advisor **with the answers filled in**. Next to it: shortcuts by need (one workstation, around the building, along a line, between floors, working height). |
| Products | *Core range* first (Lift&Drive, vacuum tube lifters, jib cranes, each on a green icon tile with a one-line benefit), then *More lifting solutions* and *Specialized*, where **Custom solutions** sits next to tools and grippers. *View all products →* at the bottom. It uses the product names people search for (Lift&Drive, Easyhand, Vacuhand, Mechrail, Mechlift Pro…). There is a ProBldr card and a link to brochures. |
| Tailor-made | How tailoring works in 3 steps, what we tailor (grippers, tools, cases), and *Describe your lift* → contact form with `?topic=tailor-made`. |
| Applications | By load (with icons) and by industry. |
| Knowledge | Customer cases, choosing a solution, regulations and safety, documents. |
| Search | Matches menu links as you type (product names, applications, documents). Enter searches the whole site. |

On phones and tablets (below 1180 px) the menu opens full screen. The guide comes first, the other menus follow as an accordion, and *Talk to an expert* stays fixed at the bottom.

## Why it looks like this: visitor behaviour

Based on Pronomic's GA4, Search Console and Salesforce extracts (Oct 2025 – Oct 2026):

| What visitors do | What the menu does about it |
| --- | --- |
| Most search traffic is **brand searches** (65–96% of clicks). People arrive knowing Pronomic and often the product. | Products uses the product names, one click to the product page, and search matches those names. |
| **Product pages convert at 14–35%**, editorial pages at 0–3%. | Every route in the menu ends on a product page, ProBldr or an expert, never a dead end. |
| **Document downloads are the biggest key event** (5,660). | *Downloads* in the top bar, *Brochures and data sheets* in Products and Knowledge. |
| **/login.php gets 2,427 landings and 0 key events.** Customers are looking for a login. | A clear *Log in* in the top bar (ProBldr and customer login), so customers don't get mixed up with prospects. |
| AI assistants (chatgpt.com: 926 sessions) and generic searches bring people **with a problem, not a product name**. | *Find your solution* asks about the load, not about products. |
| ProBldr leads have a **~46% win rate**. Website contact wins 37%. | A ProBldr card in Products. *Talk to an expert* is the only green button in the header. |
| Competitors don't offer decision tools or show tailoring. | Tailor-made is its own menu item, and the promise is visible on every page. |

Note: Sealmetrics was not connected when this was built. Validate with live data after launch (see Analytics).

## Embed on the website

```html
<link rel="stylesheet" href="/path/to/menu.css">
<div id="pronomic-menu"></div>
<script src="/path/to/advisor-config.js"></script>  <!-- powers the guide -->
<script src="/path/to/advisor.js"></script>
<script src="/path/to/menu-config.js"></script>
<script src="/path/to/menu.js"></script>
<script>PronomicMenu.mount("#pronomic-menu");</script>
```

Without the advisor scripts the menu still works: *Find your solution* then links straight to the Lifting Advisor.

## Analytics

Events are pushed to `dataLayer` (GTM/GA4) and dispatched as DOM events (`menu:click` etc.):

| Event | When | Detail |
| --- | --- | --- |
| `site_menu_open` | A menu, popover or the mobile menu opens | `menu_section` |
| `site_menu_click` | Any link in the menu | `menu_section`, `link_text`, `link_url` |
| `site_menu_guide_answer` | An answer in the in-menu guide | `question`, `answer`, `step` |
| `site_menu_guide_result` | The guide shows a solution | `answers`, `solution` |
| `site_menu_guide_handoff` | *Refine with N more questions* | `answers`, `solution` |
| `site_menu_search` | Search submitted | `search_term` |
| `site_menu_probldr_click` | ProBldr card | `from` |

Worth following after launch: clicks per menu section, guide start → result → handoff, top search terms (for menu labels that are missing), and whether /login.php landings now lead somewhere.

## Before going live

- [ ] Check every link marked `// verify` in `menu-config.js` (contact, search, downloads, industries, languages, about).
- [ ] Set `advisorUrl` to the Lifting Advisor's URL on the website.
- [ ] Have technical sales/service check the Tailor-made steps (especially "Delivered and installed … training and service").
- [ ] Translate `menu-config.js` per language site (keep the structure, rewrite the promise per market).
- [ ] Load the Ubuntu font on the page if the site doesn't already.
