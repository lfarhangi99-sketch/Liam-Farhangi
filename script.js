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
      openFromHash();
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
    const imgs = cfg.backgrounds && cfg.backgrounds.length ? cfg.backgrounds : cfg.background ? [cfg.background] : [];
    if (imgs.length) {
      const show = document.createElement("div"); show.className = "bg-show";
      show.innerHTML = imgs.map((f, i) => `<img src="assets/${esc(f)}" alt=""${i ? ' loading="lazy"' : ""} class="${i ? "" : "on"}">`).join("");
      document.body.appendChild(show);
      if (imgs.length > 1) { let k = 0; const el = show.querySelectorAll("img"); setInterval(() => { if (document.hidden) return; el[k].classList.remove("on"); k = (k + 1) % el.length; el[k].classList.add("on"); }, 7000); }
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
    const gl = document.querySelector("[data-list='about.gallery']");
    if (gl) { if (a.gallery && a.gallery.length) { const h = a.gallery.map((f) => `<img src="assets/${esc(f)}" alt="" loading="lazy">`).join(""); gl.innerHTML = `<div class="gallery-track">${h}${h}</div>`; gl.hidden = false; } else gl.hidden = true; }
    const photoWrap = document.querySelector("[data-bind='about.photo']");
    if (photoWrap) {
      if (a.photo) { photoWrap.innerHTML = `<img src="assets/${esc(a.photo)}" alt="Photo of Liam Farhangi" class="about-photo">`; }
      else { photoWrap.innerHTML = ""; }
    }
  }

  function cellHtml(cell) {
    return `<div class="tb-cell"><span class="k">${esc(cell.k)}</span><span class="v${cell.accent ? " accent" : ""}">${esc(cell.v)}</span></div>`;
  }

  const gid = (g) => /^leadership/i.test(g) ? "leadership" : (g.toLowerCase().split(" ")[0] || "experience");
  function renderExperience(list, target) {
    const container = target || document.querySelector("[data-list='experience']");
    if (!container || !list) return;
    const groups = [];
    list.forEach((xp, i) => { const g = xp.group || ""; let last = groups[groups.length - 1]; if (!last || last.g !== g) { last = { g, items: [] }; groups.push(last); } last.items.push([xp, i]); });
    container.innerHTML = groups.map((grp) => `<section class="blk" id="${gid(grp.g)}"><div class="sheet-label"><span class="num">${esc(grp.g || "Experience")}</span><span class="rule"></span></div>` + grp.items.map(([xp, i]) => `
      <div id="xp-${i}" class="xp-item acc${i === 0 ? " open" : ""}">
        <button class="acc-head" aria-expanded="${i === 0}"><div class="xp-meta"><div class="role">${esc(xp.role)}</div><div class="org">${esc(xp.org)}</div><div class="dates">${esc(xp.dates)}</div></div><span class="chev">+</span></button>
        <div class="acc-body"><div class="acc-inner"><div class="xp-body"><ul>${(xp.bullets || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div></div></div>
      </div>`).join("") + `</section>`).join("");
  }

  function renderProjects(list) {
    const container = document.querySelector("[data-list='projects']");
    if (!container || !list) return;
    container.innerHTML = list.map((p, i) => `
      <div id="proj-${i}" class="proj-card acc${i < (matchMedia("(max-width: 760px)").matches ? 1 : 2) ? " open" : ""}">
        <button class="acc-head" aria-expanded="${i < (matchMedia("(max-width: 760px)").matches ? 1 : 2)}"><div class="ph"><div><div class="ptitle">${esc(p.title)}</div><div class="prole">${esc(p.role)}</div></div></div><span class="chev">+</span></button>
        <div class="acc-body"><div class="acc-inner"><div class="pb">
          ${p.image ? `<img src="assets/${esc(p.image)}" alt="${esc(p.title)}" class="proj-img">` : ""}
          ${(p.paragraphs || []).map((para) => `<p>${esc(para)}</p>`).join("")}
          ${p.stack ? `<div class="chips">${p.stack.split(" · ").map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
        </div></div></div>
      </div>`).join("");
  }

  function logo(t) {
    const r = (window.LOGO_RULES || []).find((x) => x[0].test(t)); if (!r) return "";
    if (window.LOGOS[r[1]]) return `<span class="lg">${window.LOGOS[r[1]]}</span>`;
    return (window.LOGO_FILES || []).includes(r[1]) ? `<span class="lg"><img src="assets/logos/${r[1]}.png" alt="" onerror="this.parentNode.remove()"></span>` : "";
  }
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
    for (const a of document.querySelectorAll(".acc.open")) { const r = a.getBoundingClientRect(); if (y >= r.top && y <= r.bottom) return; }
    for (const a of accs) { const r = a.getBoundingClientRect(), d = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0; if (d === 0 && a.classList.contains("open")) return; if (d < bd) { bd = d; best = a; } }
    let target = best; const cur = accs.findIndex((x) => x.classList.contains("open")), bi = accs.indexOf(best);
    if (cur >= 0) { const step = accs[0].classList.contains("proj-card") && !single() ? 2 : 1; if (Math.abs(bi - cur) > step) { target = accs[Math.max(0, Math.min(accs.length - 1, cur + (bi > cur ? step : -step)))]; setTimeout(queue, 380); } }
    const keep = groupOf(target); accs.forEach((x) => setOpen(x, keep.includes(x)));
  };
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } };
  document.addEventListener("click", (e) => { const hb = e.target.closest(".htl-nav .htl-btn"), tl0 = document.querySelector(".htl"); if (hb && tl0) tl0.scrollBy({ left: (hb.classList.contains("next") ? 1 : -1) * 340, behavior: "smooth" }); });
  document.addEventListener("click", (e) => {
    const h = e.target.closest(".acc-head"); if (!h) return;
    const a = h.closest(".acc"), opening = !a.classList.contains("open"); manualUntil = performance.now() + 3000;
    if (opening) { const keep = groupOf(a); document.querySelectorAll(".acc").forEach((x) => setOpen(x, keep.includes(x))); } else groupOf(a).forEach((x) => setOpen(x, false));
  });
  addEventListener("scroll", queue, { passive: true }); addEventListener("resize", queue);
  new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
  function highlight(root, q) {
    if (!q) return;
    const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 1).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")); if (!terms.length) return;
    const re = new RegExp("(" + terms.join("|") + ")", "ig"), w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
    while (w.nextNode()) { const n = w.currentNode; if (re.test(n.nodeValue)) nodes.push(n); re.lastIndex = 0; }
    nodes.forEach((n) => { const sp = document.createElement("span"); sp.innerHTML = n.nodeValue.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])).replace(re, '<mark class="hit">$1</mark>'); n.replaceWith(sp); });
    setTimeout(() => root.querySelectorAll("mark.hit").forEach((m) => m.replaceWith(document.createTextNode(m.textContent))), 9000);
  }
  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1)); if (!id) return;
    const el = document.getElementById(id); if (!el) return;
    const isAcc = el.classList.contains("acc");
    if (isAcc) { const keep = groupOf(el); document.querySelectorAll(".acc").forEach((x) => setOpen(x, keep.includes(x))); manualUntil = performance.now() + 5000; }
    setTimeout(() => { el.scrollIntoView({ block: isAcc ? "center" : "start", behavior: "smooth" }); highlight(el, new URLSearchParams(location.search).get("q")); }, 500);
  }
  let dragEl = null, dragX = 0, dragLeft = 0;
  document.addEventListener("pointerdown", (e) => { const t = e.target.closest(".htl"); if (!t || e.pointerType !== "mouse" || e.button || e.target.closest("a,button")) return; dragEl = t; dragX = e.clientX; dragLeft = t.scrollLeft; t.classList.add("drag"); });
  addEventListener("pointermove", (e) => { if (dragEl) dragEl.scrollLeft = dragLeft - (e.clientX - dragX); });
  addEventListener("pointerup", () => { if (dragEl) { dragEl.classList.remove("drag"); dragEl = null; } });
})();
