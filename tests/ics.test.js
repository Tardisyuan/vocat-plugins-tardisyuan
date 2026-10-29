// Run: node tests/ics.test.js  (buildICS lives in the balance page, so pull it out of the HTML)
const assert = require("assert");
const html = require("fs").readFileSync(__dirname + "/../src/balance/ussd.html", "utf8");
const pick = (re) => html.match(re)[0];
const src = [
  pick(/const icsText = [^\n]+/), pick(/const icsDate = [^\n]+/), pick(/function buildICS\(events\) \{[\s\S]*?\n\}/),
].join("\n");
const buildICS = new Function(src + "; return buildICS;")();

const ics = buildICS([{ id: "dji-expiry", date: new Date("2026-11-26T00:00:00"), title: "到期：美国, Ultra; 测试", note: "第一行\n第二行", alarms: [7, 1] }]);
assert(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n"));
assert(ics.includes("DTSTART;VALUE=DATE:20261126\r\nDTEND;VALUE=DATE:20261127"));
assert(ics.includes("SUMMARY:到期：美国\\, Ultra\\; 测试"));
assert(ics.includes("DESCRIPTION:第一行\\n第二行"));
assert.strictEqual(ics.match(/BEGIN:VALARM/g).length, 2);
assert(ics.includes("TRIGGER:-P7D") && ics.includes("TRIGGER:-P1D"));
assert(!/\r(?!\n)|[^\r]\n/.test(ics), "every line ends with CRLF");
assert(buildICS([{ id: "b", date: new Date(), title: "a\\b", note: "", alarms: [] }]).includes("SUMMARY:a\\\\b"));
console.log("ics ok");
