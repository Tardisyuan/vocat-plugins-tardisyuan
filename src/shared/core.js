// Shared core for the VoCat plugins: API client, storage and the balance query runner.
// Plugin pages load it in their iframe. The balance page also loads it into the VoCat
// page itself, so a query keeps running and saves its result after you leave the plugin.
(function () {
  if (window.vocatToolkit) return;

  const camel = (v) =>
    Array.isArray(v) ? v.map(camel)
    : v && typeof v === "object"
      ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase()), camel(x)]))
      : v;

  // Mutations need VoCat's CSRF token; the session cookie is sent automatically (same origin).
  let csrf = "";
  async function refreshCSRF() {
    const res = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
    csrf = (await res.json())?.data?.csrf_token || "";
  }

  async function api(path, { method = "GET", body } = {}, retry = true) {
    const mutation = method !== "GET";
    if (mutation && !csrf) await refreshCSRF();
    const headers = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (mutation) headers["X-CSRF-Token"] = csrf;
    const res = await fetch("/api" + path, {
      method, headers, credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const payload = camel(await res.json().catch(() => ({})));
    if (!res.ok) {
      const err = payload.error && typeof payload.error === "object" ? payload.error : payload;
      if (retry && mutation && res.status === 403 && err.code === "invalid_csrf") {
        csrf = "";
        return api(path, { method, body }, false);
      }
      throw Object.assign(new Error(err.message || err.error || `HTTP ${res.status}`), { code: err.code || "" });
    }
    return "data" in payload ? payload.data : payload;
  }

  // ponytail: localStorage on the VoCat origin, per browser; move to a plugin backend if data must sync across devices.
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem("vocat-toolkit." + key); return v === null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem("vocat-toolkit." + key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
    },
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // "24-11-2026", "11/26/2026", "2026-11-26" -> "2026-11-26". Ambiguous day/month follows monthFirst (US style).
  function parseDate(s, monthFirst) {
    const pad = (n) => String(n).padStart(2, "0");
    let m = s.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    let y, mo, d;
    if (m) [y, mo, d] = [+m[1], +m[2], +m[3]];
    else {
      m = s.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
      if (!m) return "";
      const [a, b] = [+m[1], +m[2]];
      y = +m[3] < 100 ? 2000 + +m[3] : +m[3];
      [mo, d] = a > 12 ? [b, a] : b > 12 ? [a, b] : monthFirst ? [a, b] : [b, a];
    }
    return mo >= 1 && mo <= 12 && d >= 1 && d <= 31 ? `${y}-${pad(mo)}-${pad(d)}` : "";
  }

  // Pull the figures carriers put in balance replies (USSD menus or SMS), in Chinese or English.
  function parseReply(text, { monthFirst = false } = {}) {
    const t = String(text || "");
    const qty = (re) => {
      const m = t.match(re);
      return m ? (/unlimited|无限/i.test(m[1]) ? "无限" : m[1].replace(/\s+/g, " ").trim()) : null;
    };
    const cur = t.match(/([$£€¥])\s?(\d+(?:[.,]\d{1,2})?)/);
    // "9.31 GBP" or "AUD 12.50": a 3-letter currency code instead of a symbol.
    const code = cur ? null : t.match(/(\d+(?:[.,]\d{1,2})?)\s?(GBP|USD|AUD|NZD|CAD|EUR|SGD|HKD|THB|PHP|IDR|MYR)\b|\b(GBP|USD|AUD|NZD|CAD|EUR|SGD|HKD|THB|PHP|IDR|MYR)\s?(\d+(?:[.,]\d{1,2})?)/);
    const kw = cur || code ? null : t.match(/(?:余额|话费|balance|credit)[^\d\n]{0,20}?(\d+[.,]\d{1,2})(?!\d)/i);
    const moneyNum = cur ? cur[2] : code ? code[1] || code[4] : kw?.[1];
    const moneyText = !moneyNum ? null : cur ? cur[1] + moneyNum : code ? `${moneyNum} ${code[2] || code[3]}` : moneyNum;
    const exp = t.match(/(?:expires?|expiry|valid until|renews?|到期日?|有效期至?)[^\d\n]{0,20}?(\d{1,4}[-/.]\d{1,2}[-/.]\d{2,4})/i);
    return {
      money: moneyNum ? Number(moneyNum.replace(",", ".")) : null,
      moneyText,
      data: qty(/(?:data|流量)[^\d\n]{0,12}?(unlimited|无限|\d+(?:\.\d+)?\s?(?:TB|GB|MB|KB))/i) ?? qty(/(\d+(?:\.\d+)?\s?(?:TB|GB|MB))\b/i),
      talk: qty(/(?:talk|voice|通话)[^\d\n]{0,12}?(unlimited|无限|\d+\s?(?:分钟|minutes|mins?)?)/i),
      sms: qty(/(?:text|sms|短信)[^\d\n]{0,12}?(unlimited|无限|\d+\s?(?:条|texts?)?)/i),
      expiry: exp ? parseDate(exp[1], monthFirst) : "",
    };
  }

  // VoCat's USSD errors are English and technical; say what to do instead.
  function friendly(e, viaWiFiCalling) {
    const m = e.message || "";
    if (e.code === "wifi_calling_only_device") return "这是 USB 读卡器，不能发 USSD，只能用短信查询。";
    if (e.code === "modem_error" && viaWiFiCalling) return "这次走的是 WiFi Calling（USSI），运营商拒绝了或没回应。VoCat 不把具体原因返回给页面，去日志页搜 USSI，能看到类似「USSI rejected with SIP 487」或「timed out」的原文。";
    if (e.code === "modem_error") return "猫返回了错误。常见原因：没注册上蜂窝网络（比如在国外没开漫游），或者运营商在当前网络下不支持 USSD。具体原因看 VoCat 的日志页面。";
    if (e.code === "modem_timeout" || /timeout|deadline/i.test(m)) return "运营商没有回应（超时）。可能不支持在当前网络下查询。";
    if (/IMS registration|USSINotReady|not ready/i.test(m)) return "WiFi Calling 还没注册上，稍后再试。";
    if (/does not support USSI/i.test(m)) return "当前 VoWiFi 不支持 USSD。";
    return m;
  }

  const COUNTRY = {
    302: "加拿大", 310: "美国", 311: "美国", 312: "美国", 313: "美国", 314: "美国", 315: "美国", 316: "美国",
    234: "英国", 235: "英国", 505: "澳大利亚", 530: "新西兰", 460: "中国大陆", 454: "中国香港", 455: "中国澳门",
    466: "中国台湾", 440: "日本", 441: "日本", 450: "韩国", 525: "新加坡",
  };

  // What the SIM says about itself: home PLMN, carrier name and country.
  function simInfo(d) {
    const m = d?.modem || {}, v = d?.vowifiRuntime || {};
    const imsi = m.imsi || v.imsi || "";
    const profile = v.carrierProfile || ""; // e.g. ipcc-giffgaff-23410
    // North American IMSIs use a 3-digit MNC (310260); most others use 2 (23410, 50501).
    const imsiPlmn = imsi.slice(0, /^3[01]\d/.test(imsi) ? 6 : 5);
    const plmns = [m.homeCarrierPlmn, (m.cardMcc || "") + (m.cardMnc || ""), profile.match(/\d{5,6}/)?.[0], imsiPlmn]
      .filter((x) => /^\d{5,6}$/.test(x || ""));
    const fromProfile = profile.replace(/^ipcc-|-\d+$/g, "");
    const carrier = m.homeCarrierName || m.nativeSpn || fromProfile.charAt(0).toUpperCase() + fromProfile.slice(1);
    const names = [m.homeCarrierName, m.nativeSpn, profile].filter(Boolean);
    const country = COUNTRY[plmns[0]?.slice(0, 3)] || m.cardCountry || m.homeCarrierCountryCode || "";
    return { plmns, names, carrier, country };
  }

  // A query is USSD ({code}) or SMS ({to, text}).
  const qKey = (q) => q.to ? `sms:${q.to}:${q.text}` : q.code;
  const qLabel = (q) => q.to ? `短信 ${q.text} → ${q.to}` : q.code;
  const historyKey = (deviceId, q) => `ussd.history.${deviceId}.${qKey(q)}`;
  const sessionKey = (deviceId, q) => `ussd.session.${deviceId}.${qKey(q)}`;
  const jobKey = (deviceId, q) => `${deviceId}|${qKey(q)}`;

  function record(deviceId, q, entry) {
    const h = store.get(historyKey(deviceId, q), []);
    h.push({ t: Date.now(), ...entry });
    store.set(historyKey(deviceId, q), h.slice(-200));
  }

  // Send the SMS, then poll for the carrier's first reply after it. Some carriers answer from a
  // different sender than the number you texted (giffgaff: text 85075, reply from "giffgaff").
  async function smsQuery(deviceId, q) {
    const sentAt = Date.now() - 5000; // tolerate small clock skew between browser and VoCat
    await api("/sms/send", { method: "POST", body: { device_id: deviceId, phone: q.to, message: q.text } });
    const inbound = (m, at) => ["inbound", "received"].includes(m.direction) && new Date(at).getTime() >= sentAt;
    for (let waited = 0; waited < 120000; waited += 5000) {
      await sleep(5000);
      const thread = await api(`/sms/thread?peer=${encodeURIComponent(q.to)}&limit=5&device_id=${encodeURIComponent(deviceId)}`) || [];
      const reply = thread.find((m) => inbound(m, m.timestamp));
      if (reply) return reply.content || reply.body || "";
      if (q.replyFrom) {
        // The sender name's exact spelling is up to VoCat, so match it loosely in the contact list.
        const want = q.replyFrom.toLowerCase();
        const contacts = await api(`/sms/contacts?limit=200&device_id=${encodeURIComponent(deviceId)}`) || [];
        const c = contacts.find((x) => String(x.peer || x.displayName || "").toLowerCase().includes(want) && inbound(x, x.lastTimestamp));
        if (c) return c.lastContent || c.lastMessage || "";
      }
    }
    throw new Error("2 分钟内没收到运营商回复短信，稍后到短信页面看看");
  }

  async function ussdQuery(deviceId, q, input) {
    const id = encodeURIComponent(deviceId);
    const sid = store.get(sessionKey(deviceId, q), "");
    const res = input !== undefined && sid
      ? await api(`/devices/${id}/actions/ussd/continue`, { method: "POST", body: { session_id: sid, input, timeout_ms: 45000 } })
      : await api(`/devices/${id}/actions/ussd`, { method: "POST", body: { command: q.code, timeout_ms: 45000 } });
    const r = res.result || {};
    // A session id means the network opened a menu and waits for a reply.
    store.set(sessionKey(deviceId, q), res.sessionId || r.sessionId || "");
    return r.text || r.raw || r.rawText || JSON.stringify(r);
  }

  // Start time of each query in flight, keyed by jobKey. Lives as long as the page that loaded this file.
  const jobs = {};

  async function runQuery(deviceId, q, { input, viaWiFiCalling, monthFirst } = {}) {
    const key = jobKey(deviceId, q);
    if (jobs[key]) return;
    jobs[key] = Date.now();
    try {
      const text = q.to ? await smsQuery(deviceId, q) : await ussdQuery(deviceId, q, input);
      const parsed = parseReply(text, { monthFirst });
      record(deviceId, q, { text, ...parsed, amount: parsed.money });
      // Write the carrier's expiry date back to the card, so the countdown stays current.
      if (parsed.expiry) store.set(`ussd.expiry.${deviceId}`, parsed.expiry);
    } catch (e) {
      if (!q.to) store.set(sessionKey(deviceId, q), "");
      record(deviceId, q, { text: friendly(e, viaWiFiCalling), amount: null, error: true });
    } finally {
      delete jobs[key];
    }
  }

  function cancelSession(deviceId, q) {
    const sid = store.get(sessionKey(deviceId, q), "");
    store.set(sessionKey(deviceId, q), "");
    if (sid) api(`/devices/${encodeURIComponent(deviceId)}/actions/ussd/cancel`, { method: "POST", body: { session_id: sid } }).catch(() => {});
  }

  window.vocatToolkit = {
    version: 6, api, store, parseReply, simInfo, record, qKey, qLabel, historyKey, sessionKey, jobKey, jobs, runQuery, cancelSession,
  };
})();
