// Sanity checks for the recommendation logic: node product-advisor/advisor.test.js
const assert = require("assert");
globalThis.window = globalThis;
require("./advisor-config.js");
const { recommend } = require("./advisor.js");
const config = globalThis.PRONOMIC_ADVISOR_CONFIG;

function top(answers) {
  return recommend(answers, config).results.map((r) => r.product.id);
}

const none = ["none"];
const cases = [
  ["cartons lifted again and again at a packing station",
    { load: "boxes", weight: "w50", movement: "station", frequency: "often", needs: none }, "vacuum-lifter"],
  ["sacks palletised all day along a line",
    { load: "sacks", weight: "w50", movement: "line", frequency: "often", needs: none }, "vacuum-lifter"],
  ["rolls carried around the building",
    { load: "rolls", weight: "w125", movement: "around", frequency: "rare", needs: none }, "lifting-trolley"],
  ["boxes moved between shelves, nothing can be mounted",
    { load: "boxes", weight: "w50", movement: "around", frequency: "often", needs: ["nofix"] }, "lifting-trolley"],
  ["servers in a data centre",
    { load: "servers", weight: "w125", movement: "around", frequency: "rare", needs: none }, "server-lifter"],
  ["components at one station, now and then",
    { load: "components", weight: "w125", movement: "station", frequency: "rare", needs: none }, "jib-crane"],
  ["heavy wheels that need tilting",
    { load: "wheels", weight: "w325", movement: "station", frequency: "often", needs: ["tilt"] }, "manipulator"],
  ["heavy components along a production line",
    { load: "components", weight: "w1000", movement: "line", frequency: "often", needs: none }, "overhead-rail"],
  ["load just needs a better working height",
    { load: "components", weight: "w1000", movement: "height", frequency: "rare", needs: none }, "lifting-table"],
  ["goods to a mezzanine",
    { load: "boxes", weight: "w325", movement: "floors", frequency: "often", needs: none }, "goods-lift"],
];

let failed = 0;
for (const [name, answers, expected] of cases) {
  const ids = top(answers);
  if (ids[0] === expected) console.log(`ok   ${name} -> ${ids.join(", ")}`);
  else { failed++; console.log(`FAIL ${name}: expected ${expected}, got ${ids.join(", ")}`); }
}

// Hard constraints
assert.ok(!top({ load: "boxes", weight: "w1000", movement: "around" }).includes("lifting-trolley"), "trolley must not exceed 325 kg");
assert.ok(!top({ load: "components", movement: "line", needs: ["nofix"] }).includes("overhead-rail"), "no rails when nothing can be mounted");
console.log("ok   hard constraints");

// Every link points to pronomic.com
for (const s of config.solutions) {
  for (const u of [s.url, ...(s.products || []).map((p) => p.url), ...Object.values(s.loadTips || {}).map((t) => t.url)]) {
    assert.ok(/^https:\/\/(www|probldr)\.pronomic\.com\//.test(u), `${s.id}: unexpected link ${u}`);
  }
}
console.log("ok   links");

process.exit(failed ? 1 : 0);
