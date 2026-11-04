// crossfade-tight.js : enchaînement serré pour Spotify Free via Spicetify (v5, avec menu de réglages)
// Made By Us3r. | If u Paid u get scam
(function crossfadeTight() {
  const STORE_KEY = "crossfade-tight:settings";

  // ===== Réglages par défaut (modifiables dans le menu) =====
  const DEFAULTS = {
    enabled: true,
    fadeOutMs: 3000,   // durée du fade-out avant la fin du morceau
    skipAt: 80,        // % du fade-out après lequel on lance le morceau suivant
    fadeInMs: 1800,    // durée du fade-in du morceau suivant
    floor: 0,          // volume plancher (%)
    curve: "smooth",   // smooth | linear | exp
    minTrackSec: 20,   // ignore les morceaux plus courts que X secondes
    logs: true,        // logs dans la console
  };
  const TICK = 50;

  // --- Réglages persistants ---
  function loadCfg() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      return Object.assign({}, DEFAULTS, raw);
    } catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function saveCfg() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(cfg)); } catch (e) {}
  }
  let cfg = loadCfg();
  const LOG = (...a) => { if (cfg.logs) console.log("[crossfade-tight]", ...a); };

  // --- État du lecteur : plusieurs sources ---
  function getState() {
    try { const s = Spicetify.Platform.PlayerAPI._state; if (s && s.item) return s; } catch (e) {}
    try { const s = Spicetify.Platform.PlayerAPI.getState && Spicetify.Platform.PlayerAPI.getState(); if (s && s.item) return s; } catch (e) {}
    try { const s = Spicetify.Player.origin._state; if (s && s.item) return s; } catch (e) {}
    return null;
  }
  function info() {
    const s = getState();
    if (!s) return null;
    const item = s.item;
    const dur = (item.duration && item.duration.milliseconds) || s.duration || 0;
    const base = s.positionAsOfTimestamp || 0;
    const pos = s.isPaused ? base : base + (Date.now() - (s.timestamp || Date.now()));
    const isAd = !!(item.isAd || item.type === "ad" || (item.metadata && item.metadata["is_advertisement"] === "true"));
    return { uri: item.uri, dur, pos, paused: !!s.isPaused, isAd, repeat: s.repeat };
  }
  function getVol() {
    try { const v = Spicetify.Player.getVolume(); if (typeof v === "number" && !isNaN(v)) return v; } catch (e) {}
    try { const v = Spicetify.Platform.PlaybackAPI.getVolume(); if (typeof v === "number" && !isNaN(v)) return v; } catch (e) {}
    return null;
  }
  function setVol(v) {
    v = Math.max(0, Math.min(1, v));
    try { Spicetify.Player.setVolume(v); return; } catch (e) {}
    try { Spicetify.Platform.PlaybackAPI.setVolume(v); } catch (e) {}
  }
  function nextTrack() {
    try { Spicetify.Platform.PlayerAPI.skipToNext(); return; } catch (e) {}
    try { Spicetify.Player.next(); } catch (e) { console.error("[crossfade-tight] next impossible", e); }
  }
  function seekTo(ms) {
    try { Spicetify.Platform.PlayerAPI.seekTo(ms); return true; } catch (e) {}
    try { Spicetify.Player.seek(ms); return true; } catch (e) {}
    return false;
  }

  const CURVES = {
    smooth: (t) => t * t * (3 - 2 * t),
    linear: (t) => t,
    exp: (t) => t * t,
  };

  // =================== MENU DE RÉGLAGES ===================
  const FIELDS = [
    { key: "enabled", label: "Activer le crossfade", type: "check" },
    { key: "fadeOutMs", label: "Durée du fade-out", type: "range", min: 500, max: 10000, step: 100,
      fmt: (v) => (v / 1000).toFixed(1) + " s", help: "Temps avant la fin du morceau où le volume descend." },
    { key: "skipAt", label: "Lancer le morceau suivant à", type: "range", min: 30, max: 100, step: 5,
      fmt: (v) => v + " % du fade-out", help: "Plus bas = enchaînement plus serré (léger chevauchement). 100 = volume à zéro avant de changer." },
    { key: "fadeInMs", label: "Durée du fade-in", type: "range", min: 0, max: 10000, step: 100,
      fmt: (v) => (v / 1000).toFixed(1) + " s", help: "Temps de remontée du volume sur le morceau suivant." },
    { key: "floor", label: "Volume plancher", type: "range", min: 0, max: 50, step: 1,
      fmt: (v) => v + " %", help: "Volume minimum atteint pendant le fondu (0 = silence)." },
    { key: "curve", label: "Courbe du fondu", type: "select",
      options: [["smooth", "Douce (recommandée)"], ["linear", "Linéaire"], ["exp", "Exponentielle"]] },
    { key: "minTrackSec", label: "Ignorer les morceaux plus courts que", type: "range", min: 0, max: 120, step: 5,
      fmt: (v) => v + " s", help: "Pas de fondu sur les intros, jingles ou très courts titres." },
    { key: "logs", label: "Afficher les logs dans la console", type: "check" },
  ];

  function el(tag, style, text) {
    const e = document.createElement(tag);
    if (style) e.style.cssText = style;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  let overlay = null;
  function closeMenu() {
    if (overlay) { overlay.remove(); overlay = null; }
    document.removeEventListener("keydown", onKey, true);
  }
  function onKey(e) { if (e.key === "Escape") closeMenu(); }

  function openMenu() {
    if (overlay) { closeMenu(); return; }
    overlay = el("div", "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;");
    overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) closeMenu(); });

    const box = el("div", "background:#181818;color:#fff;width:480px;max-width:92vw;max-height:88vh;overflow:auto;border-radius:12px;padding:22px 24px;box-shadow:0 12px 48px rgba(0,0,0,.6);font-family:inherit;");
    box.appendChild(el("div", "font-size:20px;font-weight:700;margin-bottom:4px;", "Crossfade : réglages"));
    box.appendChild(el("div", "font-size:12px;color:#b3b3b3;margin-bottom:16px;", "Les changements sont appliqués et enregistrés immédiatement."));

    const refreshers = [];

    FIELDS.forEach((f) => {
      const row = el("div", "margin-bottom:14px;");
      const head = el("div", "display:flex;justify-content:space-between;align-items:center;gap:12px;");
      head.appendChild(el("label", "font-size:14px;font-weight:600;", f.label));
      const valueTxt = el("span", "font-size:13px;color:#1db954;font-variant-numeric:tabular-nums;");
      let input;

      if (f.type === "check") {
        input = el("input"); input.type = "checkbox";
        input.style.cssText = "width:18px;height:18px;accent-color:#1db954;cursor:pointer;";
        input.checked = !!cfg[f.key];
        input.addEventListener("change", () => { cfg[f.key] = input.checked; saveCfg(); });
        head.appendChild(input);
        refreshers.push(() => { input.checked = !!cfg[f.key]; });
        row.appendChild(head);
      } else if (f.type === "select") {
        input = el("select", "background:#2a2a2a;color:#fff;border:1px solid #444;border-radius:6px;padding:5px 8px;cursor:pointer;");
        f.options.forEach(([v, t]) => { const o = el("option", null, t); o.value = v; input.appendChild(o); });
        input.value = cfg[f.key];
        input.addEventListener("change", () => { cfg[f.key] = input.value; saveCfg(); });
        head.appendChild(input);
        refreshers.push(() => { input.value = cfg[f.key]; });
        row.appendChild(head);
      } else {
        head.appendChild(valueTxt);
        row.appendChild(head);
        input = el("input", "width:100%;margin-top:6px;accent-color:#1db954;cursor:pointer;");
        input.type = "range"; input.min = f.min; input.max = f.max; input.step = f.step;
        input.value = cfg[f.key];
        const upd = () => { valueTxt.textContent = f.fmt(Number(cfg[f.key])); };
        upd();
        input.addEventListener("input", () => { cfg[f.key] = Number(input.value); upd(); saveCfg(); });
        row.appendChild(input);
        refreshers.push(() => { input.value = cfg[f.key]; upd(); });
      }
      if (f.help) row.appendChild(el("div", "font-size:11px;color:#8a8a8a;margin-top:3px;", f.help));
      box.appendChild(row);
    });

    const btns = el("div", "display:flex;gap:10px;justify-content:flex-end;margin-top:20px;flex-wrap:wrap;");
    const mkBtn = (txt, primary, fn) => {
      const b = el("button", "border:none;border-radius:20px;padding:8px 18px;font-weight:700;cursor:pointer;font-size:13px;" +
        (primary ? "background:#1db954;color:#000;" : "background:#2a2a2a;color:#fff;"), txt);
      b.addEventListener("click", fn);
      return b;
    };
    const testMsg = el("div", "font-size:12px;color:#b3b3b3;margin-top:10px;text-align:right;min-height:16px;");
    btns.appendChild(mkBtn("Tester sur ce morceau", false, () => {
      const i = info();
      if (!i || !i.dur) { testMsg.textContent = "Aucun morceau en lecture."; return; }
      const target = Math.max(0, i.dur - cfg.fadeOutMs - 2500);
      testMsg.textContent = seekTo(target) ? "Saut à quelques secondes de la fin : écoute le fondu." : "Impossible de se déplacer : place la lecture à la main.";
    }));
    btns.appendChild(mkBtn("Réinitialiser", false, () => {
      cfg = Object.assign({}, DEFAULTS); saveCfg(); refreshers.forEach((r) => r());
    }));
    btns.appendChild(mkBtn("Fermer", true, closeMenu));
    box.appendChild(btns);
    box.appendChild(testMsg);
    box.appendChild(el("div", "margin-top:16px;padding-top:12px;border-top:1px solid #2a2a2a;text-align:center;font-size:12px;color:#8a8a8a;", "Made By Us3r. | If u Paid u get scam"));

    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKey, true);
  }

  function registerMenu() {
    window.crossfadeTightMenu = openMenu; // secours : tape crossfadeTightMenu() dans la console
    let ok = false;
    try {
      new Spicetify.Menu.Item("Crossfade : réglages", false, openMenu).register();
      ok = true;
    } catch (e) { console.warn("[crossfade-tight] Menu.Item indisponible", e); }
    try {
      new Spicetify.Topbar.Button("Crossfade : réglages", "shuffle", openMenu);
      ok = true;
    } catch (e) { console.warn("[crossfade-tight] Topbar.Button indisponible", e); }
    if (!ok) console.warn("[crossfade-tight] Aucun bouton enregistré : utilise crossfadeTightMenu() dans la console.");
  }

  // =================== MOTEUR ===================
  let tries = 0;
  function waitReady() {
    tries++;
    if (typeof Spicetify !== "undefined" && Spicetify.Platform && getVol() !== null && getState()) {
      console.log("[crossfade-tight] chargé (tentative " + tries + ") | Made By Us3r. | If u Paid u get scam");
      registerMenu();
      start();
    } else {
      if (tries % 10 === 0) console.log("[crossfade-tight] en attente de l'API... tentative " + tries + " (lance un morceau)");
      setTimeout(waitReady, 500);
    }
  }

  function start() {
    let baseVolume = getVol() || 0.5;
    let state = "idle"; // idle | out | in
    let timer = null;
    let lastUri = (info() || {}).uri;
    let lastLog = 0;

    const stopTimer = () => { if (timer) clearInterval(timer); timer = null; };

    function ramp(from, to, ms, done) {
      stopTimer();
      const ease = CURVES[cfg.curve] || CURVES.smooth;
      const startT = Date.now();
      if (ms <= 0) { setVol(to); done && done(); return; }
      timer = setInterval(() => {
        const t = Math.min(1, (Date.now() - startT) / ms);
        setVol(from + (to - from) * ease(t));
        if (t >= 1) { stopTimer(); done && done(); }
      }, TICK);
    }

    setInterval(() => {
      try {
        const i = info();
        if (!i) return;
        const floor = Math.max(0, Math.min(1, cfg.floor / 100));
        const tooShort = i.dur > 0 && i.dur < cfg.minTrackSec * 1000;

        // Crossfade désactivé : on restaure le volume si un fondu était en cours
        if (!cfg.enabled) {
          if (state !== "idle") { stopTimer(); setVol(baseVolume); state = "idle"; }
          lastUri = i.uri;
          return;
        }

        // Changement de morceau : fade-in
        if (i.uri !== lastUri) {
          lastUri = i.uri;
          stopTimer();
          if (i.isAd || tooShort) { setVol(baseVolume); state = "idle"; LOG(i.isAd ? "pub : volume restauré" : "morceau trop court : pas de fondu"); return; }
          LOG("nouveau morceau : fade-in");
          state = "in";
          setVol(floor);
          ramp(floor, baseVolume, cfg.fadeInMs, () => { state = "idle"; });
          return;
        }

        if (i.paused || i.isAd) return;
        if (state === "idle") baseVolume = getVol() ?? baseVolume;

        const remaining = i.dur - i.pos;
        if (cfg.logs && remaining < 6000 && remaining > 0 && Date.now() - lastLog > 1000) {
          lastLog = Date.now();
          LOG("reste " + Math.round(remaining) + " ms, état=" + state + ", repeat=" + i.repeat);
        }

        if (state === "idle" && !tooShort && i.dur > 0 && remaining <= cfg.fadeOutMs && remaining > 400) {
          if (i.repeat === 2 || i.repeat === "track") return; // répétition d'un seul morceau
          LOG("fade-out lancé");
          state = "out";
          ramp(baseVolume, floor, cfg.fadeOutMs * (cfg.skipAt / 100), () => {
            LOG("next()");
            nextTrack();
          });
        }
      } catch (e) {
        console.error("[crossfade-tight] erreur", e);
      }
    }, 100);
  }

  waitReady();
})();
