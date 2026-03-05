import { loadData, saveData, resetData, ICS_URL, defaultScoringRule } from "./data.js";

const appEl = document.getElementById("app");

// Header / nav
const burgerBtn = document.getElementById("burgerBtn");
const mobileNav = document.getElementById("mobileNav");
const mobileBackdrop = document.getElementById("mobileBackdrop");
const mobileCloseBtn = document.getElementById("mobileCloseBtn");

// Drawer joueur
const playerDrawer = document.getElementById("playerDrawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const drawerCloseBtn = document.getElementById("drawerCloseBtn");
const drawerTitle = document.getElementById("drawerTitle");
const drawerBody = document.getElementById("drawerBody");

// Toast
const toastEl = document.getElementById("toast");

let data = loadData();

// Router
const routes = {
  "/": renderHome,
  "/classement": renderRanking,
  "/historique": renderHistory,
  "/bureau": renderOffice,
  "/contact": renderContact,
  "/admin": renderAdmin
};

function getPath() {
  const hash = window.location.hash || "#/";
  const path = hash.replace("#", "");
  return path || "/";
}

function setActiveNav(path) {
  const links = document.querySelectorAll("[data-route]");
  links.forEach(a => {
    const route = a.getAttribute("data-route");
    a.classList.toggle("is-active", route === `#${path}`);
  });
}

function navigate(path) {
  window.location.hash = `#${path}`;
}

function render() {
  const path = getPath();
  setActiveNav(path);

  const fn = routes[path] || renderNotFound;
  fn();
  document.getElementById("main")?.focus();
  closeMobileNav();
}

window.addEventListener("hashchange", render);

// --- Helpers (formatting) ---
function formatDateFR(isoDate) {
  const d = new Date(isoDate);
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(d);
}

function formatDateShort(isoDate) {
  const d = new Date(isoDate);
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d);
}

function formatTime(isoDateTime) {
  const d = new Date(isoDateTime);
  return new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" }).format(d);
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  setTimeout(() => { toastEl.hidden = true; }, 2600);
}

// --- Data computations ---
function getPlayerById(playerId) {
  return data.players.find(p => p.id === playerId);
}

function getSessionById(sessionId) {
  return data.sessions.find(s => s.id === sessionId);
}

function getRuleById(ruleId) {
  return data.scoringRules.find(r => r.id === ruleId) || defaultScoringRule;
}

function computeLeaderboard() {
  // total points per player
  const totals = new Map();
  for (const p of data.players) totals.set(p.id, 0);

  for (const r of data.results) {
    totals.set(r.playerId, (totals.get(r.playerId) || 0) + r.pointsTotal);
  }

  // build leaderboard
  const rows = data.players.map(p => ({
    playerId: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    score: totals.get(p.id) || 0
  }));

  rows.sort((a, b) => b.score - a.score || a.lastName.localeCompare(b.lastName));
  return rows.map((r, idx) => ({ ...r, position: idx + 1 }));
}

function getPlayerHistory(playerId) {
  const items = data.results
    .filter(r => r.playerId === playerId)
    .map(r => {
      const s = getSessionById(r.sessionId);
      return {
        sessionId: r.sessionId,
        date: s?.date || "",
        location: s?.location || "",
        position: r.position,
        pointsTotal: r.pointsTotal,
        detail: r.calculationDetail
      };
    });

  items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return items;
}

function computeSessionTable(sessionId) {
  const rows = data.results
    .filter(r => r.sessionId === sessionId)
    .map(r => {
      const p = getPlayerById(r.playerId);
      return {
        position: r.position,
        playerName: p ? `${p.firstName} ${p.lastName}` : r.playerId,
        points: r.pointsTotal,
        detail: r.calculationDetail
      };
    })
    .sort((a, b) => a.position - b.position);

  return rows;
}

// --- Drawer joueur ---
let lastFocusedEl = null;

