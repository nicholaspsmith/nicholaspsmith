// The hero bar comes alive. Each animated app does its thing once every 30
// seconds, one at a time and evenly spaced; Homestead's house walks through
// the weather on a clock of its own; and the mock menus (hero-menus.js) can
// change what an icon shows through `menumonHero.setState`. Overlays sit
// exactly over the icons in the bar image (positions and sprite strips come
// from art/glyphs/render-glyphs.sh, via img/hero/anim.json). The bar is
// complete without any of this, and nothing moves for a reader who has asked
// for reduced motion — though menus can still change an icon.
(() => {
  const CYCLE = 30_000; // each app once per cycle
  const WEATHER_EVERY = 3_000; // one sky per three seconds
  const WEATHER_OFFSET = 1_500; // half a step out of phase with the apps
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wrap = document.querySelector(".bar-wrap");
  if (!wrap) return;

  let resolveReady;
  const api = {
    // Resolves with img/hero/anim.json (bar size, icon rects and state keys)
    // once the overlays exist.
    ready: new Promise((r) => { resolveReady = r; }),
    setState: () => {},
    getState: () => null,
  };
  window.menumonHero = api;

  fetch("/menumon/anim.json")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => data && start(data))
    .catch(() => {});

  function overlay(icon, bar, frames) {
    const el = document.createElement("span");
    el.className = "bar-anim";
    el.setAttribute("aria-hidden", "true");
    Object.assign(el.style, {
      left: `${(icon.x / bar.w) * 100}%`,
      top: `${(icon.y / bar.h) * 100}%`,
      width: `${(icon.w / bar.w) * 100}%`,
      height: `${(icon.h / bar.h) * 100}%`,
      backgroundImage: `url("${icon.src}")`,
      backgroundSize: `${frames * 100}% 100%`,
    });
    wrap.appendChild(el);
    return el;
  }

  // Frame i of n, as a background position: with the strip n frames wide,
  // 0% shows the first and 100% the last.
  const frameAt = (i, n) => `${n > 1 ? (i / (n - 1)) * 100 : 0}%`;

  function start(data) {
    const { bar, icons } = data;
    const states = data.states || {};
    const current = {};

    // One state overlay per app a menu can change, hidden while it shows
    // what the bar image already does (the first key).
    const stateEls = {};
    for (const [id, st] of Object.entries(states)) {
      if (id === "homestead") continue;
      const el = overlay(st, bar, st.keys.length);
      el.style.opacity = "0";
      stateEls[id] = el;
      current[id] = st.keys[0];
    }

    // Homestead: the house's sky changes on its own; the menus set its lights
    // and fan. Its overlay is always up, since the bar image has no weather.
    const house = states.homestead;
    let sky = 0;
    let lights = "l2f1"; // the bar image: both windows lit, fan turning
    let houseEl = null;
    const showHouse = () => {
      if (!houseEl) return;
      const i = house.keys.indexOf(`w${sky}${lights}`);
      if (i >= 0) houseEl.style.backgroundPositionX = frameAt(i, house.keys.length);
    };
    if (house) {
      houseEl = overlay(house, bar, house.keys.length);
      current.homestead = lights;
      showHouse();
      if (!still) {
        const skies = new Set(house.keys.map((k) => k.match(/^w(\d+)/)[1])).size;
        setTimeout(() => {
          setInterval(() => { sky = (sky + 1) % skies; showHouse(); }, WEATHER_EVERY);
        }, WEATHER_OFFSET);
      }
    }

    api.getState = (id) => current[id] ?? null;
    api.setState = (id, key) => {
      if (id === "homestead") {
        if (!house || !/^l[0-2]f[01]$/.test(key)) return;
        lights = key;
        current.homestead = key;
        showHouse();
        return;
      }
      const st = states[id], el = stateEls[id];
      if (!st || !el) return;
      const i = st.keys.indexOf(key);
      if (i < 0) return;
      current[id] = key;
      el.style.backgroundPositionX = frameAt(i, st.keys.length);
      el.style.opacity = i === 0 ? "0" : "1";
    };

    // The once-a-minute animations, drawn in each app's resting state, so an
    // app whose state a menu has changed sits its turn out.
    const animated = Object.keys(icons).filter((id) => icons[id].seconds > 0).sort();
    const players = animated.map((id) => {
      const icon = icons[id];
      const el = overlay(icon, bar, icon.frames);
      el.style.opacity = "0";
      el.style.zIndex = "1";
      // Frame by frame from the clock, never interpolated: an animation's
      // easing can't be trusted to hold a sprite still between frames (Safari
      // ignores `steps(…, jump-none)` and slides the strip instead).
      return () => {
        const st = states[id];
        if (st && current[id] !== st.keys[0]) return;
        const begin = performance.now();
        const total = icon.seconds * 1000;
        el.style.backgroundPositionX = frameAt(0, icon.frames);
        el.style.opacity = "1";
        const tick = (now) => {
          const t = Math.min(1, (now - begin) / total);
          el.style.backgroundPositionX = frameAt(Math.round(t * (icon.frames - 1)), icon.frames);
          if (t < 1) requestAnimationFrame(tick);
          else el.style.opacity = "0";
        };
        requestAnimationFrame(tick);
      };
    });
    if (!still && players.length) {
      const gap = CYCLE / players.length;
      players.forEach((play, k) => {
        setTimeout(() => { play(); setInterval(play, CYCLE); }, 1_000 + k * gap);
      });
    }

    resolveReady(data);
  }
})();
