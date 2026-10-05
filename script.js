// Loads content.json and fills in every page. Edit content.json (via admin.html)
// instead of editing the HTML files directly.
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  (window.contentReady = fetch("content.json?_=" + Date.now()).then((r) => r.json()))
    .then((data) => {
      applyTheme(data.theme);
      applyPageStyle(data.pages);
      renderAbout(data.about);
      renderExperience(data.experience);
      renderProjects(data.projects);
      renderSkills(data.skills);
      renderContact(data.contact);
    })
    .catch((e) => console.warn("content.json not loaded:", e));

  function hex2rgb(h) { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function applyTheme(t) {
    if (!t) return;
    const r = document.documentElement.style;
    [["accent", "--accent"], ["accentDim", "--accent-dim"], ["bg", "--bg"], ["panel", "--panel"], ["paper", "--paper"], ["blue", "--blue"]].forEach(([k, v]) => { if (t[k]) r.setProperty(v, t[k]); });
    [["accent", "--accent-rgb"], ["blue", "--blue-rgb"], ["paper", "--paper-rgb"], ["bg", "--bg-rgb"]].forEach(([k, v]) => { if (t[k]) r.setProperty(v, hex2rgb(t[k]).join(",")); });
    if (t.accent) { const [R, G, B] = hex2rgb(t.accent); r.setProperty("--on-accent", 0.299 * R + 0.587 * G + 0.114 * B > 150 ? "#0a0a0a" : "#fff"); }
  }

  function applyPageStyle(pages) {
    if (!pages) return;
    const pageName = document.body.dataset.page;
    const cfg = pages[pageName];
    if (!cfg) return;
    const main = document.querySelector("main");
    if (!main) return;
    if (cfg.background) {
      main.style.backgroundImage =
        "linear-gradient(rgba(10,10,10,0.86), rgba(10,10,10,0.86)), url('assets/" + cfg.background + "')";
      main.style.backgroundSize = "cover";
      main.style.backgroundPosition = "center";
    }
    if (cfg.align === "center") {
      main.classList.add("align-center");
    }
  }

  function renderAbout(a) {
    if (!a) return;
    const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
    set("[data-bind='about.eyebrow']", a.eyebrow);
    set("[data-bind='about.nameLine1']", a.nameLine1);
    set("[data-bind='about.nameLine2']", a.nameLine2);
    set("[data-bind='about.role']", a.role);
    set("[data-bind='about.bodyP1']", a.bodyP1);
    set("[data-bind='about.bodyP2']", a.bodyP2);
    set("[data-bind='about.school']", a.school);
    set("[data-bind='about.degree']", a.degree);
    set("[data-bind='about.gpa']", a.gpa);

    const g1 = document.querySelector("[data-list='about.grid1']");
    if (g1 && a.grid1) g1.innerHTML = a.grid1.map(cellHtml).join("");
    const g2 = document.querySelector("[data-list='about.grid2']");
    if (g2 && a.grid2) g2.innerHTML = a.grid2.map(cellHtml).join("");

    const cw = document.querySelector("[data-list='about.coursework']");
    if (cw && a.coursework) cw.innerHTML = a.coursework.map((t) => `<span class="tag">${esc(t)}</span>`).join("");

    const ex = document.querySelector("[data-list='about.expertise']");
    if (ex && a.expertise) ex.innerHTML = a.expertise.map((s) => `<div class="fcf"><div class="fcf-head"><span class="sym">${esc(s.sym)}</span> ${esc(s.head)}</div><div class="fcf-body"><p class="fcf-text">${esc(s.text)}</p>${(s.tags||[]).map((t)=>`<span class="tag">${esc(t)}</span>`).join("")}</div></div>`).join("");
    const ed = document.querySelector("[data-list='about.education']");
    if (ed && a.education) renderExperience(a.education, ed);

    const bd = document.querySelector("[data-list='about.beyond']");
    if (bd && a.beyond) bd.innerHTML = a.beyond.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
    const tl = document.querySelector("[data-list='about.timeline']");
    if (tl && a.timeline) tl.innerHTML = a.timeline.map((t) => `<div class="htl-item"><span class="htl-dot"></span><div class="tl-date">${esc(t.date)}</div><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p><div class="tag-row">${(t.tags||[]).map((g)=>`<span class="tag">${esc(g)}</span>`).join("")}</div><div class="tl-links">${(t.links||[]).map((l)=>`<a href="${esc(l.h)}"${l.x?' target="_blank" rel="noopener"':''}>${esc(l.l)}</a>`).join("")}</div></div>`).join("");
    const st = document.querySelector("[data-list='about.statements']");
    if (st && a.statements) st.innerHTML = a.statements.map((x) => `<div class="fcf"><div class="fcf-head">${esc(x.head)}</div><div class="fcf-body"><p class="fcf-text">${esc(x.text)}</p></div></div>`).join("");
    const photoWrap = document.querySelector("[data-bind='about.photo']");
    if (photoWrap) {
      if (a.photo) { photoWrap.innerHTML = `<img src="assets/${esc(a.photo)}" alt="Photo of Liam Farhangi" class="about-photo">`; }
      else { photoWrap.innerHTML = ""; }
    }
  }

  function cellHtml(cell) {
    return `<div class="tb-cell"><span class="k">${esc(cell.k)}</span><span class="v${cell.accent ? " accent" : ""}">${esc(cell.v)}</span></div>`;
  }

  function renderExperience(list, target) {
    const container = target || document.querySelector("[data-list='experience']");
    if (!container || !list) return;
    let prev = null;
    container.innerHTML = list.map((xp, i) => { const hd = xp.group && xp.group !== prev ? `<div class="sheet-label grp"><span class="num">${esc(xp.group)}</span><span class="rule"></span></div>` : ""; prev = xp.group || prev; return hd + `
      <div class="xp-item acc${i === 0 ? " open" : ""}">
        <button class="acc-head" aria-expanded="${i === 0}"><div class="xp-meta"><div class="role">${esc(xp.role)}</div><div class="org">${esc(xp.org)}</div><div class="dates">${esc(xp.dates)}</div></div><span class="chev">+</span></button>
        <div class="acc-body"><div class="acc-inner"><div class="xp-body"><ul>${(xp.bullets || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div></div></div>
      </div>`; }).join("");
  }

  function renderProjects(list) {
    const container = document.querySelector("[data-list='projects']");
    if (!container || !list) return;
    container.innerHTML = list.map((p, i) => `
      <div class="proj-card acc${i < (matchMedia("(max-width: 760px)").matches ? 1 : 2) ? " open" : ""}">
        <button class="acc-head" aria-expanded="${i < (matchMedia("(max-width: 760px)").matches ? 1 : 2)}"><div class="ph"><div class="pnum">${String(i + 1).padStart(2, "0")}</div><div><div class="ptitle">${esc(p.title)}</div><div class="prole">${esc(p.role)}</div></div></div><span class="chev">+</span></button>
        <div class="acc-body"><div class="acc-inner"><div class="pb">
          ${p.image ? `<img src="assets/${esc(p.image)}" alt="${esc(p.title)}" class="proj-img">` : ""}
          ${(p.paragraphs || []).map((para) => `<p>${esc(para)}</p>`).join("")}
          ${p.stack ? `<div class="chips">${p.stack.split(" · ").map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
        </div></div></div>
      </div>`).join("");
  }

  function logo(t) { const r = (window.LOGO_RULES || []).find((x) => x[0].test(t)); if (!r) return ""; return window.LOGOS[r[1]] ? `<span class="lg">${window.LOGOS[r[1]]}</span>` : `<span class="lg"><img src="assets/logos/${r[1]}.png" alt="" onerror="this.parentNode.remove()"></span>`; }
  function renderSkills(list) {
    const container = document.querySelector("[data-list='skills']");
    if (!container || !list) return;
    container.innerHTML = list.map((s) => `
      <div class="fcf">
        <div class="fcf-head">${esc(s.head)}</div>
        <div class="fcf-body">${(s.tags || []).map((t) => `<span class="tag">${logo(t)}${esc(t)}</span>`).join("")}</div>
      </div>`).join("");
  }

  function renderContact(c) {
    if (!c) return;
    const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
    set("[data-bind='contact.lede']", c.lede);
    set("[data-bind='contact.email']", c.email);
    set("[data-bind='contact.phone']", c.phone);
    set("[data-bind='contact.linkedinLabel']", c.linkedinLabel);
    set("[data-bind='contact.location']", c.location);

    const emailA = document.querySelector("[data-href='contact.email']");
    if (emailA) emailA.href = "mailto:" + c.email;
    const phoneA = document.querySelector("[data-href='contact.phone']");
    if (phoneA) phoneA.href = "tel:" + c.phoneHref;
    const liA = document.querySelector("[data-href='contact.linkedin']");
    if (liA) liA.href = c.linkedinHref;

    if (c.resumeFile) document.querySelectorAll("[data-resume]").forEach((r) => { r.href = "assets/" + c.resumeFile; });
  }
  const single = () => matchMedia("(max-width: 760px)").matches;
  const setOpen = (a, on) => { if (a.classList.contains("open") !== on) { a.classList.toggle("open", on); a.querySelector(".acc-head").setAttribute("aria-expanded", on); } };
  const groupOf = (a) => { if (!a.classList.contains("proj-card") || single()) return [a]; const c = [...document.querySelectorAll(".proj-card")], i = c.indexOf(a); return [a, c[i % 2 ? i - 1 : i + 1]].filter(Boolean); };
  let ticking = false;
  let manualUntil = 0;
  const sync = () => {
    ticking = false;
    if (performance.now() < manualUntil) return;
    const accs = [...document.querySelectorAll(".acc")]; if (!accs.length) return;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 6) { const last = accs[accs.length - 1]; if (!last.classList.contains("open")) { const keep = groupOf(last); accs.forEach((x) => setOpen(x, keep.includes(x))); } return; }
    const y = innerHeight * 0.5; let best = null, bd = Infinity;
    for (const a of accs) { const r = a.getBoundingClientRect(), d = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0; if (d === 0 && a.classList.contains("open")) return; if (d < bd) { bd = d; best = a; } }
    let target = best; const cur = accs.findIndex((x) => x.classList.contains("open")), bi = accs.indexOf(best);
    if (cur >= 0) { const step = accs[0].classList.contains("proj-card") && !single() ? 2 : 1; if (Math.abs(bi - cur) > step) { target = accs[Math.max(0, Math.min(accs.length - 1, cur + (bi > cur ? step : -step)))]; setTimeout(queue, 380); } }
    const keep = groupOf(target); accs.forEach((x) => setOpen(x, keep.includes(x)));
  };
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } };
  document.addEventListener("click", (e) => { const hb = e.target.closest(".htl-btn"); if (hb) document.querySelector(".htl").scrollBy({ left: (hb.classList.contains("next") ? 1 : -1) * 340, behavior: "smooth" }); });
  document.addEventListener("click", (e) => {
    const h = e.target.closest(".acc-head"); if (!h) return;
    const a = h.closest(".acc"), opening = !a.classList.contains("open"); manualUntil = performance.now() + 3000;
    if (opening) { const keep = groupOf(a); document.querySelectorAll(".acc").forEach((x) => setOpen(x, keep.includes(x))); } else groupOf(a).forEach((x) => setOpen(x, false));
  });
  addEventListener("scroll", queue, { passive: true }); addEventListener("resize", queue);
  new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
})();