function openPlayerDrawer(playerId) {
  const p = getPlayerById(playerId);
  const history = getPlayerHistory(playerId);
  const total = history.reduce((sum, h) => sum + h.pointsTotal, 0);
  const sessionsCount = history.length;
  const avg = sessionsCount ? Math.round((total / sessionsCount) * 10) / 10 : 0;

  drawerTitle.textContent = p ? `${p.firstName} ${p.lastName}` : "Joueur";

  drawerBody.innerHTML = `
    <div class="kpis">
      <div class="kpi">
        <div class="kpi__label">Score total</div>
        <div class="kpi__value">${total}</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Séances jouées</div>
        <div class="kpi__value">${sessionsCount}</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Moyenne / séance</div>
        <div class="kpi__value">${avg}</div>
      </div>
    </div>

    <div class="pill pill--accent">Historique des points</div>
    <div class="note" style="margin-top:8px">Chaque ligne détaille la séance, la position obtenue et le calcul appliqué.</div>
    <div class="hr"></div>

    ${history.length ? `
      <div class="table-wrap" style="margin-top:0">
        <table class="table" aria-label="Historique des points">
          <thead>
            <tr>
              <th>Date</th>
              <th>Position</th>
              <th>Points</th>
              <th>Détail</th>
            </tr>
          </thead>
          <tbody>
            ${history.map(h => `
              <tr tabindex="0">
                <td>${escapeHtml(formatDateShort(h.date))}</td>
                <td>${h.position}</td>
                <td><span class="pill">${h.pointsTotal}</span></td>
                <td class="note">${escapeHtml(h.detail)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    ` : `<div class="note">Aucune séance enregistrée pour ce joueur.</div>`}
  `;

  lastFocusedEl = document.activeElement;
  playerDrawer.hidden = false;

  // focus management
  setTimeout(() => drawerCloseBtn.focus(), 0);
}

function closePlayerDrawer() {
  playerDrawer.hidden = true;
  if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
    lastFocusedEl.focus();
  }
}

// --- Mobile nav ---
function openMobileNav() {
  mobileNav.hidden = false;
  burgerBtn.setAttribute("aria-expanded", "true");
  mobileCloseBtn.focus();
}
function closeMobileNav() {
  mobileNav.hidden = true;
  burgerBtn.setAttribute("aria-expanded", "false");
}

burgerBtn.addEventListener("click", () => {
  const isHidden = mobileNav.hidden;
  isHidden ? openMobileNav() : closeMobileNav();
});
mobileBackdrop.addEventListener("click", closeMobileNav);
mobileCloseBtn.addEventListener("click", closeMobileNav);

// close on route click (mobile)
mobileNav.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;
  closeMobileNav();
});

// Drawer events
drawerBackdrop.addEventListener("click", closePlayerDrawer);
drawerCloseBtn.addEventListener("click", closePlayerDrawer);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!playerDrawer.hidden) closePlayerDrawer();
    if (!mobileNav.hidden) closeMobileNav();
  }
});

// --- Pages ---
function pageShell(title, subtitle, contentHtml) {
  appEl.innerHTML = `
    <div class="page">
      <div class="container">
        <div class="panel card" style="padding:18px">
          <div class="panel__header">
            <div>
              <h1 class="h2">${escapeHtml(title)}</h1>
              ${subtitle ? `<div class="kicker">${escapeHtml(subtitle)}</div>` : ``}
            </div>
          </div>
          ${contentHtml}
        </div>
      </div>
    </div>
  `;
}

function renderHome() {
  const leaderboard = computeLeaderboard().slice(0, 20);
  const events = data.upcomingEvents;

  appEl.innerHTML = `
    <div class="page">
      <div class="container">
        <section class="hero" aria-label="Section principale">
          <div class="hero__inner">
            <div class="hero__content">
              <h1 class="hero__title">Soirée LAS VEGAS - 29 mars 2026</h1>
              <div class="hero__text">
                Soirées hebdo, classement évolutif, esprit convivial..
              </div>
              <div class="hero__actions">
                <a class="btn btn--primary" href="#/contact">Rejoindre l’asso</a>
                <a class="btn btn--secondary" href="#/classement">Voir le classement</a>
              </div>
            </div>

            <aside class="card calendar" aria-label="Prochains événements">
              <div class="calendar__title">
                <h3>Prochains événements</h3>
                <span class="badge">Lien .ics</span>
              </div>

              <div class="calendar__list">
                ${events.map(ev => `
                  <div class="event">
                    <div class="event__top">
                      <div class="event__name">${escapeHtml(ev.title)}</div>
                      <div class="pill">${escapeHtml(formatTime(ev.startDateTime))}</div>
                    </div>
                    <div class="event__meta">${escapeHtml(formatDateShort(ev.startDateTime))} • ${escapeHtml(ev.location || "Lieu à confirmer")}</div>
                  </div>
                `).join("")}
              </div>
            </aside>
          </div>
        </section>

        <section class="section">
          <div class="panel card" style="padding:18px">
            <div class="panel__header">
              <div>
                <h2 class="h2">CLASSEMENT / RANKING</h2>
                <div class="kicker">Saison 2O26 - Semestre 2</div>
              </div>
              <div class="toolbar">
                <div class="input">
                  <input class="field" id="searchHome" type="search" placeholder="Rechercher un joueur" />
                </div>
                <a class="btn btn--secondary" href="#/classement">Voir tout</a>
              </div>
            </div>

            <div class="table-wrap" aria-label="Tableau classement (extrait)">
              <table class="table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Score</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                  </tr>
                </thead>
                <tbody id="homeRankingBody">
                  ${leaderboard.map(r => `
                    <tr data-player="${r.playerId}" tabindex="0">
                      <td><span class="pill">${r.position}</span></td>
                      <td><span class="pill pill--accent">${r.score}</span></td>
                      <td>${escapeHtml(r.lastName)}</td>
                      <td>${escapeHtml(r.firstName)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  // Interactions
  document.getElementById("copyIcsBtn").addEventListener("click", async () => {
    try {
      const url = new URL(ICS_URL, window.location.href).href;
      await navigator.clipboard.writeText(url);
      showToast("Lien ICS copié.");
    } catch {
      showToast("Copie impossible. Vous pouvez télécharger le fichier ICS.");
    }
  });

  const tbody = document.getElementById("homeRankingBody");
  tbody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-player]");
    if (!tr) return;
    openPlayerDrawer(tr.dataset.player);
  });
  tbody.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const tr = e.target.closest("tr[data-player]");
    if (!tr) return;
    e.preventDefault();
    openPlayerDrawer(tr.dataset.player);
  });

  const search = document.getElementById("searchHome");
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    const all = computeLeaderboard();
    const filtered = all.filter(r =>
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
      `${r.lastName} ${r.firstName}`.toLowerCase().includes(q)
    ).slice(0, 20);

    tbody.innerHTML = filtered.map(r => `
      <tr data-player="${r.playerId}" tabindex="0">
        <td><span class="pill">${r.position}</span></td>
        <td><span class="pill pill--accent">${r.score}</span></td>
        <td>${escapeHtml(r.lastName)}</td>
        <td>${escapeHtml(r.firstName)}</td>
      </tr>
    `).join("");
  });
}

function renderRanking() {
  const leaderboard = computeLeaderboard();

  appEl.innerHTML = `
    <div class="page">
      <div class="container">
        <div class="panel card">
          <div class="panel__header">
            <div>
              <h1 class="h2">Classement</h1>
              <div class="kicker">Tri par score décroissant (par défaut) • Recherche instantanée</div>
            </div>

            <div class="toolbar">
              <div class="input">
                <div class="label">Rechercher un joueur</div>
                <input class="field" id="searchRanking" type="search" placeholder="Nom, prénom…" />
              </div>

              <div class="input" style="min-width:200px">
                <div class="label">Tri</div>
                <select id="sortRanking" aria-label="Tri du classement">
                  <option value="score_desc">Score (décroissant)</option>
                  <option value="name_asc">Nom (A → Z)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="table-wrap">
            <table class="table" aria-label="Tableau classement général">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Score</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                </tr>
              </thead>
              <tbody id="rankingBody">
                ${leaderboard.map(r => `
                  <tr data-player="${r.playerId}" tabindex="0">
                    <td><span class="pill">${r.position}</span></td>
                    <td><span class="pill pill--accent">${r.score}</span></td>
                    <td>${escapeHtml(r.lastName)}</td>
                    <td>${escapeHtml(r.firstName)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div class="note" style="margin-top:10px">
            Conseil mobile : faites défiler horizontalement si nécessaire.
          </div>
        </div>
      </div>
    </div>
  `;

  const tbody = document.getElementById("rankingBody");
  const search = document.getElementById("searchRanking");
  const sort = document.getElementById("sortRanking");

  function applyFilters() {
    const q = search.value.trim().toLowerCase();
    let rows = computeLeaderboard();

    if (sort.value === "name_asc") {
      rows.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
      rows = rows.map((r, idx) => ({ ...r, position: idx + 1 })); // position recalculée pour affichage
    }

    if (q) {
      rows = rows.filter(r =>
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        `${r.lastName} ${r.firstName}`.toLowerCase().includes(q)
      );
    }

    tbody.innerHTML = rows.map(r => `
      <tr data-player="${r.playerId}" tabindex="0">
        <td><span class="pill">${r.position}</span></td>
        <td><span class="pill pill--accent">${r.score}</span></td>
        <td>${escapeHtml(r.lastName)}</td>
        <td>${escapeHtml(r.firstName)}</td>
      </tr>
    `).join("");
  }

  search.addEventListener("input", applyFilters);
  sort.addEventListener("change", applyFilters);

  tbody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-player]");
    if (!tr) return;
    openPlayerDrawer(tr.dataset.player);
  });
  tbody.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const tr = e.target.closest("tr[data-player]");
    if (!tr) return;
    e.preventDefault();
    openPlayerDrawer(tr.dataset.player);
  });
}

