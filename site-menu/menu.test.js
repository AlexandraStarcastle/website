// Checks for the site menu: node site-menu/menu.test.js
const assert = require("assert");
globalThis.window = globalThis;
require("../product-advisor/advisor-config.js");
require("./menu-config.js");
const advisor = require("../product-advisor/advisor.js");
const { handoffUrl, buildSearchIndex, searchLinks } = require("./menu.js");
const config = globalThis.PRONOMIC_MENU_CONFIG;
const advisorConfig = globalThis.PRONOMIC_ADVISOR_CONFIG;

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok   " + name); }
  catch (e) { failed++; console.log("FAIL " + name + ": " + e.message); }
}

check("menu item ids are unique", () => {
  const ids = config.items.map((i) => i.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

check("every link has a label and a destination", () => {
  const all = [];
  for (const i of config.items) {
    for (const g of i.groups || []) all.push(...g.links);
    all.push(...(i.links || []), ...(i.footer || []));
    if (i.examples) all.push(...i.examples.links);
  }
  for (const l of all) {
    assert.ok(l.label, "missing label");
    assert.ok(l.url || l.advisor || l.tailor, "no url: " + l.label);
    if (l.url) assert.doesNotThrow(() => new URL(l.url), "bad url: " + l.url);
  }
});

check("guide questions exist in the Lifting Advisor", () => {
  const guide = config.items.find((i) => i.type === "guide");
  for (const q of guide.questions) assert.ok(advisorConfig.questions.some((a) => a.id === q), q);
  assert.strictEqual(guide.steps.length, guide.questions.length);
  const moves = advisorConfig.questions.find((q) => q.id === "movement").options.map((o) => o.value);
  for (const n of guide.byNeed.links) assert.ok(moves.includes(n.movement), n.movement);
});

check("product icons exist", () => {
  for (const i of config.items) for (const g of i.groups || []) for (const l of g.links)
    if (l.icon) assert.ok(advisor.icons[l.icon] || l.icon === "tool", l.icon);
});

check("handoff URL carries the answers", () => {
  const u = new URL(handoffUrl("https://www.pronomic.com/advisor", { load: "boxes", weight: "w50", needs: ["tilt", "nofix"], movement: [] }));
  assert.strictEqual(u.searchParams.get("load"), "boxes");
  assert.strictEqual(u.searchParams.get("needs"), "tilt,nofix");
  assert.strictEqual(u.searchParams.has("movement"), false);
});

check("advisor reads handed-over answers and ignores unknown values", () => {
  const a = advisor.answersFromUrl(advisorConfig, "?load=boxes&weight=w999&needs=tilt,bogus&foo=1");
  assert.deepStrictEqual(a, { load: "boxes", needs: ["tilt"] });
});

check("menu guide answers give a recommendation", () => {
  const cases = [
    [{ load: "boxes", weight: "w50", movement: "station" }, "vacuum-lifter"],
    [{ load: "rolls", weight: "w125", movement: "around" }, "lifting-trolley"],
    [{ load: "servers", weight: "w125", movement: "around" }, "server-lifter"],
    [{ load: "boxes", weight: "w325", movement: "floors" }, "goods-lift"],
    [{ load: "components", weight: "w1000", movement: "line" }, "overhead-rail"],
  ];
  for (const [answers, id] of cases) {
    const top = advisor.recommend(answers, advisorConfig).results[0];
    assert.strictEqual(top && top.product.id, id, JSON.stringify(answers));
  }
});

check("search finds products by the names people search for", () => {
  const index = buildSearchIndex(config);
  const first = (q) => (searchLinks(index, q)[0] || {}).label;
  assert.strictEqual(first("lift&drive"), "Lift&Drive lifting trolleys");
  assert.strictEqual(first("vacuum"), "Vacuum tube lifters");
  assert.strictEqual(first("mechrail"), "Mechrail overhead rails");
  assert.ok(/ProBldr/.test(first("probldr")));
  assert.ok(searchLinks(index, "brochure").some((l) => /Brochures/.test(l.label)));
  assert.deepStrictEqual(searchLinks(index, "   "), []);
});

if (failed) { console.log(`\n${failed} failed`); process.exit(1); }
console.log("\nAll menu checks passed");
