// Sanity checks for the recommendation logic: node product-advisor/advisor.test.js
const assert = require("assert");
globalThis.window = globalThis;
require("./advisor-config.js");
const { recommend } = require("./advisor.js");
const config = globalThis.PRONOMIC_ADVISOR_CONFIG;

function top(answers) {
  return recommend(answers, config).results.map((r) => r.product.id);
}

const cases = [
  ["cartons at a packing station, all day",
    { load: "boxes", weight: "w35", surface: "smooth", movement: "station", height: "work", frequency: "constant", orientation: "no", environment: ["none"] },
    "vacuum-tube-lifter"],
  ["servers in a data centre",
    { load: "servers", weight: "w80", surface: "unsure", movement: "mobile", height: "shelf", frequency: "rare", orientation: "no", environment: ["narrow"] },
    "server-lifter"],
  ["rolls moved around the building",
    { load: "rolls", weight: "w80", surface: "unsure", movement: "mobile", height: "work", frequency: "regular", orientation: "no", environment: ["none"] },
    "lifting-trolley"],
  ["rolls that need turning at a station",
    { load: "rolls", weight: "w150", surface: "porous", movement: "station", height: "work", frequency: "regular", orientation: "rotate", environment: ["none"] },
    "manipulator"],
  ["heavy parts across the hall",
    { load: "parts", weight: "w1000", surface: "eyes", movement: "area", height: "high", frequency: "regular", orientation: "no", environment: ["none"] },
    "overhead-crane"],
  ["goods up to a mezzanine",
    { load: "boxes", weight: "w325", surface: "smooth", movement: "floors", height: "high", frequency: "regular", orientation: "no", environment: ["none"] },
    "goods-lift"],
  ["parts with lifting eyes at one station",
    { load: "parts", weight: "w325", surface: "eyes", movement: "station", height: "shelf", frequency: "rare", orientation: "no", environment: ["none"] },
    "jib-crane"],
];

let failed = 0;
for (const [name, answers, expected] of cases) {
  const ids = top(answers);
  try {
    assert.strictEqual(ids[0], expected);
    console.log(`ok   ${name} -> ${ids.join(", ")}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}: expected ${expected}, got ${ids.join(", ")}`);
  }
}

// Hard constraints
assert.ok(!top({ load: "boxes", weight: "w1000plus", movement: "mobile" }).includes("lifting-trolley"), "trolley must not exceed capacity");
assert.ok(!top({ load: "boxes", movement: "station", environment: ["lowceiling"] }).includes("jib-crane"), "no cranes under low ceilings");
console.log("ok   hard constraints");

process.exit(failed ? 1 : 0);