function renderHistory() {
  // most recent first
  const sessions = [...data.sessions].sort((a, b) => b.date.localeCompare(a.date));

  appEl.innerHTML = `
    <div class="page">
      <div class="container">
        <div class="panel card">
          <div class="panel__header">
            <div>
              <h1 class="h2">Historique des séances</h1>
              <div class="kicker">Liste chronologique • Export CSV • Détails barème et calculs</div>
            </div>

            <div class="toolbar">
              <a class="btn btn--primary" href="#/admin">Créer une nouvelle séance</a>
              <button class="btn btn--secondary" id="resetBtn" type="button">Réinitialiser les données</button>
            </div>
          </div>

          <div class="session-list" id="sessionList">
            ${sessions.map(s => {
              const table = computeSessionTable(s.id);
              const participants = table.length;
              return `
                <article class="session" data-session="${s.id}">
                  <div class="session__top">
                    <div>
                      <div style="font-weight:900; font-size:16px">${escapeHtml(formatDateFR(s.date))}</div>
                      <div class="session__meta">${escapeHtml(s.location)} • ${participants} participant(s)</div>
                      ${s.notes ? `<div class="note" style="margin-top:6px">${escapeHtml(s.notes)}</div>` : ``}
                    </div>

                    <div class="session__actions">
                      <button class="btn btn--secondary" data-action="export" data-session="${s.id}" type="button">
                        Télécharger l’Excel (CSV)
                      </button>
                      <button class="btn btn--secondary" data-action="details" data-session="${s.id}" type="button">
                        Voir détails
                      </button>
                    </div>
                  </div>

                  <div class="table-wrap" style="margin-top:12px">
                    <table class="table" aria-label="Classement de la séance">
                      <thead>
                        <tr>
                          <th>Position</th>
                          <th>Joueur</th>
                          <th>Points gagnés</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${table.map(r => `
                          <tr tabindex="0">
                            <td><span class="pill">${r.position}</span></td>
                            <td>${escapeHtml(r.playerName)}</td>
                            <td><span class="pill pill--accent">${r.points}</span></td>
                          </tr>
                        `).join("")}
                      </tbody>
                    </table>
                  </div>
                </article>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("resetBtn").addEventListener("click", () => {
    resetData();
    data = loadData();
    showToast("Données réinitialisées.");
    renderHistory();
  });

  document.getElementById("sessionList").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const sessionId = btn.dataset.session;

    if (action === "export") {
      exportSessionCSV(sessionId);
    }
    if (action === "details") {
      openSessionDetails(sessionId);
    }
  });
}

