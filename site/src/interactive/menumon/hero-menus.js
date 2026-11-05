// Mock menus for the hero bar. Click an app's icon and an HTML stand-in for
// its real menu drops down, modelled on the app's own menu with made-up data.
// The controls work, and the icon answers through `menumonHero.setState`
// (hero.js), using the same state keys the sprites were drawn for. Every
// menu ends the way every Menumon app's does: Settings ▸, then Quit.
// Nothing here talks to anything: all state lives in this file and a reload
// forgets it.
(() => {
  const hero = window.menumonHero;
  const fig = document.querySelector(".display");
  const wrap = fig && fig.querySelector(".bar-wrap");
  const bezel = fig && fig.querySelector(".bezel");
  if (!hero || !wrap || !bezel) return;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = matchMedia("(max-width: 719px)");
  const set = (id, key) => hero.setState(id, key);
  const T = "︎"; // text presentation, so ▶ and ⏯ don't turn into emoji

  // ---------------------------------------------------------------- helpers

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "style") Object.assign(el.style, v);
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      // Properties (value, min, type…) before attributes: an input's value has
      // to be set as a property, after its min and max.
      else if (k in el && k !== "role") el[k] = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid);
    return el;
  }
  const svg = (markup, cls = "hm-ico") => {
    const s = h("span", { class: cls, "aria-hidden": "true" });
    s.innerHTML = markup;
    return s;
  };
  const rays = (r1, r2) => [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
    const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180);
    const p = (r) => `${(8 + c * r).toFixed(2)}`;
    const q = (r) => `${(8 + s * r).toFixed(2)}`;
    return `<line x1="${p(r1)}" y1="${q(r1)}" x2="${p(r2)}" y2="${q(r2)}"/>`;
  }).join("");
  const stroke = (inner, w = 1.2) => `<svg viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
  const blade = (deg) => `<path transform="rotate(${deg} 8 8)" d="M8 6.6C6.7 4.6 7.1 2 8.9 2.1c1.7.2 1.6 2.9-.9 4.5z"/>`;
  const ICON = {
    sunLo: stroke(`<circle cx="8" cy="8" r="2"/>${rays(4.4, 5)}`),
    sunHi: stroke(`<circle cx="8" cy="8" r="2.8"/>${rays(4.6, 6.8)}`),
    contrast: `<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8 2.4a5.6 5.6 0 0 1 0 11.2z" fill="currentColor"/></svg>`,
    resize: stroke(`<rect x="1.8" y="3.3" width="12.4" height="9.4" rx="1.6"/><path d="M4.8 7.2V5.6h1.8M11.2 8.8v1.6H9.4"/>`),
    thermo: `<svg viewBox="0 0 16 16"><path d="M6.6 9.6V3.2a1.4 1.4 0 0 1 2.8 0v6.4a2.9 2.9 0 1 1-2.8 0z" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="11.9" r="1.4" fill="currentColor"/></svg>`,
    spkLo: `<svg viewBox="0 0 16 16"><path d="M2.5 6.2h2.4L8.3 3.4v9.2L4.9 9.8H2.5z" fill="currentColor"/></svg>`,
    spkHi: `<svg viewBox="0 0 16 16"><path d="M1.5 6.2h2.4L7.3 3.4v9.2L3.9 9.8H1.5z" fill="currentColor"/><path d="M9.6 5.6a3.4 3.4 0 0 1 0 4.8M11.6 3.8a6 6 0 0 1 0 8.4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    fanLo: `<svg viewBox="0 0 16 16"><g fill="currentColor" transform="translate(2.4 2.4) scale(.7)">${blade(0)}${blade(120)}${blade(240)}<circle cx="8" cy="8" r="1.3"/></g></svg>`,
    fanHi: `<svg viewBox="0 0 16 16"><g fill="currentColor">${blade(0)}${blade(120)}${blade(240)}<circle cx="8" cy="8" r="1.4"/></g></svg>`,
    chevDown: stroke(`<path d="M4 6.2l4 4 4-4"/>`, 1.5),
    chevRight: stroke(`<path d="M6.2 4l4 4-4 4"/>`, 1.5),
    power: stroke(`<path d="M8 2.4v5"/><path d="M4.9 4.4a5 5 0 1 0 6.2 0"/>`, 1.5),
    home: stroke(`<path d="M2.4 8L8 3l5.6 5M4 6.8V13h3v-3h2v3h3V6.8"/>`, 1.3),
    gear: stroke(`<circle cx="8" cy="8" r="2.2"/>${rays(4.2, 6.4)}<circle cx="8" cy="8" r="4.4"/>`),
    refresh: stroke(`<path d="M12.6 8a4.6 4.6 0 1 1-1.4-3.3M12.6 2.6v3h-3"/>`, 1.3),
  };
  const dot = (color) => h("span", { class: "hm-dot", style: { background: color } });
  const GREEN = "#32d74b", ORANGE = "#ff9f0a", RED = "#ff453a", GREY = "#8e8e93", CYAN = "#64d2ff";

  // --------------------------------------------------------------- row kinds

  const sep = () => h("div", { class: "hm-sep", role: "separator" });
  const head = (text, cls) => h("div", { class: "hm-head" + (cls ? ` ${cls}` : ""), role: "presentation" }, text);
  // A grey, inert row (macOS draws informational items as disabled).
  const info = (text, o = {}) => h("div", { class: `hm-row hm-dis ${o.cls || ""}` },
    o.dot && dot(o.dot), h("span", { class: "hm-label" }, text), o.right);
  // A full-contrast row that isn't a menu item: a label and its controls.
  const line = (label, ...right) => h("div", { class: "hm-row", role: "none" }, h("span", { class: "hm-label" }, label), right);
  // A heading that folds what follows it: chevron down while folded, up while
  // open (Panes's sections, Homestead's later views).
  const fold = (key, label, detail, open, toggle) => h("button", {
    type: "button", class: "hm-row hm-act hm-disc", "data-k": key,
    "aria-expanded": String(open), onclick: () => { toggle(); render(); },
  }, h("span", { class: "hm-label" }, label), detail && h("span", { class: "hm-detail" }, detail), svg(ICON.chevDown));

  // A clickable menu item. `check` (true/false) makes it a checkbox, plus
  // `radio` a radio; `close` closes the menu as most macOS items do. Anything
  // else stays open so the reader can keep playing, and the menu re-renders.
  function item(o) {
    const role = o.check == null ? "button" : o.radio ? "radio" : "checkbox";
    const el = h("button", {
      type: "button",
      class: `hm-row ${o.disabled ? "hm-dis" : "hm-act"} ${o.cls || ""}`,
      role,
      "data-k": o.key || (typeof o.label === "string" ? o.label : null),
      "aria-checked": o.check == null ? null : String(!!o.check),
      "aria-disabled": o.disabled ? "true" : null,
    },
    o.icon && svg(o.icon),
    o.dot && dot(o.dot),
    h("span", { class: "hm-label" }, o.label),
    o.detail && h("span", { class: "hm-detail" }, o.detail),
    o.shortcut && h("span", { class: "hm-key" }, o.shortcut),
    o.sub && h("span", { class: "hm-arrow", "aria-hidden": "true" }, "›"));
    if (!o.sub) {
      el.addEventListener("click", () => {
        if (o.disabled) return;
        if (o.onClick) o.onClick();
        if (o.close || !o.onClick) closeMenu(true);
        else render();
      });
    }
    return el;
  }
  const radios = (options, current, pick, prefix) => options.map((opt) => item({
    label: opt, key: `${prefix}-${opt}`, check: current === opt, radio: true, onClick: () => pick(opt),
  }));

  // A submenu item; `build` makes the flyout's rows each time it opens. Hover
  // opens it with a mouse (as macOS does); a tap, Enter or → opens it too.
  function sub(o, build) {
    const btn = item({ ...o, sub: true });
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-expanded", "false");
    const w = h("div", { class: "hm-subwrap", role: "none" }, btn);
    w._build = build;
    w._label = typeof o.label === "string" ? o.label : "";
    let pointer = "mouse";
    btn.addEventListener("pointerdown", (e) => { pointer = e.pointerType; });
    btn.addEventListener("click", (e) => {
      if (w._fly && pointer !== "mouse" && e.detail) closeSub(w);
      else openSub(w, e.detail === 0);
      pointer = "mouse";
    });
    w.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(w._t);
      openSub(w, false);
    });
    w.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "mouse") w._t = setTimeout(() => closeSub(w), 250);
    });
    return w;
  }

  function openSub(w, focus) {
    const parent = w.parentElement.closest(".hm-menu");
    if (parent._sub && parent._sub !== w) closeSub(parent._sub);
    if (!w._fly) {
      const fly = h("div", { class: "hm-menu hm-fly", role: "dialog", "aria-label": w._label, tabindex: "-1" }, w._build());
      w.append(fly);
      w._fly = fly;
      parent._sub = w;
      w.firstChild.setAttribute("aria-expanded", "true");
      w.firstChild.classList.add("is-sub-open");
      // Right of the row when there's room, else left, else (phones) below
      // it. A flyout of a left-hand flyout keeps going left, as macOS does.
      const vw = document.documentElement.clientWidth;
      const r = w.getBoundingClientRect();
      const fitsLeft = r.left - fly.offsetWidth >= 6, fitsRight = r.right + fly.offsetWidth <= vw - 6;
      if (fitsLeft && (!fitsRight || parent.classList.contains("hm-left"))) fly.classList.add("hm-left");
      else if (!fitsRight) fly.classList.add("hm-below");
    }
    if (focus) focusFirst(w._fly);
  }
  function closeSub(w) {
    if (!w || !w._fly || !w.isConnected) return;
    if (w._fly._sub) closeSub(w._fly._sub);
    clearTimeout(w._t);
    const hadFocus = w._fly.contains(document.activeElement);
    w._fly.remove();
    w._fly = null;
    const parent = w.parentElement.closest(".hm-menu");
    if (parent._sub === w) parent._sub = null;
    w.firstChild.setAttribute("aria-expanded", "false");
    w.firstChild.classList.remove("is-sub-open");
    if (hadFocus) w.firstChild.focus({ preventScroll: true });
  }

  // A small macOS switch. Changing it re-renders, since a switch often shows
  // or hides the rows under it.
  function toggle(on, label, change, key) {
    return h("button", {
      type: "button", class: "hm-switch", role: "switch", "aria-checked": String(!!on), "aria-label": label,
      "data-k": key || `sw-${label}`, onclick: () => { change(!on); render(); },
    });
  }

  // A slider row. Dragging must not re-render (it would drop the drag), so
  // `onInput` updates its own labels and the icon directly.
  function slider(o) {
    const input = h("input", {
      type: "range", class: "hm-range", "aria-label": o.label, "data-k": o.key || o.label,
      min: o.min ?? 0, max: o.max ?? 100, step: o.step ?? 1, value: o.value,
    });
    input.addEventListener("input", () => o.onInput(+input.value));
    return h("div", { class: `hm-row hm-slide ${o.cls || ""}`, role: "none" },
      o.name && h("span", { class: "hm-name" }, o.name),
      o.left && svg(o.left), input, o.right && svg(o.right), o.out);
  }

  const btn = (label, aria, onclick, key) => {
    const b = h("button", { type: "button", class: "hm-btn", "aria-label": aria, "data-k": key || aria, onclick });
    if (label.startsWith("<svg")) b.innerHTML = label; else b.textContent = label;
    return b;
  };
  // A button that lights up briefly, for presses with nothing else to show.
  const flash = (b) => { b.classList.add("is-hit"); setTimeout(() => b.classList.remove("is-hit"), 180); };

  // The foot of every menu (StatusItemKit's SettingsMenu): Settings ▸ holding
  // the app's own settings, a separator, Start at Login, a separator and the
  // grey version; then, with `icons`, the shared Icon ▸ picker right below
  // Settings; then Quit <App>. `st` holds `login` (and `icon`, the current one
  // of `icons`); `own()` builds the app's rows each time the flyout opens.
  function footer(name, st, o) {
    return [
      sep(),
      sub({ label: "Settings", key: "settings", cls: o.cls }, () => {
        const own = o.own ? o.own().flat(Infinity).filter(Boolean) : [];
        return [
          own, own.length ? sep() : null,
          item({ label: "Start at Login", check: st.login, onClick: () => { st.login = !st.login; } }),
          sep(),
          info(`Version ${o.version}`),
        ];
      }),
      o.icons && sub({ label: "Icon", key: "icon", cls: o.cls }, () => radios(o.icons, st.icon, (v) => { st.icon = v; }, "icon")),
      item({ label: `Quit ${name}`, cls: o.cls, shortcut: "⌘Q", close: true }),
    ];
  }

  // ------------------------------------------------------------------ menus
  // Each menu: its app name, width, `build()` returning its rows from the
  // state below, and an optional once-a-second `tick()`.
  const MENUS = {};

  // KeyLight: the backlight in eighths of the slider. Since 1.16.0 there is no
  // Settings submenu: the icon, function keys, Start at Login and the version
  // are in the Preferences window (1.18.0 moved the icon there too).
  const kl = { level: 62, timeout: "10 minutes" };
  const KL_TIMEOUTS = ["1 second", "2 seconds", "3 seconds", "4 seconds", "5 seconds",
    "1 minute", "2 minutes", "5 minutes", "10 minutes", "Never"];
  MENUS.keylight = {
    name: "KeyLight", width: 260,
    build() {
      const pct = h("span", { class: "hm-val" }, `${kl.level}%`);
      return [
        h("div", { class: "hm-row hm-title hm-flush", role: "none" }, h("span", { class: "hm-label" }, "Backlight"), pct),
        slider({
          label: "Backlight", value: kl.level, left: ICON.sunLo, right: ICON.sunHi, cls: "hm-flush",
          onInput(v) { kl.level = v; pct.textContent = `${v}%`; set("keylight", String(Math.round(v / 12.5))); },
        }),
        sep(),
        sub({ label: "Backlight Timeout", key: "timeout" }, () => radios(KL_TIMEOUTS, kl.timeout, (v) => { kl.timeout = v; }, "timeout")),
        item({ label: "Preferences…", key: "preferences", shortcut: "⌘,", close: true }),
        item({ label: "Quit KeyLight", shortcut: "⌘Q", close: true }),
      ];
    },
  };

  // VPN & DNS: Mullvad, Tailscale and accept-dns, each one row that toggles
  // what it describes. Like the real DNS watcher, connecting Mullvad turns
  // accept-dns off and disconnecting turns it back on.
  const vpn = {
    t: 1, m: 0, d: 1, phase: "off", city: "Ashburn, VA", split: false, icon: "Iguana", login: true, rank: "Rank by Latency", seq: 0,
    lists: { US: true, "Non-US": true, Canada: false, "Latin America": false, Europe: true, Asia: false },
  };
  // Each Fastest list: its menu title and [city, latency ms, throughput Mbps].
  // Settings ▸ Fastest Lists picks which lists show and how they're ranked.
  const CITIES = {
    US: ["Fastest US (No-ID)", [["Ashburn, VA", 19, 412], ["New York, NY", 23, 468], ["Atlanta, GA", 28, 391], ["Chicago, IL", 34, 445], ["Dallas, TX", 41, 377]]],
    "Non-US": ["Fastest Non-US (No-ID)", [["Toronto, CA", 31, 356], ["Montreal, CA", 36, 402], ["Amsterdam, NL", 87, 298], ["Zurich, CH", 96, 264], ["Stockholm, SE", 104, 311]]],
    Canada: ["Fastest Canada (No-ID)", [["Toronto, CA", 31, 356], ["Montreal, CA", 36, 402], ["Vancouver, CA", 74, 288], ["Calgary, CA", 62, 240]]],
    "Latin America": ["Fastest Latin America (No-ID)", [["Querétaro, MX", 58, 196], ["Bogotá, CO", 79, 151], ["São Paulo, BR", 121, 174], ["Santiago, CL", 139, 133]]],
    Europe: ["Fastest Europe (No-ID)", [["London, GB", 82, 334], ["Amsterdam, NL", 87, 298], ["Frankfurt, DE", 91, 351], ["Paris, FR", 93, 287], ["Zurich, CH", 96, 264]]],
    Asia: ["Fastest Asia (No-ID)", [["Tokyo, JP", 162, 182], ["Singapore, SG", 221, 147], ["Hong Kong, HK", 198, 129], ["Seoul, KR", 175, 166]]],
  };
  const byThroughput = () => vpn.rank === "Rank by Throughput";
  const ranked = (cities) => [...cities].sort((a, b) => (byThroughput() ? b[2] - a[2] : a[1] - b[1]));
  const vpnIcon = () => set("vpn-dns", `t${vpn.t}m${vpn.m}d${vpn.d}`);
  const vpnRender = () => { if (cur && cur.id === "vpn-dns") render(); };
  function connect(city) {
    if (city) vpn.city = city;
    vpn.phase = "connecting";
    const seq = ++vpn.seq; // a disconnect while connecting cancels this
    vpnRender();
    setTimeout(() => { if (seq !== vpn.seq) return; vpn.phase = "on"; vpn.m = 1; vpn.d = 0; vpnIcon(); vpnRender(); }, still ? 0 : 700);
  }
  MENUS["vpn-dns"] = {
    name: "VPN & DNS", width: 330,
    build() {
      const mDot = { on: GREEN, connecting: ORANGE, off: GREY }[vpn.phase];
      const mWord = { on: "ON", connecting: "CONNECTING", off: "OFF" }[vpn.phase];
      return [
        head("Mullvad - Swift Otter", "hm-strong"),
        item({
          key: "mullvad", dot: mDot, label: "Connection", detail: `— ${vpn.city} · ${mWord}`,
          onClick: () => {
            if (vpn.phase === "off") connect();
            else { vpn.seq++; vpn.phase = "off"; vpn.m = 0; vpn.d = 1; vpnIcon(); }
          },
        }),
        sub({ label: `Split Tunnel: ${vpn.split ? "On" : "Off"}`, key: "split" }, () => [
          item({ label: "Split Tunnelling", check: vpn.split, onClick: () => { vpn.split = !vpn.split; } }),
          sep(), head("Excluded apps"), info("Steam"),
          item({ label: "Add App…", close: true }),
        ]),
        Object.entries(CITIES).filter(([id]) => vpn.lists[id]).map(([, [list, cities]]) => sub({ label: list }, () => ranked(cities).map(([city, ms, mbps]) => item({
          label: city, key: `${list}-${city}`, detail: byThroughput() ? `${mbps} Mbps` : `${ms} ms`, check: vpn.phase !== "off" && vpn.city === city, radio: true,
          onClick: () => connect(city),
        })))),
        sub({ label: "Throughput" }, () => [item({ label: "Measure Throughput Now", close: true })]),
        sep(),
        head("Tailscale", "hm-strong"),
        item({
          key: "tailscale", dot: vpn.t ? GREEN : GREY, label: "Connection", detail: `· ${vpn.t ? "ON" : "OFF"}`,
          onClick: () => { vpn.t ^= 1; vpnIcon(); },
        }),
        item({
          key: "magicdns", dot: vpn.d ? CYAN : GREY, label: "MagicDNS", detail: `— accept-dns · ${vpn.d ? "ON" : "OFF"}`,
          onClick: () => { vpn.d ^= 1; vpnIcon(); },
        }),
        item({ label: "Open Tailscale App", close: true }),
        footer("VPN & DNS", vpn, {
          version: "1.5.0",
          own: () => [
            sub({ label: "Fastest Lists" }, () => [
              radios(["Rank by Latency", "Rank by Throughput"], vpn.rank, (v) => { vpn.rank = v; }, "rank"),
              sep(),
              Object.keys(vpn.lists).map((id) => item({ label: id, key: `list-${id}`, check: vpn.lists[id], onClick: () => { vpn.lists[id] = !vpn.lists[id]; } })),
            ]),
            // The dot or the iguana: this app's own picker.
            sub({ label: "Icon" }, () => radios(["Dot", "Iguana"], vpn.icon, (v) => { vpn.icon = v; }, "icon")),
          ],
        }),
      ];
    },
  };

  // Mac Daddy, in the plain wording of the app's Normal Mode.
  // A runaway test run keeps forking while the menu is open, so the count
  // climbs past 60% (sweating) and 85% (red hot) of the per-user limit until
  // someone ends it. Every duty switched off puts him to sleep.
  const md = {
    login: true, limit: 5333, base: 1210,
    spawners: [
      { name: "vitest", pid: 48211, kids: 1384, grows: true },
      { name: "node", pid: 3310, kids: 212 },
      { name: "Code Helper", pid: 1021, kids: 96 },
      { name: "zsh", pid: 812, kids: 31 },
    ],
    duty: { media: true, downloads: true, hogs: true },
    ended: 3, interval: "15 seconds", keep: "30 days", auto: false,
    hog: { name: "ffmpeg", pid: 7781, cpu: 96, min: 4 },
    targets: { mediaanalysisd: true, photoanalysisd: true, "VTDecoderXPCService": false },
    hist: [],
  };
  const mdCount = () => md.base + md.spawners.reduce((n, s) => n + s.kids, 0);
  for (let i = 0; i < 40; i++) md.hist.push(mdCount() - 60 + Math.round(Math.sin(i / 3) * 25 + i * 1.5));
  function mdIcon() {
    const d = md.duty;
    if (!(d.media || d.downloads || d.hogs)) return set("mac-daddy", "asleep");
    const f = mdCount() / md.limit;
    set("mac-daddy", f >= 0.85 ? "redHot" : f >= 0.6 ? "sweating" : "cool");
  }
  const fmt = (n) => n.toLocaleString("en-US");
  const mdTitle = () => {
    const n = mdCount();
    return `${fmt(n)} / ${fmt(md.limit)} (${Math.floor((n * 100) / md.limit)}%)`;
  };
  const mdColor = () => { const f = mdCount() / md.limit; return f >= 0.85 ? RED : f >= 0.6 ? ORANGE : ""; };
  function spark() {
    // Drawn from 40% to 100% of the limit, where the interesting part is,
    // with the 60% (sweating) line dashed.
    const n = md.hist.length;
    const y = (f) => (19 - ((Math.max(0.4, f) - 0.4) / 0.6) * 18).toFixed(1);
    const pts = md.hist.map((v, i) => `${((i / (n - 1)) * 200).toFixed(1)},${y(v / md.limit)}`).join(" ");
    const s = svg(`<svg viewBox="0 0 200 20" preserveAspectRatio="none"><line x1="0" x2="200" y1="${y(0.6)}" y2="${y(0.6)}" stroke="rgba(255,159,10,.35)" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/><polyline points="${pts}" fill="none" stroke="${mdColor() || "#bf5af2"}" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>`, "hm-sparkline");
    return s;
  }
  const spawnerText = (s) => `${s.name} [${s.pid}]  —  ${fmt(s.kids)} children`;
  MENUS["mac-daddy"] = {
    name: "Mac Daddy", width: 330,
    build() {
      md.$count = h("span", { class: "hm-val", style: { color: mdColor() } }, mdTitle());
      md.$spark = h("div", { class: "hm-row hm-spark", role: "none" }, spark());
      const d = md.duty;
      const off = (on, text) => (on ? text : "off");
      return [
        h("div", { class: "hm-row hm-title", role: "none" }, h("span", { class: "hm-label" }, "Processes"), md.$count),
        md.$spark,
        info("Zombies  0"),
        item({ label: "Open Activity Monitor", close: true }),
        sep(),
        sub({ key: "media", label: `${"Media Tracking"} — ${off(d.media, `${md.ended} ${"killed"} today`)}` }, () => [
          item({ label: "Enabled", key: "media-on", check: d.media, onClick: () => { d.media = !d.media; mdIcon(); } }),
          item({ label: "Kill Now", key: "media-now", onClick: () => { md.ended++; } }),
          sep(), head("Interval"),
          radios(["5 seconds", "15 seconds", "30 seconds", "60 seconds"], md.interval, (v) => { md.interval = v; }, "int"),
          sep(), head("Processes"),
          Object.keys(md.targets).map((t) => item({ label: t, check: md.targets[t], onClick: () => { md.targets[t] = !md.targets[t]; } })),
        ]),
        sub({ key: "downloads", label: `Downloads — ${off(d.downloads, `${"swept"} 10/4/26`)}` }, () => [
          item({ label: "Enabled", key: "dl-on", check: d.downloads, onClick: () => { d.downloads = !d.downloads; mdIcon(); } }),
          item({ label: `${"Sweep Now"} (last: 10/4/26, 3 trashed)`, key: "sweep", close: true }),
          sep(), head("Keep Files For"),
          radios(["7 days", "14 days", "30 days", "60 days", "90 days"], md.keep, (v) => { md.keep = v; }, "keep"),
          sep(),
          item({ label: "Open Log", close: true }),
        ]),
        sub({
          key: "hogs", cls: md.hog && d.hogs ? "hm-bold" : "",
          label: `${"CPU Hogs"} — ${off(d.hogs, md.hog ? `1 ${"running hot"}` : "none")}`,
        }, () => [
          item({ label: "Enabled", key: "hogs-on", check: d.hogs, onClick: () => { d.hogs = !d.hogs; mdIcon(); } }),
          sep(),
          md.hog ? [
            info(`${md.hog.name} [${md.hog.pid}]  —  ${md.hog.cpu}% for ${md.hog.min} min`),
            item({ label: "End", key: "hog-end", onClick: () => { md.hog = null; md.ended++; } }),
            item({ label: "Ignore", key: "hog-ignore", onClick: () => { md.hog = null; } }),
          ] : info("(none)"),
          sep(),
          item({ label: "Auto-End Orphaned Processes", key: "auto", check: md.auto, onClick: () => { md.auto = !md.auto; } }),
          item({ label: "Rules…", close: true }),
        ]),
        sub({
          key: "queens",
          label: `${"Top Spawners"} — ${md.spawners.length ? `${md.spawners[0].name}, ${fmt(md.spawners[0].kids)} children` : "none"}`,
        }, () => [
          md.spawners.length ? md.spawners.map((s) => {
            s.$el = h("span", { class: "hm-label" }, spawnerText(s));
            return h("div", { class: "hm-row", role: "none" }, s.$el, btn("End", `${"End"} ${s.name}`, () => {
              md.spawners = md.spawners.filter((x) => x !== s);
              md.ended++;
              md.hist.push(mdCount());
              md.hist.shift();
              mdIcon();
              render();
            }, `end-${s.pid}`));
          }) : info("(none)")
        ]),
        sep(),
        item({ label: `Open ${"Launcher"} (⌘Space)`, key: "launcher", close: true }),
        // 1.17.0: a Settings window in place of the Settings submenu.
        sep(),
        item({ label: "Preferences…", key: "preferences", shortcut: "⌘,", close: true }),
        item({ label: "Quit Mac Daddy", shortcut: "⌘Q", close: true }),
      ];
    },
    tick() {
      const s = md.spawners.find((x) => x.grows);
      if (s) s.kids = Math.min(s.kids + 45, Math.round(md.limit * 0.95) - md.base - 339);
      md.hist.push(mdCount());
      md.hist.shift();
      if (s && s.$el) s.$el.textContent = spawnerText(s);
      md.$count.textContent = mdTitle();
      md.$count.style.color = mdColor();
      md.$spark.replaceChildren(spark());
      mdIcon();
    },
  };

  // Claude Usage: read-only. The session countdown runs on the wall clock, so
  // it keeps counting while the menu is shut.
  const T0 = Date.now();
  const cu = {
    session: 41, weekly: 63, icon: "Owl", sessions: false, login: true, polled: T0 - 20_000,
    sessionEnds: T0 + (2 * 3600 + 17 * 60 + 42) * 1000, weekEnds: T0 + (2 * 86400 + 6 * 3600 + 41 * 60) * 1000,
  };
  const left = (ms, secs) => {
    const t = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(t / 86400), hr = Math.floor((t % 86400) / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return [d && `${d}d`, (d || hr) && `${hr}h`, `${m}m`, secs && `${String(s).padStart(2, "0")}s`].filter(Boolean).join(" ");
  };
  const usageColor = (p) => (p >= 80 ? RED : p >= 50 ? ORANGE : GREEN);
  function cuText() {
    const now = Date.now();
    if (now - cu.polled >= 60_000) cu.polled = now; // polled every 60 s
    const ago = Math.floor((now - cu.polled) / 1000);
    cu.$ago.textContent = ago < 2 ? "updated just now" : `updated ${ago}s ago`;
    cu.$sess.textContent = `resets in ${left(cu.sessionEnds - now, true)}`;
    cu.$week.textContent = `resets in ${left(cu.weekEnds - now, false)}`;
  }
  const meter = (label, p, resets) => h("div", { class: "hm-meter", role: "presentation" },
    h("div", { class: "hm-meter-top" }, h("span", null, label), h("b", { style: { color: usageColor(p) } }, `${p}%`)),
    h("div", { class: "hm-bar" }, h("span", { style: { width: `${p}%`, background: usageColor(p) } })),
    h("div", { class: "hm-dim hm-small" }, resets));
  MENUS["claude-usage"] = {
    name: "Claude Usage", width: 280,
    build() {
      cu.$ago = h("span", { class: "hm-dim" });
      cu.$sess = h("span");
      cu.$week = h("span");
      const refresh = btn(ICON.refresh, "Refresh", () => { cu.polled = Date.now(); cuText(); });
      refresh.classList.add("hm-refresh");
      const top = h("div", { class: "hm-row hm-flush", role: "none" },
        h("b", { class: "hm-label hm-dim" }, "Claude · Max 5x"), cu.$ago, refresh);
      const rows = [
        top,
        meter("Session (5-hour)", cu.session, cu.$sess),
        meter("Weekly (7-day)", cu.weekly, cu.$week),
        footer("Claude Usage", cu, {
          version: "1.5.0", cls: "hm-flush", icons: ["Owl", "Arc", "Gauge", "Pie"],
          own: () => [
            item({ label: "Show Sessions", check: cu.sessions, onClick: () => { cu.sessions = !cu.sessions; } }),
            sep(),
            item({ label: "Sign In Again…", close: true }),
            item({ label: "Sign Out of Claude Usage", close: true }),
          ],
        }),
      ];
      cuText();
      return rows;
    },
    tick: cuText,
  };

  // SoundChain: the chain's effects, each on or off; the icon's caterpillar
  // has one lit segment per running effect, or goes grey when bypassed.
  const sc = {
    bypass: false, login: true,
    fx: [["AUNBandEQ", true], ["AUDynamicsProcessor", true], ["AUPeakLimiter", true], ["AUMatrixReverb", false], ["AUDelay", false]]
      .map(([name, on]) => ({ name, on })),
  };
  const scOn = () => sc.fx.filter((f) => f.on).length;
  const scIcon = () => set("soundchain", sc.bypass ? "bypassed" : `fx${scOn()}`);
  MENUS.soundchain = {
    name: "SoundChain", width: 270,
    build() {
      const n = scOn();
      return [
        info("Studio Interface USB"),
        info(sc.bypass ? "Bypassed" : `${n} effect${n === 1 ? "" : "s"} running`),
        info("48 kHz · 256 frames"),
        sep(),
        head("Effects"),
        sc.fx.map((f) => item({
          label: f.name, key: `fx-${f.name}`, check: f.on, cls: sc.bypass ? "hm-dim" : "",
          onClick: () => { f.on = !f.on; scIcon(); },
        })),
        item({ label: "Audio Chain…", shortcut: "⌃C", close: true }),
        sep(),
        item({ label: "Bypass", check: sc.bypass, onClick: () => { sc.bypass = !sc.bypass; scIcon(); } }),
        footer("SoundChain", sc, { version: "1.5.0" }),
      ];
    },
  };

  // Battery Time: the energy mode is the icon's fill (yellow Low Power, blue
  // High Power), and the time left answers it.
  const bt = { mode: "Automatic", celsius: false, show: { "Battery icon": true, "Battery face": true, Percentage: true, "Time remaining": true }, login: true };
  const BT_MODE = {
    Automatic: { key: "auto", left: "6 hr 12 min", watts: "9.4" },
    "Low Power": { key: "low", left: "8 hr 3 min", watts: "7.1" },
    "High Power": { key: "high", left: "4 hr 26 min", watts: "13.2" },
  };
  MENUS["battery-time"] = {
    name: "Battery Time", width: 300,
    build() {
      const m = BT_MODE[bt.mode];
      return [
        head("Energy Mode"),
        radios(Object.keys(BT_MODE), bt.mode, (v) => { bt.mode = v; set("battery-time", BT_MODE[v].key); }, "mode"),
        sep(),
        info("Battery: 80%"),
        info(`${m.left} until empty`),
        info("Health: 96% (212 cycles)"),
        info(`Using ${m.watts} W`),
        info(`${bt.celsius ? "29°C" : "84°F"} · 12.4 V · 5120 / 6400 mAh`),
        item({ label: bt.celsius ? "Switch to °F" : "Switch to °C", key: "units", onClick: () => { bt.celsius = !bt.celsius; } }),
        sep(),
        info("24h on battery: 17h 40m (74%)"),
        info("24h plugged in: 6h 20m (26%)"),
        sep(),
        item({ label: "Battery Life Tips", close: true }),
        item({ label: "Open Battery Settings…", icon: ICON.gear, close: true }),
        footer("Battery Time", bt, {
          version: "1.5.0",
          own: () => [
            head("Menu bar shows"),
            Object.keys(bt.show).map((k) => item({ label: k, check: bt.show[k], onClick: () => { bt.show[k] = !bt.show[k]; } })),
          ],
        }),
      ];
    },
  };

  // Homestead: Home Assistant dashboards. The picker expands inside the menu
  // (as the real one must: a pop-up button can't open while a menu tracks).
  // Lights on across every dashboard light the house's windows; any fan on
  // turns the fan in its window.
  const DASHES = [["thermostat", "Thermostat"], ["den", "Den"], ["kitchen", "Kitchen"], ["patio", "Patio"], ["spa", "Spa"]];
  const hs = {
    dash: "spa", picking: false, sensors: false, tv: false, login: true, icon: "House", weather: "Forecast Home",
    climate: { mode: "heat_cool", low: 65, high: 68, sel: null, now: 68 },
    spa: { now: 101, target: 103 },
  };
  const E = {
    lamp: { kind: "light", name: "Floor Lamp", on: true, bri: 57, k: 3400 },
    fan: { kind: "fan", name: "Ceiling Fan", on: true, speed: 50 },
    tv: { kind: "media", name: "Den TV", on: true, vol: 24, playing: false, show: 0 },
    pend: { kind: "light", name: "Pendants", on: false, bri: 70, k: 2900 },
    strip: { kind: "light", name: "Accent Strip", on: true, bri: 80, k: 4000, color: "#ff8a3d" },
    porch: { kind: "light", name: "Porch Light", on: false, bri: 100, k: 2700 },
    xmas: { kind: "switch", name: "Christmas Lights", on: false },
    sunset: { kind: "automation", name: "Lights at Sunset", on: true, at: [17, 28] },
    shadesUp: { kind: "automation", name: "Open at Sunrise", on: true, at: [6, 20] },
    shadesDown: { kind: "automation", name: "Close at Sunset", on: true, at: [17, 28] },
    shades: { kind: "cover", name: "Shades", pos: 0, dir: 0 },
    jet1: { kind: "jet", name: "Jet 1", on: false, speed: 50 },
    jets2: { kind: "switch", name: "Jets 2", on: false },
    spaLight: { kind: "switch", name: "Spa Light", on: true },
  };
  for (const [id, e] of Object.entries(E)) e.id = id;
  const SHOWS = ["Planet Earth III", "Bake Off", "Slow Horses"];
  const hsIcon = () => {
    const lit = Object.values(E).filter((e) => e.kind === "light" && e.on).length;
    set("homestead", `l${Math.min(2, lit)}f${E.fan.on ? 1 : 0}`);
  };
  // A white bulb's swatch shows its colour temperature: amber at 2200K, blue-white at 6500K.
  const kelvin = (k) => {
    const t = (k - 2200) / 4300, mix = (a, b) => Math.round(a + (b - a) * t);
    return `rgb(${mix(255, 222)},${mix(176, 234)},${mix(110, 255)})`;
  };

  function lightRows(e) {
    const val = h("span", { class: "hm-val" }, e.on ? `${e.bri}%` : "");
    let swatch = null;
    if (e.on && e.color) {
      const input = h("input", { type: "color", value: e.color, "aria-label": `${e.name} colour`, "data-k": `${e.id}-colour` });
      swatch = h("label", { class: "hm-swatch", style: { background: e.color } }, input);
      input.addEventListener("input", () => { e.color = input.value; swatch.style.background = input.value; });
    } else if (e.on) {
      swatch = h("span", { class: "hm-swatch", style: { background: kelvin(e.k) } });
    }
    const rows = [line(e.name, val, swatch, toggle(e.on, e.name, (v) => { e.on = v; hsIcon(); }, `sw-${e.id}`))];
    if (e.on) {
      const k = h("span", { class: "hm-val" }, `${e.k}K`);
      rows.push(
        slider({ label: `${e.name} brightness`, key: `${e.id}-bri`, min: 1, value: e.bri, left: ICON.sunLo, right: ICON.sunHi, cls: "hm-indent",
          onInput(v) { e.bri = v; val.textContent = `${v}%`; } }),
        slider({ label: `${e.name} warmth`, key: `${e.id}-k`, min: 2200, max: 6500, step: 100, value: e.k, left: ICON.sunLo, right: ICON.sunHi, cls: "hm-indent", out: k,
          onInput(v) { e.k = v; k.textContent = `${v}K`; if (!e.color && swatch) swatch.style.background = kelvin(v); } }),
      );
    }
    return rows;
  }
  function fanRows(e) {
    const val = h("span", { class: "hm-val" }, e.on ? `${e.speed}%` : "");
    return [
      line(e.name, val, toggle(e.on, e.name, (v) => { e.on = v; hsIcon(); }, `sw-${e.id}`)),
      e.on && slider({ label: `${e.name} speed`, key: `${e.id}-speed`, min: 25, max: 100, step: 25, value: e.speed, left: ICON.fanLo, right: ICON.fanHi, cls: "hm-indent",
        onInput(v) { e.speed = v; val.textContent = `${v}%`; } }),
    ];
  }
  const switchRow = (e) => line(e.name, toggle(e.on, e.name, (v) => { e.on = v; }, `sw-${e.id}`));
  // An automation's row shows when it runs next, as Homestead 1.20.0 words it:
  // the bare time today, "Tomorrow 6:20 AM" after that; nothing while it's off.
  function nextRun([hour, minute]) {
    const now = new Date(), run = new Date(now);
    run.setHours(hour, minute, 0, 0);
    if (run <= now) run.setDate(run.getDate() + 1);
    const time = run.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return run.getDate() === now.getDate() ? time : `Tomorrow ${time}`;
  }
  function autoRow(e) {
    const val = h("span", { class: "hm-val" }, e.on ? nextRun(e.at) : "");
    return line(e.name, val, toggle(e.on, e.name, (v) => { e.on = v; val.textContent = v ? nextRun(e.at) : ""; }, `sw-${e.id}`));
  }
  function mediaRows(e) {
    const what = e.on ? (e.playing ? SHOWS[e.show] : "Plex · Paused") : "Off";
    return [
      line(e.name, h("span", { class: "hm-val" }, what), toggle(e.on, `${e.name} power`, (v) => { e.on = v; if (!v) e.playing = false; }, `sw-${e.id}`)),
      e.on && slider({ label: `${e.name} volume`, key: `${e.id}-vol`, value: e.vol, left: ICON.spkLo, right: ICON.spkHi, cls: "hm-indent", onInput(v) { e.vol = v; } }),
      e.on && h("div", { class: "hm-row hm-transport", role: "none" },
        btn(`⏮${T}`, "Previous", () => { e.show = (e.show + SHOWS.length - 1) % SHOWS.length; render(); }, "tv-prev"),
        btn(`⏯${T}`, e.playing ? "Pause" : "Play", () => { e.playing = !e.playing; render(); }, "tv-play"),
        btn(`⏭${T}`, "Next", () => { e.show = (e.show + 1) % SHOWS.length; render(); }, "tv-next")),
    ];
  }
  function remoteGrid(name) {
    const cells = [[ICON.power, "Power"], [`▲${T}`, "Up"], [ICON.home, "Home"], [`◀${T}`, "Left"], ["OK", "Select"], [`▶${T}`, "Right"],
      ["↩", "Back"], [`▼${T}`, "Down"], ["☰", "Menu"]];
    return h("div", { class: "hm-grid", role: "group", "aria-label": `${name} remote` },
      cells.map(([g, label]) => { const b = btn(g, label, () => flash(b), `remote-${label}`); return b; }));
  }
  // A script or button card; with `confirm`, the first press asks first.
  function pressRow(name, confirm) {
    const b = btn("Press", `${name}: press`, () => {
      clearTimeout(b._t);
      if (confirm && !b.classList.contains("hm-warn")) {
        b.classList.add("hm-warn");
        b.textContent = "Confirm?";
        b._t = setTimeout(() => { b.classList.remove("hm-warn"); b.textContent = "Press"; }, 3000);
        return;
      }
      b.classList.remove("hm-warn");
      b.textContent = "Done";
      flash(b);
      b._t = setTimeout(() => { b.textContent = "Press"; }, 1200);
    }, `press-${name}`);
    return line(name, b);
  }
  // A cover: open / stop / close, and a position slider shown even while
  // closed (dragging a closed shade half-way is how you open it half-way).
  const coverText = (e) => `${e.dir > 0 ? "Opening" : e.dir < 0 ? "Closing" : e.pos === 0 ? "Closed" : "Open"} · ${e.pos}%`;
  function moveCover(e, dir) {
    clearInterval(e._t);
    e.dir = dir;
    const show = () => { if (e.$val) e.$val.textContent = coverText(e); if (e.$range) e.$range.value = e.pos; };
    if (dir) {
      e._t = setInterval(() => {
        e.pos = Math.max(0, Math.min(100, e.pos + dir * 4));
        if (e.pos === 0 || e.pos === 100) { clearInterval(e._t); e.dir = 0; }
        show();
      }, still ? 20 : 80);
    }
    show();
  }
  function coverRows(e) {
    e.$val = h("span", { class: "hm-val" }, coverText(e));
    const row = slider({ label: `${e.name} position`, key: `${e.id}-pos`, value: e.pos, cls: "hm-indent", onInput(v) { moveCover(e, 0); e.pos = v; e.$val.textContent = coverText(e); } });
    e.$range = row.querySelector("input");
    return [
      line(e.name, e.$val, h("span", { class: "hm-steps" },
        btn(`▲${T}`, `Open ${e.name}`, () => moveCover(e, 1), `${e.id}-open`),
        btn("■", `Stop ${e.name}`, () => moveCover(e, 0), `${e.id}-stop`),
        btn(`▼${T}`, `Close ${e.name}`, () => moveCover(e, -1), `${e.id}-close`))),
      row,
    ];
  }
  const sensor = (name, value) => hs.sensors && line(name, h("span", { class: "hm-val" }, value));

  // The thermostat: mode picker in place of a switch, and the target (or both
  // ends of a heat/cool range) as chips: pick one, then ▲▼ step it.
  const MODES = [["heat", "Heat"], ["cool", "Cool"], ["heat_cool", "Heat·Cool"], ["off", "Off"]];
  function hvacAction(c) {
    if (c.mode === "off") return "Off";
    if (c.mode !== "cool" && c.now < c.low) return "Heating";
    if (c.mode !== "heat" && c.now >= c.high) return "Cooling";
    return "Idle";
  }
  function climateRows() {
    const c = hs.climate;
    const ends = { heat: ["low"], cool: ["high"], heat_cool: ["low", "high"], off: [] }[c.mode];
    if (ends.length === 1) c.sel = ends[0]; // one chip: always the one ▲▼ step
    else if (!ends.includes(c.sel)) c.sel = null;
    const step = (d) => {
      if (c.sel === "low") c.low = Math.max(50, Math.min(c.high - 1, c.low + d));
      if (c.sel === "high") c.high = Math.min(90, Math.max(c.low + 1, c.high + d));
      render();
    };
    const up = btn(`▲${T}`, "Raise target", () => step(1), "t-up");
    const down = btn(`▼${T}`, "Lower target", () => step(-1), "t-down");
    up.disabled = down.disabled = !c.sel;
    return [
      head("CLIMATE"),
      line("Hallway", h("span", { class: "hm-val" }, `${c.now}°F · ${hvacAction(c)}`)),
      h("div", { class: "hm-seg", role: "radiogroup", "aria-label": "Hallway mode" }, MODES.map(([k, label]) => h("button", {
        type: "button", role: "radio", "aria-checked": String(c.mode === k), "data-k": `mode-${k}`,
        onclick: () => { c.mode = k; render(); },
      }, label))),
      ends.length && line("Set to",
        ends.map((end) => h("button", {
          type: "button", class: "hm-chip", "aria-pressed": String(c.sel === end), "data-k": `chip-${end}`,
          "aria-label": `${end === "low" ? "Heat to" : "Cool to"} ${c[end]}°F`,
          onclick: () => { c.sel = end; render(); },
        }, `${c[end]}°F`)),
        h("span", { class: "hm-steps" }, up, down)),
      sensor("Hallway Humidity", "41%"),
      sensor("Furnace Filter", "OK"),
    ];
  }
  // The spa (a Balboa controller): heat-only, 80–104°F in whole degrees, a
  // two-speed Jet 1, Jets 2 and the light as switches.
  function spaRows() {
    const sp = hs.spa;
    const step = (d) => { sp.target = Math.max(80, Math.min(104, sp.target + d)); render(); };
    const heating = sp.now < sp.target;
    const j = E.jet1;
    const jetVal = h("span", { class: "hm-val" }, j.on ? (j.speed > 50 ? "High" : "Low") : "");
    return [
      head("SPA"),
      line("Spa", h("span", { class: "hm-val" }, `${sp.now}°F · ${heating ? "Heating" : "Idle"}`)),
      line("Set to",
        h("button", { type: "button", class: "hm-chip", "aria-pressed": "true", "data-k": "spa-target", "aria-label": `Heat to ${sp.target}°F` }, `${sp.target}°F`),
        h("span", { class: "hm-steps" },
          btn(`▲${T}`, "Raise spa target", () => step(1), "spa-up"),
          btn(`▼${T}`, "Lower spa target", () => step(-1), "spa-down"))),
      head("JETS & LIGHT"),
      line(j.name, jetVal, toggle(j.on, j.name, (v) => { j.on = v; render(); }, "sw-jet1")),
      j.on && slider({ label: "Jet 1 speed", key: "jet1-speed", min: 50, max: 100, step: 50, value: j.speed, left: ICON.fanLo, right: ICON.fanHi, cls: "hm-indent",
        onInput(v) { j.speed = v; jetVal.textContent = v > 50 ? "High" : "Low"; } }),
      switchRow(E.jets2),
      switchRow(E.spaLight),
      sensor("Heat State", heating ? "Heating" : "Off"),
      sensor("Circulation Pump", "Running"),
      sensor("Filter 1", "Running"),
    ];
  }
  const DASH = {
    spa: spaRows,
    thermostat: climateRows,
    den: () => [
      head("LIGHTS & FAN"), lightRows(E.lamp), fanRows(E.fan),
      sensor("Den Motion", "Clear · 6 min ago"),
      // The dashboard's later view folds under its title (1.17.0).
      fold("view-tv", "TV", null, hs.tv, () => { hs.tv = !hs.tv; }),
      hs.tv && [mediaRows(E.tv), head("REMOTE"), remoteGrid("Den TV")],
    ],
    kitchen: () => [
      head("LIGHTS"), lightRows(E.pend), lightRows(E.strip),
      head("SCRIPTS"), pressRow("Start Coffee", false), pressRow("Restart Router", true),
      head("AUTOMATIONS"), autoRow(E.sunset),
      sensor("Fridge Door", "Closed"),
    ],
    patio: () => [
      head("LIGHTS & SHADES"), lightRows(E.porch), switchRow(E.xmas), coverRows(E.shades),
      head("AUTOMATIONS"), autoRow(E.shadesUp), autoRow(E.shadesDown),
      sensor("Patio Temperature", "71°F"),
      sensor("Rain Sensor", "Dry"),
    ],
  };
  MENUS.homestead = {
    name: "Homestead", width: 330,
    // Later views are folded every time the menu opens.
    onOpen() { hs.tv = false; },
    build() {
      const picker = h("button", {
        type: "button", class: "hm-row hm-act hm-picker", "data-k": "picker",
        "aria-expanded": String(hs.picking), "aria-label": `Dashboard: ${DASHES.find((d) => d[0] === hs.dash)[1]}`,
        onclick: () => { hs.picking = !hs.picking; render(); },
      }, h("span", { class: "hm-label" }, DASHES.find((d) => d[0] === hs.dash)[1]), svg(ICON.chevDown));
      return [
        picker,
        hs.picking && DASHES.map(([id, name]) => item({
          label: name, key: `dash-${id}`, check: hs.dash === id, radio: true,
          onClick: () => { hs.dash = id; hs.picking = false; },
        })),
        sep(),
        DASH[hs.dash](),
        footer("Homestead", hs, {
          version: "1.20.1", icons: ["House", "Dot"],
          own: () => [
            item({ label: "Show Sensors", check: hs.sensors, onClick: () => { hs.sensors = !hs.sensors; } }),
            sub({ label: "Weather" }, () => [
              radios(["Forecast Home"], hs.weather, (v) => { hs.weather = v; }, "weather"),
              sep(),
              radios(["Off"], hs.weather, (v) => { hs.weather = v; }, "weather"),
            ]),
            sep(),
            item({ label: "Dashboards…", close: true }),
            item({ label: "Connection…", close: true }),
          ],
        }),
      ];
    },
  };

  // Panes: the displays first (an external monitor over DDC, the built-in
  // panel from Dim to XDR), then Night Shift, then the windows. The grid and
  // the actions move the front window, drawn amber on the icon (the Screen
  // Grid) over a window on the left half. Keys are the sprite's:
  // r<c0><r0><c1><r1> for a rectangle of the 4×4 grid (columns and rows from
  // the top left), col and box for ⌥⌘C's column and box. The menu's grid is
  // 8×8 half-cells, unlabelled, as in Panes 1.0.1; a pick from it is kept
  // exactly (`pn.fine`) for the grid's shading, and the icon shows the 4×4
  // rectangle around it (the bar's 22pt can't show half-cells anyway).
  const BACK = [0, 0, 3, 7]; // the window behind: the left half, in half-cells
  const RES = ["1920×1080", "2304×1296", "2560×1440", "3008×1692", "3840×2160"];
  const pn = {
    at: "r2033", fine: null, history: [], drag: null, ext: true, int: false, nsOpen: false,
    bri: 75, con: 70, res: 2, built: 60, xdr: false, ns: false, warm: 66, schedule: true, shortcuts: false,
  };
  // The built-in slider: its bottom fifth is Dim (81% of the light down to
  // 35%), then macOS's own range, then with XDR on a fifth past full.
  const builtText = (v) => (v < 20 ? `Dim ${Math.round(35 + (46 * v) / 20)}%`
    : v <= 80 ? `${Math.round(((v - 20) / 60) * 100)}%` : `XDR +${Math.round(((v - 80) / 20) * 100)}%`);
  const pnSlider = (name, key, icon, o) => {
    const out = h("span", { class: "hm-val" }, o.text ? o.text(pn[key]) : String(pn[key]));
    return slider({
      name, label: o.label || name, key: `pn-${key}`, left: icon, value: pn[key], min: o.min, max: o.max, out,
      onInput(v) { pn[key] = v; out.textContent = o.text ? o.text(v) : String(v); },
    });
  };
  const rectKey = (c0, r0, c1, r1) => `r${Math.min(c0, c1)}${Math.min(r0, r1)}${Math.max(c0, c1)}${Math.max(r0, r1)}`;
  function pnMove(key, fine = null) {
    if (key === pn.at && String(fine) === String(pn.fine)) return;
    pn.history.push([pn.at, pn.fine]);
    pn.at = key;
    pn.fine = fine;
    set("panes", key);
  }
  // A half-cell rectangle of the 8×8 grid, and the 4×4 rectangle around it.
  const fineRect = (c0, r0, c1, r1) => [Math.min(c0, c1), Math.min(r0, r1), Math.max(c0, c1), Math.max(r0, r1)];
  const pnPick = (r) => pnMove(rectKey(r[0] >> 1, r[1] >> 1, r[2] >> 1, r[3] >> 1), r);
  // The front window in half-cells: the grid's own pick, else its 4×4
  // rectangle doubled, or ⌥⌘C's column (1000 of 1512 pt) and box.
  function frontFine() {
    if (pn.fine) return pn.fine;
    const m = /^r(\d)(\d)(\d)(\d)$/.exec(pn.at);
    if (m) { const [c0, r0, c1, r1] = m.slice(1).map(Number); return [2 * c0, 2 * r0, 2 * c1 + 1, 2 * r1 + 1]; }
    return pn.at === "col" ? [1, 0, 6, 7] : [1, 1, 6, 6];
  }
  // Which half of each axis the front window holds: 0 first, 1 second, null both.
  function spans() {
    const m = /^r(\d)(\d)(\d)(\d)$/.exec(pn.at);
    if (!m) return [null, null];
    const [c0, r0, c1, r1] = m.slice(1).map(Number);
    const span = (a, b) => (a === 0 && b === 1 ? 0 : a === 2 && b === 3 ? 1 : null);
    return [span(c0, c1), span(r0, r1)];
  }
  // The arrows combine, Windows 11 style: each moves one edge, and pressing
  // toward the side the window already holds widens it back to that half.
  function arrow(axis, side) {
    let [col, row] = spans();
    if (axis === "x") { if (col === side) row = null; else col = side; }
    else if (row === side) col = null; else row = side;
    const ends = (s) => (s === null ? [0, 3] : s === 0 ? [0, 1] : [2, 3]);
    const [c0, c1] = ends(col), [r0, r1] = ends(row);
    pnMove(rectKey(c0, r0, c1, r1));
  }
  // ⌥⌘C: a centred column the full height; pressed on the column, a box two
  // thirds high. Any window not in the column gets the column first.
  const center = () => pnMove(pn.at === "col" ? "box" : "col");
  function pnGrid() {
    const front = frontFine();
    const inside = (r, c, row) => c >= r[0] && c <= r[2] && row >= r[1] && row <= r[3];
    const cells = Array.from({ length: 64 }, (_, i) => {
      const c = i % 8, row = Math.floor(i / 8);
      const sel = pn.drag && inside(fineRect(...pn.drag), c, row);
      const cls = sel ? "pn-sel" : inside(front, c, row) ? "pn-front" : inside(BACK, c, row) ? "pn-back" : "";
      return h("button", {
        type: "button", class: `pn-cell ${cls}`, "data-k": `cell-${c}-${row}`, "data-c": c, "data-r": row,
        "aria-label": `Fill half-cell ${c + 1}, ${row + 1}`,
        // A keyboard press (no pointer) picks the one half-cell.
        onclick: (e) => { if (e.detail === 0) { pnPick([c, row, c, row]); render(); } },
      });
    });
    const grid = h("div", { class: "pn-grid", role: "group", "aria-label": "Layout grid: click a cell, or drag across cells" }, cells);
    const cellAt = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const b = el && el.closest(".pn-cell");
      return b && grid.contains(b) ? [+b.dataset.c, +b.dataset.r] : null;
    };
    const paint = () => grid.querySelectorAll(".pn-cell").forEach((b) => {
      const d = pn.drag, c = +b.dataset.c, r = +b.dataset.r;
      b.classList.toggle("pn-sel", !!d && c >= Math.min(d[0], d[2]) && c <= Math.max(d[0], d[2])
        && r >= Math.min(d[1], d[3]) && r <= Math.max(d[1], d[3]));
    });
    grid.addEventListener("pointerdown", (e) => {
      const at = cellAt(e);
      if (!at) return;
      e.preventDefault();
      grid.setPointerCapture(e.pointerId);
      pn.drag = [...at, ...at];
      paint();
    });
    grid.addEventListener("pointermove", (e) => {
      if (!pn.drag) return;
      const at = cellAt(e);
      if (at && (at[0] !== pn.drag[2] || at[1] !== pn.drag[3])) { pn.drag[2] = at[0]; pn.drag[3] = at[1]; paint(); }
    });
    const end = (apply) => () => {
      const d = pn.drag;
      pn.drag = null;
      if (d && apply) pnPick(fineRect(...d));
      render();
    };
    grid.addEventListener("pointerup", end(true));
    grid.addEventListener("pointercancel", end(false));
    return h("div", { class: "hm-row pn-wrap", role: "none" }, grid);
  }
  MENUS.panes = {
    name: "Panes", width: 310,
    // Panes folds the actions under Shortcuts each time its menu opens; the
    // display and Night Shift sections stay as they were left (1.7.0).
    onOpen() { pn.shortcuts = false; },
    build() {
      const act = (label, shortcut, run) => item({ label, shortcut, onClick: run });
      const shortcuts = fold("shortcuts", "Shortcuts", null, pn.shortcuts, () => { pn.shortcuts = !pn.shortcuts; });
      return [
        fold("ext", "PIXELVIEW 27Q", "USB-C", pn.ext, () => { pn.ext = !pn.ext; }),
        ...(!pn.ext ? [] : [
          pnSlider("Brightness", "bri", ICON.sunHi, { label: "External display brightness" }),
          pnSlider("Contrast", "con", ICON.contrast, {}),
          pnSlider("Resolution", "res", ICON.resize, { min: 0, max: RES.length - 1, text: (i) => RES[i] }),
          info("✓ Night Shift works on this display", { cls: "hm-indent" }),
        ]),
        sep(),
        fold("int", "Built-in Display", null, pn.int, () => { pn.int = !pn.int; }),
        ...(!pn.int ? [] : [
          pnSlider("Brightness", "built", ICON.sunHi, { label: "Built-in display brightness", max: pn.xdr ? 100 : 80, text: builtText }),
          item({ label: "XDR Brightness", check: pn.xdr, onClick: () => { pn.xdr = !pn.xdr; if (!pn.xdr) pn.built = Math.min(pn.built, 80); } }),
        ]),
        sep(),
        fold("ns", "Night Shift", null, pn.nsOpen, () => { pn.nsOpen = !pn.nsOpen; }),
        ...(!pn.nsOpen ? [] : [
          item({ label: "Enabled", check: pn.ns, onClick: () => { pn.ns = !pn.ns; } }),
          pn.ns && pnSlider("Warmth", "warm", ICON.thermo, {}),
          // The schedule opens its own window; the grey line is its next change.
          item({ label: "Schedule…", check: pn.schedule, close: true, onClick: () => {} }),
          pn.schedule && info(pn.ns ? "Off at 6:48 AM" : "On at 7:12 PM"),
        ]),
        sep(),
        pnGrid(),
        sep(),
        shortcuts,
        ...(!pn.shortcuts ? [] : [
          sep(),
          act("Left Half", "⌥⌘←", () => arrow("x", 0)),
          act("Right Half", "⌥⌘→", () => arrow("x", 1)),
          act("Top Half", "⌥⌘↑", () => arrow("y", 0)),
          act("Bottom Half", "⌥⌘↓", () => arrow("y", 1)),
          sep(),
          act("Top Left", "⌥⌘[", () => pnMove("r0011")),
          act("Top Right", "⌥⌘]", () => pnMove("r2031")),
          act("Bottom Left", "⌥⌘;", () => pnMove("r0213")),
          act("Bottom Right", "⌥⌘'", () => pnMove("r2233")),
          sep(),
          act("Maximize", "⌥⌘M", () => pnMove("r0033")),
          act("Center", "⌥⌘C", center),
          item({
            label: "Restore", shortcut: "⌥⌘⌫", disabled: !pn.history.length,
            onClick: () => { [pn.at, pn.fine] = pn.history.pop(); set("panes", pn.at); },
          }),
          sep(),
          item({ label: "Next Display", shortcut: "⌥⌘N", disabled: true }),
        ]),
        // Every setting is in the Settings window since 1.9.0: no Settings
        // or Icon submenu, and the version is shown there.
        sep(),
        item({ label: "Settings…", key: "settings", icon: ICON.gear, shortcut: "⌘,", close: true }),
        item({ label: "Quit Panes", shortcut: "⌘Q", close: true }),
      ];
    },
  };

  // ------------------------------------------------------- open, close, keys

  let cur = null; // the open menu: { id, hit, el, timer, scroll }
  const FOCUSABLE = "button:not(:disabled), input";
  const focusables = (root) => [...root.querySelectorAll(FOCUSABLE)]
    .filter((el) => el.getAttribute("aria-disabled") !== "true" && el.getClientRects().length);
  const focusFirst = (root) => { const f = focusables(root)[0]; (f || root).focus({ preventScroll: true }); };
  const rows = (id) => MENUS[id].build().flat(Infinity).filter(Boolean);

  // Rebuild the open menu from its state, keeping open flyouts open and focus
  // where it was (by data-k). Cheaper to think about than patching rows.
  function render() {
    if (!cur) return;
    const el = cur.el;
    const a = document.activeElement;
    const focusKey = el.contains(a) && a.dataset ? a.dataset.k : null;
    const path = [];
    for (let m = el; m && m._sub; m = m._sub._fly) path.push(m._sub.firstChild.dataset.k);
    el.replaceChildren(...rows(cur.id));
    el._sub = null;
    let parent = el;
    for (const k of path) {
      const b = parent.querySelector(`.hm-subwrap > [data-k="${CSS.escape(k)}"]`);
      if (!b) break;
      openSub(b.parentElement, false);
      parent = b.parentElement._fly;
    }
    if (focusKey) {
      const t = el.querySelector(`[data-k="${CSS.escape(focusKey)}"]`);
      if (t) t.focus({ preventScroll: true });
      else focusFirst(el);
    }
  }

  // Left edge under the icon, just below the bar, kept inside the figure; on
  // phones the bar scrolls under the menu, so centre it instead.
  function place() {
    const fr = fig.getBoundingClientRect(), hr = cur.hit.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
    const w = cur.el.offsetWidth;
    let x = phone.matches ? (fr.width - w) / 2 : hr.left - fr.left;
    x = Math.max(0, Math.min(x, fr.width - w));
    cur.el.style.left = `${x}px`;
    cur.el.style.top = `${wr.bottom - fr.top + 2}px`;
  }

  function openMenu(id, hit, { focus = true } = {}) {
    closeMenu(false);
    const m = MENUS[id];
    if (m.onOpen) m.onOpen();
    const el = h("div", { class: "hm-menu", id: "hm-menu", role: "dialog", "aria-label": m.name, tabindex: "-1", style: { width: `${m.width}px` } });
    cur = { id, hit, el, scroll: bezel.scrollLeft };
    el.append(...rows(id));
    fig.append(el);
    hit.setAttribute("aria-expanded", "true");
    hit.setAttribute("aria-controls", "hm-menu");
    hit.classList.add("is-open");
    place();
    if (!still) {
      el.classList.add("hm-enter");
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("hm-enter")));
    }
    if (focus) focusFirst(el);
    if (m.tick) cur.timer = setInterval(m.tick, 1000);
  }

  function closeMenu(refocus) {
    if (!cur) return;
    const { el, hit, timer } = cur;
    cur = null;
    clearInterval(timer);
    el.remove();
    hit.setAttribute("aria-expanded", "false");
    hit.removeAttribute("aria-controls");
    hit.classList.remove("is-open");
    if (refocus) hit.focus({ preventScroll: true });
  }

  function onKey(e) {
    if (!cur) return;
    const a = document.activeElement;
    const inMenu = cur.el.contains(a);
    if (e.key === "Escape") {
      e.preventDefault();
      const fly = inMenu && a.closest(".hm-fly");
      if (fly) return closeSub(fly.parentElement);
      if (cur.el._sub) return closeSub(cur.el._sub);
      return closeMenu(true);
    }
    if (!inMenu) return;
    if (e.key === "Tab") {
      // Tab cycles through everything in the menu, flyouts included.
      const list = focusables(cur.el);
      const i = list.indexOf(a);
      e.preventDefault();
      list[(i + (e.shiftKey ? -1 : 1) + list.length) % list.length]?.focus();
      return;
    }
    if (a.tagName === "INPUT") return; // sliders own their arrow keys
    const box = a.closest(".hm-menu");
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const list = focusables(box).filter((x) => x.closest(".hm-menu") === box);
      const i = list.indexOf(a);
      const n = e.key === "ArrowDown" ? i + 1 : i <= 0 ? list.length - 1 : i - 1;
      list[n % list.length]?.focus();
    } else if (e.key === "ArrowRight" && a.parentElement && a.parentElement._build) {
      e.preventDefault();
      openSub(a.parentElement, true);
    } else if (e.key === "ArrowLeft" && box.classList.contains("hm-fly")) {
      e.preventDefault();
      closeSub(box.parentElement);
    }
  }

  // ------------------------------------------------------------------- setup

  hero.ready.then((data) => {
    const { bar, icons, states } = data;
    const pct = (r) => ({
      left: `${(r.x / bar.w) * 100}%`, top: `${(r.y / bar.h) * 100}%`,
      width: `${(r.w / bar.w) * 100}%`, height: `${(r.h / bar.h) * 100}%`,
    });
    // macOS's highlight spans the bar's height less a couple of points, and a
    // few points either side of the icon.
    const pill = (r, pad) => pct({ x: r.x - pad, y: 2, w: r.w + pad * 2, h: bar.h - 4 });

    const hits = {};
    const ids = Object.keys(MENUS).filter((id) => icons[id] || states[id])
      .sort((a, b) => (icons[a] || states[a]).x - (icons[b] || states[b]).x);
    for (const id of ids) {
      const b = h("button", {
        type: "button", class: "hm-hit", "aria-label": `${MENUS[id].name} menu`, "aria-haspopup": "dialog",
        "aria-expanded": "false", style: pill(icons[id] || states[id], 5),
      });
      b.addEventListener("click", () => (cur && cur.id === id ? closeMenu(true) : openMenu(id, b)));
      wrap.append(b);
      hits[id] = b;
    }

    // Show Homestead's menu, on its Spa dashboard, the first time the bar comes
    // into view. No focus moves: the page keeps its own. A menu closes once the
    // bar has scrolled away, so none is left hanging over another section.
    let shown = false;
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        if (cur) closeMenu(false);
      } else if (!shown && hits.homestead) {
        shown = true;
        openMenu("homestead", hits.homestead, { focus: false });
      }
    }).observe(fig);

    // Close on a press anywhere else (capture phase, so it runs before
    // another icon's click opens that one), on Escape, and when the phone
    // layout's bar is scrolled out from under the menu.
    document.addEventListener("pointerdown", (e) => {
      if (cur && !cur.el.contains(e.target) && !cur.hit.contains(e.target)) closeMenu(false);
    }, true);
    document.addEventListener("keydown", onKey);
    bezel.addEventListener("scroll", () => {
      if (cur && Math.abs(bezel.scrollLeft - cur.scroll) > 4) closeMenu(false);
    }, { passive: true });
    addEventListener("resize", () => { if (cur) place(); });
  });
})();
