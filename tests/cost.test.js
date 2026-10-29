// Run: node tests/cost.test.js  (parseCost lives in the balance page, so pull it out of the HTML)
const assert = require("assert");
const html = require("fs").readFileSync(__dirname + "/../src/balance/ussd.html", "utf8");
const src = html.match(/function parseCost\(text\) \{[\s\S]*?\n\}/)[0];
const parseCost = new Function(src + "; return parseCost;")();

assert.deepStrictEqual(parseCost("£10"), { amount: 10, currency: "£" });
assert.deepStrictEqual(parseCost("30 AUD"), { amount: 30, currency: "AUD" });
assert.deepStrictEqual(parseCost("usd 15.5"), { amount: 15.5, currency: "USD" });
assert.deepStrictEqual(parseCost("每月 25 元"), { amount: 25, currency: "元" });
assert.deepStrictEqual(parseCost("8"), { amount: 8, currency: "" });
assert.strictEqual(parseCost(""), null);
console.log("cost ok");
