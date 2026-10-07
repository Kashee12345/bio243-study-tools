/* BIOL 243 Study Tools - shared site kit
   Top navigation bar, accessibility controls (pause animations, reduce motion,
   read aloud, describe this step) and contrast fixes, shared by every page.
   Dr. Akash Garg - CC BY-NC-SA 4.0 */
(function () {
  "use strict";
  if (window.__gkLoaded) return;
  window.__gkLoaded = true;

  /* ---------- page registry ---------- */
  var CH = [
    ["1", "Introduction to the human body", [["Body-Basics-Walkthrough.html", "Walkthrough"], ["Body-Basics-Lab.html", "Lab"]]],
    ["2", "The chemical level of organization", [["Body-Chemistry-Walkthrough.html", "Walkthrough"], ["Body-Chemistry-Lab.html", "Lab"]]],
    ["3", "The cellular level of organization", [["Cell-Walkthrough.html", "Walkthrough"], ["Cell-Lab.html", "Lab"]]],
    ["4", "The tissue level of organization", [["Tissues-Walkthrough.html", "Walkthrough"], ["Tissues-Lab.html", "Lab"]]],
    ["5", "The integumentary system", [["Skin-Layers-Walkthrough.html", "Walkthrough"], ["Burn-Triage.html", "Burn Triage"]]],
    ["6", "Bone tissue", [["Bone-Formation-Walkthrough.html", "Walkthrough"], ["Bone-Builder-Game.html", "Bone Builder"], ["Calcium-Balance-Sim.html", "Calcium Sim"]]],
    ["7–8", "The skeleton", [["Skeleton-Walkthrough.html", "Walkthrough"], ["Skeleton-Lab.html", "Lab"]]],
    ["9", "Joints", [["Joints-Walkthrough.html", "Walkthrough"], ["Joints-Lab.html", "Lab"]]],
    ["10", "Muscle tissue", [["Contraction-Walkthrough.html", "Walkthrough"], ["Contraction-Chain-Game.html", "Contraction Chain"], ["Muscle-Tension-Sim.html", "Tension Sim"]]],
    ["11", "The muscular system", [["Muscular-System-Walkthrough.html", "Walkthrough"], ["Muscle-System-Lab.html", "Lab"]]],
    ["12", "Nervous tissue", [["Action-Potential-Walkthrough.html", "Walkthrough"], ["Neuron-Lab.html", "Lab"]]],
    ["13", "Anatomy of the nervous system", [["Nervous-System-Anatomy-Walkthrough.html", "Walkthrough"], ["Nervous-System-Anatomy-Lab.html", "Lab"]]],
    ["14", "The somatic nervous system", [["Senses-and-Reflexes-Walkthrough.html", "Walkthrough"], ["Senses-and-Reflexes-Lab.html", "Lab"]]],
    ["15", "The autonomic nervous system", [["Autonomic-Walkthrough.html", "Walkthrough"], ["Autonomic-Lab.html", "Lab"]]],
    ["16", "The neurological exam", [["Neuro-Exam-Walkthrough.html", "Walkthrough"], ["Neuro-Exam-Lab.html", "Lab"]]],
    ["17", "The endocrine system", [["Endocrine-Walkthrough.html", "Walkthrough"], ["Endocrine-Lab.html", "Lab"]]],
    ["18", "Blood", [["Blood-Walkthrough.html", "Walkthrough"], ["Blood-Lab.html", "Lab"]]],
    ["19", "The heart", [["Heart-Walkthrough.html", "Walkthrough"], ["Heart-Lab.html", "Lab"]]],
    ["20", "Blood vessels and circulation", [["Blood-Vessels-Walkthrough.html", "Walkthrough"], ["Blood-Vessels-Lab.html", "Lab"]]],
    ["21", "The lymphatic and immune system", [["Immune-Walkthrough.html", "Walkthrough"], ["Immune-Lab.html", "Lab"]]],
    ["22", "The respiratory system", [["Respiratory-Walkthrough.html", "Walkthrough"], ["Respiratory-Lab.html", "Lab"]]],
    ["23", "The digestive system", [["Digestion-Walkthrough.html", "Walkthrough"], ["Digestion-Lab.html", "Lab"]]],
    ["24", "Metabolism and nutrition", [["Metabolism-Walkthrough.html", "Walkthrough"], ["Metabolism-Lab.html", "Lab"]]],
    ["25", "The urinary system", [["Urinary-Walkthrough.html", "Walkthrough"], ["Urinary-Lab.html", "Lab"]]],
    ["26", "Fluid, electrolyte and acid–base balance", [["Fluid-AcidBase-Walkthrough.html", "Walkthrough"], ["Fluid-AcidBase-Lab.html", "Lab"]]],
    ["27", "The reproductive system", [["Reproductive-Walkthrough.html", "Walkthrough"], ["Reproductive-Lab.html", "Lab"]]],
    ["28", "Development and inheritance", [["Development-Walkthrough.html", "Walkthrough"], ["Development-Lab.html", "Lab"]]]
  ];
  var file = decodeURIComponent((location.pathname.split("/").pop() || "index.html"));
  var chIdx = -1;
  CH.forEach(function (c, i) { c[2].forEach(function (p) { if (p[0] === file) chIdx = i; }); });

  var store = {
    get: function (k) { try { return localStorage.getItem("gk-" + k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem("gk-" + k, v); } catch (e) {} }
  };

  /* ---------- animation clock (pause / slow motion for every canvas) ---------- */
  var realNow = performance.now.bind(performance);
  var rate = 1, base = realNow(), vbase = base;
  function vnow() { return vbase + (realNow() - base) * rate; }
  function setRate(r) { var v = vnow(); base = realNow(); vbase = v; rate = r; }
  try { performance.now = vnow; } catch (e) {}
  var realRAF = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function (cb) { return realRAF(function () { cb(vnow()); }); };

  var reduceMQ = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : null;
  var savedReduce = store.get("reduce");
  var state = {
    reduce: savedReduce === null ? !!(reduceMQ && reduceMQ.matches) : savedReduce === "1",
    paused: false,
    speaking: false,
    descOpen: store.get("desc") === "1"
  };
  // People who ask their device for reduced motion start with animations paused.
  if (state.reduce && savedReduce === null) state.paused = true;
  function applyClock() { setRate(state.paused ? 0 : (state.reduce ? 0.35 : 1)); }
  applyClock();

  /* ---------- describe-this-step API (pages call window.gkDescribe(text)) ---------- */
  var descText = "";
  window.gkDescribe = function (t) { descText = String(t || ""); updateDesc(); };

  /* ---------- styles ---------- */
  var CSS = [
    ":root{--gk-bg:#0F2D38;--gk-ink:#F2F6F8;--gk-soft:#BFD3DB;--gk-btn:#1C4554;--gk-btn-h:#25596B;--gk-on:#F2B33B;--gk-on-ink:#10161A}",
    ".gk-bar{background:var(--gk-bg);color:var(--gk-ink);font:500 14px/1.35 'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif;position:relative;z-index:50}",
    ".gk-in{max-width:1240px;margin:0 auto;padding:8px 16px;display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px}",
    ".gk-bar a{color:var(--gk-ink);text-decoration:none}",
    ".gk-bar a:hover,.gk-bar a:focus-visible{text-decoration:underline}",
    ".gk-home{font-weight:600;white-space:nowrap}",
    ".gk-ch{display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1 1 300px;min-width:0}",
    ".gk-chname{color:var(--gk-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}",
    ".gk-pill{border:1px solid #3B6E80;border-radius:99px;padding:2px 10px;font-size:13px;white-space:nowrap}",
    ".gk-pill[aria-current=page]{background:var(--gk-on);color:var(--gk-on-ink)!important;border-color:var(--gk-on);font-weight:600}",
    ".gk-pn{display:flex;gap:8px;white-space:nowrap}",
    ".gk-pn a{border:1px solid #3B6E80;border-radius:6px;padding:3px 9px;font-size:13px}",
    ".gk-tools{max-width:1240px;margin:0 auto;padding:0 16px 8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}",
    ".gk-tools button{font:600 13px/1 'IBM Plex Sans',system-ui,sans-serif;color:var(--gk-ink);background:var(--gk-btn);border:1px solid #3B6E80;border-radius:6px;padding:7px 10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}",
    ".gk-tools button:hover{background:var(--gk-btn-h)}",
    ".gk-tools button[aria-pressed=true]{background:var(--gk-on);color:var(--gk-on-ink);border-color:var(--gk-on)}",
    ".gk-tools svg{width:15px;height:15px;flex:0 0 auto}",
    ".gk-note{font-size:12.5px;color:var(--gk-soft)}",
    ".gk-bar :focus-visible,.gk-desc :focus-visible{outline:3px solid var(--gk-on);outline-offset:2px}",
    ".gk-desc{margin:8px 0 0;padding:10px 12px;border-left:4px solid #1B6E88;border-radius:4px;background:#E8F1F5;color:#10161A;font:400 15px/1.5 'IBM Plex Sans',system-ui,sans-serif}",
    ".gk-desc b{display:block;font:600 12px/1.4 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.05em;text-transform:uppercase;color:#0E4356;margin-bottom:2px}",
    "@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .gk-desc{background:#15323D;color:#E8EEF1}:root:not([data-theme=light]) .gk-desc b{color:#A9DDEC}}",
    ":root[data-theme=dark] .gk-desc{background:#15323D;color:#E8EEF1}:root[data-theme=dark] .gk-desc b{color:#A9DDEC}",
    "html.gk-reduce *,html.gk-reduce *::before,html.gk-reduce *::after{transition-duration:0s!important;animation-duration:0s!important;animation-iteration-count:1!important;scroll-behavior:auto!important}",
    ".gk-skip{position:absolute;left:-9999px;top:0;background:#F2B33B;color:#10161A;padding:8px 12px;z-index:100;font-weight:600}",
    ".gk-skip:focus{left:8px;top:8px}",
    ".gk-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
    /* contrast fixes for shared tokens (WCAG 2.1 AA) */
    ":root{--ink-faint:#566570}",
    "@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--ink-faint:#8D9EA7}}",
    ":root[data-theme=dark]{--ink-faint:#8D9EA7}",
    ".gk-oninv{color:#0B1A20!important}",
    "@media (max-width:640px){.gk-chname{display:none}.gk-tools button span.gk-lbl{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.gk-tools button{padding:8px}}"
  ].join("\n");

  var ICON = {
    pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>',
    slow: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 12c2-6 10-6 12 0" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="8" cy="8.5" r="1.6" fill="currentColor"/></svg>',
    speak: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/><path d="M11 5.5c1 .8 1 4.2 0 5M12.8 3.8c2 1.8 2 6.6 0 8.4" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
    desc: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M4.5 6h7M4.5 8.5h7M4.5 11h4.5" stroke="currentColor" stroke-width="1.4"/></svg>'
  };

  function h(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }

  var ui = {};
  function build() {
    var st = h("style", { id: "gk-style" }, CSS);
    document.head.appendChild(st);
    if (state.reduce) document.documentElement.classList.add("gk-reduce");
    if (!document.documentElement.getAttribute("lang")) document.documentElement.setAttribute("lang", "en");

    var isIndex = file === "index.html" || file === "";
    if (isIndex) return;

    // skip link
    var main = document.querySelector("main, .wrap, .grid") || document.body.children[1];
    if (main && !main.id) main.id = "gk-main";
    if (main) document.body.insertBefore(h("a", { "class": "gk-skip", href: "#" + main.id }, "Skip to content"), document.body.firstChild);

    var bar = h("nav", { "class": "gk-bar", "aria-label": "Site navigation and accessibility tools" });
    var row = h("div", { "class": "gk-in" });
    row.appendChild(h("a", { "class": "gk-home", href: "index.html" }, "&larr; All chapters"));
    var chBox = h("div", { "class": "gk-ch" });
    if (chIdx >= 0) {
      var c = CH[chIdx];
      chBox.appendChild(h("span", { "class": "gk-chname" }, "Ch " + c[0] + " &middot; " + c[1]));
      c[2].forEach(function (p) {
        var a = h("a", { "class": "gk-pill", href: p[0] }, p[1]);
        if (p[0] === file) a.setAttribute("aria-current", "page");
        chBox.appendChild(a);
      });
    }
    row.appendChild(chBox);
    var pn = h("div", { "class": "gk-pn" });
    if (chIdx > 0) { var pc = CH[chIdx - 1]; pn.appendChild(h("a", { href: pc[2][0][0] }, "&lsaquo; Ch " + pc[0] + '<span class="gk-sr"> (previous chapter: ' + pc[1] + ")</span>")); }
    if (chIdx >= 0 && chIdx < CH.length - 1) { var nc = CH[chIdx + 1]; pn.appendChild(h("a", { href: nc[2][0][0] }, "Ch " + nc[0] + '<span class="gk-sr"> (next chapter: ' + nc[1] + ")</span> &rsaquo;")); }
    row.appendChild(pn);
    bar.appendChild(row);

    var tools = h("div", { "class": "gk-tools", role: "toolbar", "aria-label": "Accessibility tools" });
    ui.pause = h("button", { type: "button", "aria-pressed": "false" });
    ui.reduce = h("button", { type: "button", "aria-pressed": "false" }, ICON.slow + '<span class="gk-lbl">Reduce motion</span>');
    ui.speak = h("button", { type: "button", "aria-pressed": "false" });
    tools.appendChild(ui.pause); tools.appendChild(ui.reduce);
    if ("speechSynthesis" in window) tools.appendChild(ui.speak);
    if (document.querySelector("canvas")) {
      ui.desc = h("button", { type: "button", "aria-pressed": "false", "aria-controls": "gk-desc" }, ICON.desc + '<span class="gk-lbl">Describe the picture</span>');
      tools.appendChild(ui.desc);
    }
    ui.note = h("span", { "class": "gk-note", role: "status", "aria-live": "polite" });
    tools.appendChild(ui.note);
    bar.appendChild(tools);
    document.body.insertBefore(bar, document.body.firstChild.nextSibling);

    ui.pause.addEventListener("click", function () { state.paused = !state.paused; applyClock(); paint(); say(state.paused ? "Animations paused." : "Animations playing."); });
    ui.reduce.addEventListener("click", function () {
      state.reduce = !state.reduce; store.set("reduce", state.reduce ? "1" : "0");
      document.documentElement.classList.toggle("gk-reduce", state.reduce); applyClock(); paint();
      say(state.reduce ? "Reduced motion on: animations run slowly." : "Reduced motion off.");
    });
    ui.speak.addEventListener("click", toggleSpeak);
    if (ui.desc) ui.desc.addEventListener("click", function () { state.descOpen = !state.descOpen; store.set("desc", state.descOpen ? "1" : "0"); updateDesc(); paint(); });

    // description panel under the first (main) canvas
    var cv = document.querySelector("canvas");
    if (cv) {
      var holder = cv.closest(".canvas-holder, .stage, .card") || cv.parentElement;
      var anchor = cv.closest(".canvas-holder") || cv;
      ui.descBox = h("div", { "class": "gk-desc", id: "gk-desc", "aria-live": "polite", hidden: "" });
      anchor.parentNode.insertBefore(ui.descBox, anchor.nextSibling);
    }
    paint();
    if (state.paused) say("Animations are paused because your device asks for reduced motion. Press Play to watch them.");

    // keep description and speech in step with the page
    var title = document.getElementById("title");
    if (title) new MutationObserver(function () { stopSpeak(); setTimeout(updateDesc, 30); }).observe(title, { childList: true, characterData: true, subtree: true });
    var cap = document.getElementById("caption");
    if (cap) new MutationObserver(function () { setTimeout(updateDesc, 30); }).observe(cap, { childList: true, characterData: true, subtree: true });
    updateDesc();
  }

  function paint() {
    if (!ui.pause) return;
    ui.pause.innerHTML = state.paused ? ICON.play + '<span class="gk-lbl">Play animations</span>' : ICON.pause + '<span class="gk-lbl">Pause animations</span>';
    ui.pause.setAttribute("aria-pressed", state.paused ? "true" : "false");
    ui.reduce.setAttribute("aria-pressed", state.reduce ? "true" : "false");
    ui.speak.innerHTML = ICON.speak + '<span class="gk-lbl">' + (state.speaking ? "Stop reading" : "Read aloud") + "</span>";
    ui.speak.setAttribute("aria-pressed", state.speaking ? "true" : "false");
    if (ui.desc) ui.desc.setAttribute("aria-pressed", state.descOpen ? "true" : "false");
  }
  var sayT;
  function say(t) { if (!ui.note) return; ui.note.textContent = t; clearTimeout(sayT); sayT = setTimeout(function () { ui.note.textContent = ""; }, 6000); }

  function currentDescription() {
    if (descText) return descText;
    var cap = document.getElementById("caption");
    var cv = document.querySelector("canvas");
    var parts = [];
    if (cap && cap.textContent.trim()) parts.push(cap.textContent.trim());
    else if (cv && cv.getAttribute("aria-label")) parts.push(cv.getAttribute("aria-label").replace(/^Animation:\s*/, ""));
    var leg = document.getElementById("legend");
    if (leg && leg.textContent.trim()) {
      var items = Array.prototype.map.call(leg.querySelectorAll("span"), function (s) { return s.textContent.trim(); }).filter(Boolean);
      if (items.length) parts.push("Colour key: " + items.join(", ") + ".");
    }
    return parts.join(" ");
  }
  function updateDesc() {
    if (!ui.descBox) return;
    var t = currentDescription();
    ui.descBox.innerHTML = "<b>What the picture shows</b>" + escapeHtml(t || "This picture changes as you use the controls. Read the text beside it for what it shows.");
    if (state.descOpen) ui.descBox.removeAttribute("hidden"); else ui.descBox.setAttribute("hidden", "");
    var cv = document.querySelector("canvas");
    if (cv) { cv.setAttribute("aria-describedby", "gk-desc"); }
  }
  function escapeHtml(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- read aloud ---------- */
  function visible(el) { return !!(el && el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden"); }
  function textToRead() {
    var sel = window.getSelection && String(window.getSelection()).trim();
    if (sel && sel.length > 1) return sel;
    var t = document.getElementById("title"), b = document.getElementById("body");
    if (t && b && visible(t)) {
      var parts = [t.textContent, b.innerText];
      var an = document.getElementById("analogy"); if (an && visible(an)) parts.push(an.innerText);
      var d = currentDescription(); if (d) parts.push("What the picture shows. " + d);
      return parts.join(". \n");
    }
    // labs: read the visible instructions in the open tab
    var scope = Array.prototype.find.call(document.querySelectorAll('[role=tabpanel], section'), function (s) { return visible(s) && !s.closest(".gk-bar"); }) || document.querySelector("main, .wrap") || document.body;
    var nodes = scope.querySelectorAll("h1,h2,h3,.instr,.bigidea,.big,.q,.qlab,.stmt,.sc-title,.sc-desc,p,li");
    var out = [], n = 0;
    Array.prototype.forEach.call(nodes, function (el) {
      if (n > 1600 || !visible(el) || el.closest(".gk-bar") || el.closest("footer")) return;
      if (el.parentElement && el.parentElement.closest("p,li") ) return;
      var s = el.innerText.trim(); if (!s) return; out.push(s); n += s.length;
    });
    return out.join(". \n") || "Select any text on the page, then press Read aloud.";
  }
  function toggleSpeak() { if (state.speaking) { stopSpeak(); return; } startSpeak(); }
  function startSpeak() {
    var synth = window.speechSynthesis; synth.cancel();
    var text = textToRead().replace(/\s+/g, " ").replace(/[⁺]/g, " plus").replace(/[⁻]/g, " minus").replace(/₂/g, " 2").replace(/₃/g, " 3");
    var chunks = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
    state.speaking = true; paint();
    var i = 0;
    (function next() {
      if (!state.speaking || i >= chunks.length) { state.speaking = false; paint(); return; }
      var u = new SpeechSynthesisUtterance(chunks[i++]); u.rate = 0.95; u.lang = "en-US";
      u.onend = next; u.onerror = function () { state.speaking = false; paint(); };
      synth.speak(u);
    })();
  }
  function stopSpeak() { if (!state.speaking) return; state.speaking = false; try { window.speechSynthesis.cancel(); } catch (e) {} paint(); }

  /* ---------- contrast fixer: white text on the light dark-mode accent ---------- */
  function isDark() { return getComputedStyle(document.documentElement).getPropertyValue("--ground").trim().toLowerCase() === "#0e1519"; }
  function lum(rgb) { var m = rgb.match(/[\d.]+/g); if (!m) return null; var c = m.slice(0, 3).map(function (v) { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  var fixT = null, bodyObs = null;
  function fixContrast() {
    if (fixT) return;
    fixT = setTimeout(function () {
      fixT = null;
      var dark = isDark();
      // clear previous marks first so elements that changed state are re-evaluated
      document.querySelectorAll(".gk-oninv").forEach(function (el) { el.classList.remove("gk-oninv"); });
      if (!dark) { if (bodyObs) bodyObs.takeRecords(); return; }
      var els = document.querySelectorAll("button, a, span, b, strong, label, div, i, em, small, td, th, li, p");
      for (var k = 0; k < els.length; k++) {
        var el = els[k];
        if (el.closest(".gk-bar")) continue;
        var cs = getComputedStyle(el);
        if (cs.color.replace(/\s/g, "") !== "rgb(255,255,255)") continue;
        var bg = cs.backgroundColor; if (!bg || bg === "transparent" || /rgba\(.*,\s*0\)$/.test(bg)) { continue; }
        var L = lum(bg); if (L !== null && L > 0.22) el.classList.add("gk-oninv");
      }
      if (bodyObs) bodyObs.takeRecords(); // ignore the class changes we just made
    }, 120);
  }

  function init() {
    build();
    fixContrast();
    new MutationObserver(fixContrast).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    bodyObs = new MutationObserver(function (m) {
      for (var i = 0; i < m.length; i++) {
        var r = m[i];
        if (r.target.closest && r.target.closest(".gk-bar")) continue;
        if (r.type === "attributes") { fixContrast(); return; }
        for (var j = 0; j < r.addedNodes.length; j++) { if (r.addedNodes[j].nodeType === 1) { fixContrast(); return; } }
      }
    });
    bodyObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-selected", "aria-pressed"] });
    if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fixContrast);
    window.addEventListener("pagehide", stopSpeak);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