function openSessionDetails(sessionId) {
  const s = getSessionById(sessionId);
  const rule = getRuleById(s.scoringRuleId);
  const table = computeSessionTable(sessionId);
  const participants = table.length;

  drawerTitle.textContent = `Séance — ${formatDateShort(s.date)}`;

  const ruleLines = Object.entries(rule.pointsByPosition)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([pos, pts]) => `${pos} → ${pts} pts`)
    .join(" • ");

  drawerBody.innerHTML = `
    <div class="note">
      <div><strong>Lieu :</strong> ${escapeHtml(s.location)}</div>
      <div><strong>Participants :</strong> ${participants}</div>
      ${s.notes ? `<div><strong>Notes :</strong> ${escapeHtml(s.notes)}</div>` : ``}
    </div>

    <div class="hr"></div>

    <div class="pill pill--accent">Barème appliqué</div>
    <div class="note" style="margin-top:8px">
      <div>${escapeHtml(rule.name)}</div>
      <div style="margin-top:6px">${escapeHtml(ruleLines)} • 9+ → ${rule.defaultPoints} pts</div>
      <div style="margin-top:6px">Bonus : +2 si ≥ 10 participants</div>
    </div>

    <div class="hr"></div>

    <div class="pill pill--accent">Détail des calculs</div>
    <div class="table-wrap" style="margin-top:10px">
      <table class="table" aria-label="Détails de calcul">
        <thead>
          <tr>
            <th>Position</th>
            <th>Joueur</th>
            <th>Points</th>
            <th>Calcul</th>
          </tr>
        </thead>
        <tbody>
          ${table.map(r => `
            <tr tabindex="0">
              <td><span class="pill">${r.position}</span></td>
              <td>${escapeHtml(r.playerName)}</td>
              <td><span class="pill pill--accent">${r.points}</span></td>
              <td class="note">${escapeHtml(r.detail)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  lastFocusedEl = document.activeElement;
  playerDrawer.hidden = false;
  setTimeout(() => drawerCloseBtn.focus(), 0);
}

