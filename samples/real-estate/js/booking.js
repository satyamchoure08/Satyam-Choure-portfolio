/* ============================================================
   KOHINOOR ESTATES — 4-step site-visit scheduler.
   States: idle → loading → success | error. Demo mode stores the
   request on-device only and says so honestly in the UI.
   ============================================================ */
(function () {
  "use strict";
  function init() {
    var KE = window.KE, DATA = window.KE_DATA, CFG = KE.cfg;
    var root = KE.$("#booking"); if (!root) return;

    var pre = root.getAttribute("data-property") || "";
    var S = { step: 1, property: pre, date: null, slot: null, name: "", phone: "", email: "", msg: "", purpose: "buy" };

    var DAYS = (function () {
      var out = [], d = new Date();
      for (var i = 1; i <= 14; i++) {
        var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
        out.push(x);
      }
      return out;
    })();
    var SLOTS = ["10:00", "11:30", "14:00", "16:00", "17:30"];

    function fmtDay(d) {
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    }

    function panel1() {
      return '<fieldset style="border:0;padding:0;margin:0" class="bk-panel on">' +
        '<legend class="micro" style="margin-bottom:12px">01 — Which home?</legend>' +
        '<div class="field"><label for="bk-prop">Property</label>' +
        '<div class="select"><select id="bk-prop">' +
        '<option value="">Help me choose</option>' +
        DATA.properties.map(function (p) {
          return '<option value="' + p.id + '"' + (S.property === p.id ? " selected" : "") + ">" + p.name + " — " + p.area + "</option>";
        }).join("") +
        "</select></div></div>" +
        '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
        ["buy", "sell", "invest", "rent"].map(function (v) {
          return '<button type="button" class="chip" data-purpose="' + v + '" aria-pressed="' + (S.purpose === v) + '">' +
            (v === "buy" ? "I'm buying" : v === "sell" ? "I'm selling" : v === "invest" ? "Investing" : "Renting") + "</button>";
        }).join("") + "</div>" +
        '<div><button type="button" class="btn btn-ink" data-bk-next>' + "Next →" + "</button></div>" +
        "</fieldset>";
    }
    function panel2() {
      return '<fieldset style="border:0;padding:0;margin:0" class="bk-panel on">' +
        '<legend class="micro" style="margin-bottom:12px">02 — Pick a day & slot</legend>' +
        '<div class="days" role="group" aria-label="Choose a date">' +
        DAYS.map(function (d, i) {
          var sun = d.getDay() === 0;
          return '<button type="button" class="day" data-day="' + i + '" aria-pressed="' + (S.date === i) + '"' + (sun ? ' title="Sunday — by appointment only" disabled' : "") + ">" +
            '<span class="m">' + d.toLocaleDateString("en-IN", { weekday: "short" }) + "</span>" +
            '<span class="d">' + d.getDate() + "</span>" +
            '<span class="m">' + d.toLocaleDateString("en-IN", { month: "short" }) + "</span></button>";
        }).join("") + "</div>" +
        '<div class="slots" role="group" aria-label="Choose a time slot">' +
        SLOTS.map(function (s) {
          return '<button type="button" class="slot" data-slot="' + s + '" aria-pressed="' + (S.slot === s) + '"' + (S.date === null ? " disabled" : "") + ">" + s + "</button>";
        }).join("") + "</div>" +
        '<div style="display:flex;gap:10px"><button type="button" class="btn btn-ghost" data-bk-back>← Back</button>' +
        '<button type="button" class="btn btn-ink" data-bk-next>Next →</button></div>' +
        "</fieldset>";
    }
    function panel3() {
      return '<fieldset style="border:0;padding:0;margin:0" class="bk-panel on">' +
        '<legend class="micro" style="margin-bottom:12px">03 — Your details</legend>' +
        '<div class="field" id="f-name"><label for="bk-name" data-i18n="form.name">Your name</label>' +
        '<input id="bk-name" type="text" autocomplete="name" value="' + S.name + '"><span class="err" role="alert"></span></div>' +
        '<div class="field" id="f-phone"><label for="bk-phone" data-i18n="form.phone">Mobile number</label>' +
        '<input id="bk-phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="10-digit mobile" value="' + S.phone + '"><span class="err" role="alert"></span></div>' +
        '<div class="field" id="f-email"><label for="bk-email" data-i18n="form.email">Email (optional)</label>' +
        '<input id="bk-email" type="email" autocomplete="email" value="' + S.email + '"><span class="err" role="alert"></span></div>' +
        '<div class="field"><label for="bk-msg" data-i18n="form.msg">Anything we should know?</label>' +
        '<textarea id="bk-msg">' + S.msg + "</textarea></div>" +
        '<div style="display:flex;gap:10px"><button type="button" class="btn btn-ghost" data-bk-back>← Back</button>' +
        '<button type="button" class="btn btn-ink" data-bk-next>Review →</button></div>' +
        "</fieldset>";
    }
    function panel4() {
      var p = DATA.properties.filter(function (x) { return x.id === S.property; })[0];
      var when = S.date !== null ? DAYS[S.date].toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) : "—";
      return '<fieldset style="border:0;padding:0;margin:0" class="bk-panel on">' +
        '<legend class="micro" style="margin-bottom:12px">04 — Review</legend>' +
        '<div class="calc-rows" style="color:var(--ink)">' +
        "<div><span>Home</span><strong>" + (p ? p.name : "Help me choose") + "</strong></div>" +
        "<div><span>Day</span><strong>" + when + "</strong></div>" +
        "<div><span>Slot</span><strong>" + (S.slot || "—") + " IST</strong></div>" +
        "<div><span>Purpose</span><strong>" + S.purpose + "</strong></div>" +
        "<div><span>Name</span><strong>" + S.name + "</strong></div>" +
        "<div><span>Mobile</span><strong>" + S.phone + "</strong></div>" +
        "</div>" +
        '<p class="micro">Demo mode: this request is stored on this device only — nothing leaves your browser until a CRM endpoint is connected [PLACEHOLDER].</p>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn btn-ghost" data-bk-back>← Back</button>' +
        '<button type="button" class="btn btn-primary" data-bk-submit data-mag><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 7"/></svg> Confirm visit</button>' +
        '<a class="btn btn-ghost" id="bk-wa" target="_blank" rel="noopener" href="#">or send on WhatsApp</a></div>' +
        "</fieldset>";
    }

    function render() {
      KE.$$(".step-dot", root).forEach(function (d, i) { d.classList.toggle("on", i < S.step); });
      var body = KE.$("#bk-body", root);
      body.innerHTML = S.step === 1 ? panel1() : S.step === 2 ? panel2() : S.step === 3 ? panel3() : panel4();
      if (S.step === 4) {
        var p = DATA.properties.filter(function (x) { return x.id === S.property; })[0];
        KE.$("#bk-wa", root).href = KE.waLink("Hi! I'd like a site visit — " + (p ? p.name : "help me choose") + ", on " +
          (S.date !== null ? DAYS[S.date].toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—") +
          " at " + (S.slot || "—") + ". I'm " + S.name + " (" + S.phone + ").");
      }
    }

    function validate3() {
      var ok = true;
      var setErr = function (id, msg) {
        var f = KE.$(id, root); if (!f) return;
        f.classList.toggle("invalid", !!msg);
        f.querySelector(".err").textContent = msg || "";
      };
      S.name = KE.$("#bk-name", root).value.trim();
      S.phone = KE.$("#bk-phone", root).value.replace(/\D/g, "").slice(-10);
      S.email = KE.$("#bk-email", root).value.trim();
      S.msg = KE.$("#bk-msg", root).value.trim();
      if (S.name.length < 2) { setErr("#f-name", "Please tell us your name."); ok = false; } else setErr("#f-name", "");
      if (!/^[6-9]\d{9}$/.test(S.phone)) { setErr("#f-phone", "Enter a valid 10-digit Indian mobile."); ok = false; } else setErr("#f-phone", "");
      if (S.email && !/^\S+@\S+\.\S+$/.test(S.email)) { setErr("#f-email", "That email doesn't look right."); ok = false; } else setErr("#f-email", "");
      return ok;
    }

    function submit() {
      var body = KE.$("#bk-body", root);
      body.innerHTML = '<div class="form-state" role="status"><div class="spinner" aria-hidden="true"></div><p class="micro">Holding your slot…</p></div>';
      var finish = function (ok) {
        if (ok) {
          var ref = "KE-" + Math.floor(1000 + Math.random() * 9000);
          try {
            var log = JSON.parse(localStorage.getItem("ke-visits") || "[]");
            log.push({ ref: ref, s: S, at: new Date().toISOString() });
            localStorage.setItem("ke-visits", JSON.stringify(log));
          } catch (e) {}
          body.innerHTML = '<div class="form-state" role="status">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M7 12.5l3.5 3.5L17 9"/></svg>' +
            '<h3 style="margin:0">Slot held — ' + ref + "</h3>" +
            '<p class="micro">We confirm on WhatsApp within working hours (' + CFG.hours + ").</p>" +
            '<a class="btn btn-primary" target="_blank" rel="noopener" href="' + KE.waLink("Hi! I just booked visit " + ref + " (" + (S.slot || "") + "). Sharing my details here too.") + '">Open WhatsApp to fast-track</a>' +
            '<button type="button" class="btn btn-ghost" data-bk-reset>Book another</button></div>';
          KE.toast("Visit request " + ref + " saved.");
        } else {
          body.innerHTML = '<div class="form-state" role="alert">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 16.5v.5"/></svg>' +
            '<h3 style="margin:0">Couldn\'t send</h3><p class="micro">Network hiccup — retry, or send it on WhatsApp instead.</p>' +
            '<div style="display:flex;gap:10px"><button type="button" class="btn btn-ink" data-bk-retry>Retry</button>' +
            '<a class="btn btn-ghost" target="_blank" rel="noopener" href="' + KE.waLink("Hi! Booking a site visit: " + S.name + " " + S.phone) + '">WhatsApp us</a></div></div>';
        }
      };
      if (CFG.formEndpoint) {
        fetch(CFG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(S) })
          .then(function (r) { finish(r.ok); })
          .catch(function () { finish(false); });
      } else {
        setTimeout(function () { finish(navigator.onLine !== false); }, 900);
      }
    }

    root.addEventListener("click", function (e) {
      var t = e.target;
      var pp = t.closest ? t.closest("[data-purpose]") : null;
      if (pp) { S.purpose = pp.getAttribute("data-purpose"); render(); return; }
      var dy = t.closest ? t.closest("[data-day]") : null;
      if (dy) { S.date = parseInt(dy.getAttribute("data-day"), 10); S.slot = null; render(); return; }
      var sl = t.closest ? t.closest("[data-slot]") : null;
      if (sl) { S.slot = sl.getAttribute("data-slot"); render(); return; }
      if (t.closest ? t.closest("[data-bk-next]") : null) {
        if (S.step === 1) { var sel = KE.$("#bk-prop", root); if (sel) S.property = sel.value; }
        if (S.step === 2 && (S.date === null || !S.slot)) { KE.toast("Pick a day and a time slot first."); return; }
        if (S.step === 3 && !validate3()) return;
        S.step = Math.min(4, S.step + 1); render(); return;
      }
      if (t.closest ? t.closest("[data-bk-back]") : null) { S.step = Math.max(1, S.step - 1); render(); return; }
      if (t.closest ? t.closest("[data-bk-submit]") : null) { submit(); return; }
      if (t.closest ? t.closest("[data-bk-retry]") : null) { submit(); return; }
      if (t.closest ? t.closest("[data-bk-reset]") : null) {
        S = { step: 1, property: pre, date: null, slot: null, name: "", phone: "", email: "", msg: "", purpose: "buy" };
        render(); return;
      }
    });

    render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
