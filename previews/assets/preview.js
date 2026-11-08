/* Shared behaviour for the client homepage previews.
   1. Header gets a line once the page scrolls.
   2. Process section: the big photo changes as each step comes into view.
   3. Enquiry form opens WhatsApp to the studio with the message already typed.
   4. Floating WhatsApp button on phones after the hero. */
(function () {
  "use strict";
  var head = document.querySelector(".site-head");
  var hero = document.querySelector(".hero");
  var fab = document.querySelector(".wa-float");

  function onScroll() {
    var y = window.scrollY || 0;
    if (head) head.classList.toggle("scrolled", y > 8);
    if (fab && hero) fab.classList.toggle("show", y > hero.offsetHeight * 0.8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var shots = Array.prototype.slice.call(document.querySelectorAll(".stage img"));
  function activate(i) {
    steps.forEach(function (s, n) { s.classList.toggle("on", n === i); });
    shots.forEach(function (s, n) { s.classList.toggle("on", n === i); });
  }
  if (steps.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) activate(steps.indexOf(e.target));
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (s) { io.observe(s); });
  }
  activate(0);

  var form = document.querySelector("form.enquiry");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var get = function (name) { var el = form.elements[name]; return el ? String(el.value || "").trim() : ""; };
      var err = form.querySelector(".form-error");
      var name = get("name");
      if (!name) {
        if (err) { err.hidden = false; err.textContent = "Add your name so the studio knows who is writing."; }
        form.elements.name.focus();
        return;
      }
      if (err) err.hidden = true;
      var lines = ["Hello " + form.getAttribute("data-studio") + ", I'm " + name + "."];
      if (get("area")) lines.push("Area: " + get("area"));
      if (get("space")) lines.push("Space: " + get("space"));
      if (get("budget")) lines.push("Budget: " + get("budget"));
      if (get("message")) lines.push(get("message"));
      lines.push("(Sent from your website)");
      var url = "https://wa.me/" + form.getAttribute("data-wa") + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  }
})();
