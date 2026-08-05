// Loads content.json and fills in every page. Edit content.json (via admin.html)
// instead of editing the HTML files directly.
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  fetch("content.json?_=" + Date.now())
    .then((r) => r.json())
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

  function applyTheme(theme) {
    if (!theme) return;
    const root = document.documentElement.style;
    if (theme.accent) root.setProperty("--accent", theme.accent);
    if (theme.accentDim) root.setProperty("--accent-dim", theme.accentDim);
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

    const photoWrap = document.querySelector("[data-bind='about.photo']");
    if (photoWrap) {
      if (a.photo) { photoWrap.innerHTML = `<img src="assets/${esc(a.photo)}" alt="Photo of Liam Farhangi" class="about-photo">`; }
      else { photoWrap.innerHTML = ""; }
    }
  }

  function cellHtml(cell) {
    return `<div class="tb-cell"><span class="k">${esc(cell.k)}</span><span class="v${cell.accent ? " accent" : ""}">${esc(cell.v)}</span></div>`;
  }

  function renderExperience(list) {
    const container = document.querySelector("[data-list='experience']");
    if (!container || !list) return;
    container.innerHTML = list.map((xp) => `
      <div class="xp-item">
        <div class="xp-meta">
          <div class="role">${esc(xp.role)}</div>
          <div class="org">${esc(xp.org)}</div>
          <div class="dates">${esc(xp.dates)}</div>
        </div>
        <div class="xp-body">
          <ul>${(xp.bullets || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
        </div>
      </div>`).join("");
  }

  function renderProjects(list) {
    const container = document.querySelector("[data-list='projects']");
    if (!container || !list) return;
    container.innerHTML = list.map((p) => `
      <div class="proj-card">
        ${p.image ? `<img src="assets/${esc(p.image)}" alt="${esc(p.title)}" class="proj-img">` : ""}
        <div class="ptitle">${esc(p.title)}</div>
        <div class="prole">${esc(p.role)}</div>
        ${(p.paragraphs || []).map((para) => `<p>${esc(para)}</p>`).join("")}
        ${p.stack ? `<div class="stack">${esc(p.stack)}</div>` : ""}
      </div>`).join("");
  }

  function renderSkills(list) {
    const container = document.querySelector("[data-list='skills']");
    if (!container || !list) return;
    container.innerHTML = list.map((s) => `
      <div class="fcf">
        <div class="fcf-head"><span class="sym">${esc(s.sym)}</span> ${esc(s.head)}</div>
        <div class="fcf-body">${(s.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
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

    const resumeA = document.querySelector("[data-resume]");
    if (resumeA) {
      if (c.resumeFile) { resumeA.href = "assets/" + c.resumeFile; resumeA.style.display = ""; }
      else { resumeA.style.display = "none"; }
    }
  }
})();
