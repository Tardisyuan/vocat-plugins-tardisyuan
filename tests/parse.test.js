// Run: node tests/parse.test.js
const assert = require("assert");
global.window = {};
require("../src/shared/core.js");
const { parseReply } = window.vocatToolkit;

const optus = `MY BALANCE SUMMARY

Mobile Number: 0400000000
Expires: 24-11-2026
Which is in 27 days

PLAN BALANCES
Data: 35GB
Talk: UNLIMITED
Selected International Mins: UNLIMITED
Text: UNLIMITED

Menu Options:
4: Optus Prepaid Recharge`;
assert.deepStrictEqual(parseReply(optus), { money: null, moneyText: null, data: "35GB", talk: "无限", sms: "无限", expiry: "2026-11-24" });

const ultra = "本月剩余通话时间：100 分钟 本月剩余短信数：100 条 本月剩余流量：100.0MB 计划到期日：11/26/2026 PayGo钱包余额：$0";
assert.deepStrictEqual(parseReply(ultra, { monthFirst: true }), { money: 0, moneyText: "$0", data: "100.0MB", talk: "100 分钟", sms: "100 条", expiry: "2026-11-26" });

const gg = parseReply("Your balance is £12.34. Valid until 30/11/2026.");
assert.strictEqual(gg.moneyText, "£12.34");
assert.strictEqual(gg.expiry, "2026-11-30");
assert.strictEqual(parseReply("余额 35.20 元，有效期至 2026-12-01").money, 35.2);
assert.strictEqual(parseReply("Renews 03/04/2026", { monthFirst: true }).expiry, "2026-03-04");
assert.strictEqual(parseReply("Renews 03/04/2026").expiry, "2026-04-03");
console.log("parse ok");

const gg2 = parseReply("Hi there. You have 9.31 GBP credit left for extras that fall outside your plan.");
assert.strictEqual(gg2.money, 9.31);
assert.strictEqual(gg2.moneyText, "9.31 GBP");
assert.strictEqual(parseReply("AUD 12.50 remaining").moneyText, "12.50 AUD");
console.log("currency code ok");