function exportSessionCSV(sessionId) {
  const s = getSessionById(sessionId);
  const table = computeSessionTable(sessionId);

  const lines = [
    ["Date", "Lieu", "Position", "Joueur", "Points", "Détail calcul"].join(","),
    ...table.map(r => [
      `"${s.date}"`,
      `"${(s.location || "").replaceAll('"','""')}"`,
      r.position,
      `"${r.playerName.replaceAll('"','""')}"`,
      r.points,
      `"${r.detail.replaceAll('"','""')}"`,
    ].join(","))
  ];

  const csv = lines.join("\n");
  downloadTextFile(csv, `seance-${s.date}.csv`, "text/csv;charset=utf-8");
  showToast("CSV téléchargé.");
}

function downloadTextFile(text, filename, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function renderOffice() {
  appEl.innerHTML = `
    <div class="page">
      <div class="container">
        <div class="panel card">
          <div class="panel__header">
            <div>
              <h1 class="h2">Le Bureau</h1>
              <div class="kicker">Équipe organisatrice • Contact direct par email</div>
            </div>
          </div>

          <div class="cards" aria-label="Membres du bureau">
            ${data.office.map(m => `
              <div class="member" tabindex="0">
                <div class="member__top">
                  <img class="member__photo" src="${escapeHtml(m.photoUrl)}" alt="Photo de ${escapeHtml(m.firstName)} ${escapeHtml(m.lastName)}" />
                  <div>
                    <div class="member__name">${escapeHtml(m.firstName)} ${escapeHtml(m.lastName)}</div>
                    <div class="member__role">${escapeHtml(m.role)}</div>
                  </div>
                </div>
                <div class="member__mail">
                  <a href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a>
                  <a class="btn btn--secondary" href="mailto:${escapeHtml(m.email)}">Contacter</a>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderContact() {
  appEl.innerHTML = `
    <div class="page">
      <div class="container">
        <div class="panel card">
          <div class="panel__header">
            <div>
              <h1 class="h2">Nous contacter</h1>
              <div class="kicker">Réponse rapide • Email requis • Message requis</div>
            </div>
          </div>

          <form class="form" id="contactForm" novalidate>
            <div class="col-6">
              <div class="label">Prénom</div>
              <input class="field" name="firstName" type="text" autocomplete="given-name" placeholder="Votre prénom" />
            </div>

            <div class="col-6">
              <div class="label">Nom</div>
              <input class="field" name="lastName" type="text" autocomplete="family-name" placeholder="Votre nom" />
            </div>

            <div class="col-6">
              <div class="label">Mail <span aria-hidden="true" style="color:var(--danger)">*</span></div>
              <input class="field" name="email" type="email" autocomplete="email" placeholder="vous@example.com" required />
              <div class="error" id="errEmail" hidden>Email requis (format valide).</div>
            </div>

            <div class="col-6">
              <div class="label">Téléphone</div>
              <input class="field" name="phone" type="tel" autocomplete="tel" placeholder="06 00 00 00 00" />
              <div class="help">Optionnel</div>
            </div>

            <div class="col-12">
              <div class="label">Message <span aria-hidden="true" style="color:var(--danger)">*</span></div>
              <textarea class="field" name="message" rows="5" placeholder="Votre message..." required></textarea>
              <div class="error" id="errMsg" hidden>Message requis.</div>
            </div>

            <div class="col-12" style="display:flex; gap:10px; flex-wrap:wrap; align-items:center">
              <button class="btn btn--primary" type="submit">Envoyer</button>
              <div class="note" id="confirm" hidden>Message envoyé. Merci ! Nous revenons vers vous rapidement.</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById("contactForm");
  const errEmail = document.getElementById("errEmail");
  const errMsg = document.getElementById("errMsg");
  const confirm = document.getElementById("confirm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const msgOk = message.length >= 2;

    errEmail.hidden = emailOk;
    errMsg.hidden = msgOk;

    if (!emailOk || !msgOk) {
      showToast("Veuillez corriger les champs requis.");
      return;
    }

    // Simule un envoi
    confirm.hidden = false;
    showToast("Message envoyé.");
    form.reset();

    setTimeout(() => { confirm.hidden = true; }, 5000);
  });
}

function renderAdmin() {
  const leaderboard = computeLeaderboard();
  const rule = getRuleById(defaultScoringRule.id);

  appEl.innerHTML = `
    <div class="page">
      <div class="container">
        <div class="panel card">
          <div class="panel__header">
            <div>
              <h1 class="h2">Admin — Gestion des séances</h1>
              <div class="kicker">Créer une séance • Saisie des positions • Calcul automatique • Mise à jour classement</div>
            </div>
            <div class="toolbar">
              <a class="btn btn--secondary" href="#/historique">Voir l’historique</a>
            </div>
          </div>

          <div class="admin-grid">
            <div class="admin-left">
              <div class="box">
                <h3>Créer une nouvelle séance</h3>
                <div class="small">Renseignez la date et le lieu, puis saisissez les positions (1,2,3…).</div>

                <div class="form" style="margin-top:12px">
                  <div class="col-12">
                    <div class="label">Date</div>
                    <input class="field" id="newDate" type="date" value="${todayISO()}" />
                  </div>
                  <div class="col-12">
                    <div class="label">Lieu</div>
                    <input class="field" id="newLocation" type="text" value="Salle Municipale — Vitry" />
                  </div>
                  <div class="col-12">
                    <div class="label">Notes</div>
                    <input class="field" id="newNotes" type="text" placeholder="Optionnel" />
                  </div>
                  <div class="col-12">
                    <div class="label">Barème</div>
                    <select id="newRule">
                      ${data.scoringRules.map(r => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)}</option>`).join("")}
                    </select>
                    <div class="help">1→${rule.pointsByPosition[1]} pts, 2→${rule.pointsByPosition[2]} pts… bonus +2 si ≥10 participants.</div>
                  </div>
                  <div class="col-12" style="display:flex; gap:10px; flex-wrap:wrap">
                    <button class="btn btn--primary" id="createSessionBtn" type="button">Créer une nouvelle séance</button>
                    <button class="btn btn--secondary" id="resetBtnAdmin" type="button">Réinitialiser données</button>
                  </div>
                </div>
              </div>

              <div class="box" style="margin-top:16px">
                <h3>Joueurs</h3>
                <div class="small">Ajoutez/retirez des joueurs via la feuille. Positions uniques.</div>
                <div class="note" style="margin-top:8px">Conseil : commencez par 10–12 joueurs, puis validez la séance.</div>
              </div>
            </div>

            <div class="admin-right">
              <div class="box">
                <h3>Feuille de saisie (style Excel)</h3>
                <div class="small">Saisissez la position. Les points et le détail du calcul sont mis à jour.</div>

                <div style="display:flex; gap:10px; flex-wrap:wrap; margin:12px 0">
                  <button class="btn btn--secondary" id="addRowBtn" type="button">Ajouter un joueur</button>
                  <button class="btn btn--secondary" id="removeEmptyBtn" type="button">Retirer lignes vides</button>
                  <button class="btn btn--primary" id="validateBtn" type="button">Envoyer / Valider la séance</button>
                </div>

                <div class="table-editor" aria-label="Tableur admin">
                  <table>
                    <thead>
                      <tr>
                        <th>Joueur</th>
                        <th>Position</th>
                        <th>Points</th>
                        <th>Détail</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody id="sheetBody"></tbody>
                  </table>
                </div>

                <div class="note" style="margin-top:10px">
                  Règles : position ≥ 1, positions uniques, joueur requis. Bonus +2 si ≥ 10 participants.
                </div>
              </div>
            </div>
          </div>

          <div class="hr"></div>

          <div class="note">
            Astuce : après validation, vous pouvez exporter la séance depuis l’historique.
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("resetBtnAdmin").addEventListener("click", () => {
    resetData();
    data = loadData();
    showToast("Données réinitialisées.");
    renderAdmin();
  });

  // Sheet state
  const sheetBody = document.getElementById("sheetBody");
  const addRowBtn = document.getElementById("addRowBtn");
  const removeEmptyBtn = document.getElementById("removeEmptyBtn");
  const validateBtn = document.getElementById("validateBtn");
  const createSessionBtn = document.getElementById("createSessionBtn");

  const state = {
    ruleId: document.getElementById("newRule").value,
    rows: []
  };

  // Initialize with 12 lines prefilled from current leaderboard
  const initialIds = leaderboard.slice(0, 12).map(r => r.playerId);
  state.rows = initialIds.map((playerId, idx) => ({
    rowId: cryptoId(),
    playerId,
    position: idx + 1
  }));

  function renderSheet() {
    const rule = getRuleById(state.ruleId);

    // compute preview results (only valid rows)
    const validRows = state.rows
      .filter(r => r.playerId)
      .map(r => ({ ...r, position: Number(r.position) }))
      .filter(r => Number.isFinite(r.position) && r.position >= 1);

    const participantCount = validRows.length;

    sheetBody.innerHTML = state.rows.map(r => {
      const p = r.playerId ? getPlayerById(r.playerId) : null;
      const pos = Number(r.position);

      let points = "";
      let detail = "";
      if (r.playerId && Number.isFinite(pos) && pos >= 1) {
        const base = rule.pointsByPosition[pos] ?? rule.defaultPoints;
        const bonus = participantCount >= 10 ? 2 : 0;
        const total = base + bonus;
        points = String(total);
        detail = `${pos}e → base ${base} + bonus ${bonus} = ${total}`;
      }

      return `
        <tr data-row="${r.rowId}">
          <td>
            <select class="cell-input" style="width:240px" data-field="player">
              <option value="">— Sélectionner —</option>
              ${data.players.map(pl => `
                <option value="${escapeHtml(pl.id)}" ${pl.id === r.playerId ? "selected" : ""}>
                  ${escapeHtml(pl.firstName)} ${escapeHtml(pl.lastName)}
                </option>
              `).join("")}
            </select>
          </td>

          <td>
            <input class="cell-input" data-field="position" type="number" min="1" step="1" value="${r.position ?? ""}" placeholder="ex: 1" />
          </td>

          <td><span class="pill pill--accent">${escapeHtml(points || "—")}</span></td>
          <td class="note">${escapeHtml(detail || "—")}</td>

          <td>
            <button class="btn btn--secondary" data-field="remove" type="button">Retirer</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  function syncRuleId() {
    state.ruleId = document.getElementById("newRule").value;
    renderSheet();
  }

  document.getElementById("newRule").addEventListener("change", syncRuleId);

  sheetBody.addEventListener("input", (e) => {
    const tr = e.target.closest("tr[data-row]");
    if (!tr) return;
    const rowId = tr.dataset.row;
    const row = state.rows.find(x => x.rowId === rowId);
    if (!row) return;

    const field = e.target.dataset.field;
    if (field === "position") {
      row.position = e.target.value;
    }
    renderSheet();
  });

  sheetBody.addEventListener("change", (e) => {
    const tr = e.target.closest("tr[data-row]");
    if (!tr) return;
    const rowId = tr.dataset.row;
    const row = state.rows.find(x => x.rowId === rowId);
    if (!row) return;

    const field = e.target.dataset.field;
    if (field === "player") {
      row.playerId = e.target.value || "";
    }
    renderSheet();
  });

  sheetBody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-row]");
    if (!tr) return;
    const rowId = tr.dataset.row;
    const field = e.target.dataset.field;

    if (field === "remove") {
      state.rows = state.rows.filter(r => r.rowId !== rowId);
      renderSheet();
    }
  });

  addRowBtn.addEventListener("click", () => {
    state.rows.push({ rowId: cryptoId(), playerId: "", position: "" });
    renderSheet();
  });

  removeEmptyBtn.addEventListener("click", () => {
    state.rows = state.rows.filter(r => r.playerId || r.position);
    renderSheet();
  });

  createSessionBtn.addEventListener("click", () => {
    showToast("Séance prête : remplissez la feuille et validez.");
    document.getElementById("newDate").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  validateBtn.addEventListener("click", () => {
    // Validate
    const rule = getRuleById(state.ruleId);
    const date = document.getElementById("newDate").value;
    const location = document.getElementById("newLocation").value.trim();
    const notes = document.getElementById("newNotes").value.trim();

    if (!date || !location) {
      showToast("Date et lieu requis.");
      return;
    }

    const rows = state.rows
      .filter(r => r.playerId)
      .map(r => ({ playerId: r.playerId, position: Number(r.position) }))
      .filter(r => Number.isFinite(r.position) && r.position >= 1);

    if (rows.length < 2) {
      showToast("Ajoutez au moins 2 joueurs avec une position valide.");
      return;
    }

    // positions unique ?
    const positions = rows.map(r => r.position);
    const uniquePos = new Set(positions);
    if (uniquePos.size !== positions.length) {
      showToast("Positions en double : corrigez la feuille.");
      return;
    }

    // players unique ?
    const players = rows.map(r => r.playerId);
    const uniquePlayers = new Set(players);
    if (uniquePlayers.size !== players.length) {
      showToast("Joueur en double : corrigez la feuille.");
      return;
    }

    // compute points with bonus rule
    const participantCount = rows.length;
    const bonus = participantCount >= 10 ? 2 : 0;

    const sorted = [...rows].sort((a, b) => a.position - b.position);

    const sessionId = `s${String(data.sessions.length + 1).padStart(2, "0")}-${Date.now()}`;
    const session = {
      id: sessionId,
      date,
      location,
      createdBy: "Admin",
      scoringRuleId: rule.id,
      notes
    };

    const results = sorted.map(r => {
      const base = rule.pointsByPosition[r.position] ?? rule.defaultPoints;
      const total = base + bonus;
      return {
        sessionId,
        playerId: r.playerId,
        position: r.position,
        pointsBase: base,
        bonus,
        malus: 0,
        pointsTotal: total,
        calculationDetail: `${r.position}e place → base ${base} + bonus ${bonus} (≥10 joueurs) = ${total}`
      };
    });

    data.sessions.push(session);
    data.results.push(...results);
    saveData(data);

    showToast("Séance validée. Classement mis à jour.");
    navigate("/historique");
  });

  renderSheet();
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function cryptoId() {
  // small unique id
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function renderNotFound() {
  pageShell("Page introuvable", "Le lien demandé n’existe pas.", `
    <div class="section">
      <a class="btn btn--primary" href="#/">Retour à l’accueil</a>
    </div>
  `);
}

// initial render
render();