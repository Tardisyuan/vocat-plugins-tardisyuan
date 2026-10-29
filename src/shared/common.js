// Page helpers shared by the VoCat plugins; the API client and storage live in core.js.

// Follow the host's light/dark theme.
(function syncTheme() {
  try {
    const host = window.parent.document.documentElement;
    const apply = () => document.documentElement.classList.toggle("dark", host.classList.contains("dark"));
    apply();
    new MutationObserver(apply).observe(host, { attributes: true, attributeFilter: ["class"] });
  } catch {
    document.documentElement.classList.toggle("dark", matchMedia("(prefers-color-scheme: dark)").matches);
  }
})();

// VoCat gives the plugin frame a fixed height, so a long page gets a second scrollbar inside it.
// The frame is same-origin: grow it to fit the content and let the VoCat page do the scrolling.
(function fitFrame() {
  const frame = window.frameElement;
  if (!frame) return;
  // Measure the body, not <html> (which never reports less than the frame, so it could not shrink),
  // and round up: a fractional height left even 0.5px over shows a scrollbar again.
  const fit = () => { frame.style.height = Math.ceil(document.body.getBoundingClientRect().height) + "px"; };
  // The VoCat page scrolls now; the plugin page itself never shows a scrollbar.
  document.documentElement.style.overflow = "hidden";
  new ResizeObserver(fit).observe(document.body);
  addEventListener("load", fit);
})();

const { api, store } = vocatToolkit; // core.js loads first

async function runningDevices() {
  const res = await api("/devices");
  return (res.devices || []).filter((d) => d.running);
}

// Fill a <select> with running devices; remembers the last choice per page.
async function deviceSelect(select, key, keep = () => true) {
  const devices = (await runningDevices()).filter(keep);
  select.innerHTML = devices.map((d) => `<option value="${esc(d.id)}">${esc(d.name || d.id)}</option>`).join("")
    || `<option value="">无运行中的设备</option>`;
  const saved = store.get(key + ".device", "");
  if (devices.some((d) => d.id === saved)) select.value = saved;
  select.addEventListener("change", () => store.set(key + ".device", select.value));
  return devices;
}

// The plugin iframe has no allow-modals, so confirm() is silently false.
// Ask by relabelling the button instead: the second click within 3 s confirms.
function confirmClick(button, label = "再点一次确认") {
  if (button.dataset.armed) return true;
  const original = button.textContent;
  button.dataset.armed = "1";
  button.textContent = label;
  setTimeout(() => { delete button.dataset.armed; button.textContent = original; }, 3000);
  return false;
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const $ = (sel) => document.querySelector(sel);
const fmtTime = (t) => new Date(t).toLocaleString();

const TYPE = { usb_sim_reader: "读卡器", dji_4g: "大疆 4G", pcie_ec20_ec25: "EC20/EC25", ml307: "ML307", wifi_410: "410 WiFi 棒" };

function ago(t) {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return "刚刚";
  if (s < 3600) return `${Math.floor(s / 60)} 分钟前`;
  if (s < 86400) return `${Math.floor(s / 3600)} 小时前`;
  return `${Math.floor(s / 86400)} 天前`;
}

// Whole days from today to an ISO date (negative once it has passed).
const daysUntil = (iso) => Math.ceil((new Date(iso) - new Date().setHours(0, 0, 0, 0)) / 86400e3);

// VoCat log history, newest last, with fields parsed. The server caps one read at 2000 lines.
async function loadLogs({ lines = 2000, level = "", search = "" } = {}) {
  const q = new URLSearchParams({ lines: String(lines) });
  if (level) q.set("level", level);
  if (search) q.set("search", search);
  const res = await api("/logs/history?" + q);
  return (Array.isArray(res) ? res : res.logs || []).map((e) => {
    let fields = e.fields || {};
    if (typeof fields === "string") { try { fields = JSON.parse(fields); } catch { fields = { raw: fields }; } }
    return { t: new Date(e.time).getTime(), level: e.level, message: e.message || "", fields };
  }).sort((a, b) => a.t - b.t);
}
