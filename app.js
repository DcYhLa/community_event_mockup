// initialize app: map, users, events, filters, modals
// Data
const users = [
  {
    id: 1,
    name: "Placeholder",
    age: 30,
    group: "Placeholder",
    interest: "placeholder",
    experience: "beginner",
    lat: 51.5074,
    lng: -0.1278,
    avatar: "PH",
    location: "Placeholder",
    event: "Placeholder Event",
  },
];

const events = [
  {
    id: 1,
    title: "Placeholder Event",
    date: "2026-01-01",
    time: "12:00",
    type: "class",
    age: "all",
    level: "all",
    price: 0,
    lat: 51.5074,
    lng: -0.1278,
    tags: ["placeholder"],
    desc: "Lorem ipsum dolor sit amet.",
    attend: 0,
    max: 10,
  },
];

const resourcesData = [
  {
    category: "tai-chi",
    title: "Placeholder Resource",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    meta: ["Placeholder", "1 hour", "Free"],
    tags: ["placeholder"],
  },
];

const groups = [
  {
    name: "Placeholder Group",
    members: 10,
    desc: "Lorem ipsum dolor sit amet.",
    tags: ["placeholder"],
  },
];

// State
let activeFilters = {
  age: "all",
  interest: "all",
  exp: "all",
  eventType: "all",
};
let activeAgeChips = new Set();

// init: load data, setup listeners, render everything
function init() {
  document
    .getElementById("createEventBtn")
    .addEventListener("click", () => openModal("createEventModal"));
  document
    .getElementById("createEventClose")
    .addEventListener("click", () => closeModal("createEventModal"));
  document
    .getElementById("cancelCreateEvent")
    .addEventListener("click", () => closeModal("createEventModal"));
  document
    .getElementById("createEventForm")
    .addEventListener("submit", handleCreateEvent);
  document
    .getElementById("locationBtn")
    .addEventListener("click", () => toast("Location set to London", "info"));
  document
    .getElementById("modalClose")
    .addEventListener("click", () => closeModal("detailModal"));
  document
    .getElementById("loadMoreEvents")
    .addEventListener("click", loadMoreEvents);
  document.getElementById("mapViewFilter");
  document.getElementById("radiusFilter");
  document
    .getElementById("eventsSort")
    .addEventListener("change", refreshEvents);

  // Tabs
  document.querySelectorAll(".tab-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderResources(btn.dataset.tab);
    }),
  );
  document.querySelectorAll(".nav-link").forEach((link) =>
    link.addEventListener("click", () => {
      document
        .querySelectorAll(".nav-link")
        .forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      document
        .querySelectorAll(".section")
        .forEach((s) => s.classList.remove("active"));
      document.getElementById(link.dataset.section).classList.add("active");
    }),
  );

  // Chips
  setupChips("ageGroupChips", "age");
  setupChips("interestChips", "interest");
  setupChips("experienceChips", "exp");
  setupChips("eventTypeChips", "type");

  renderResults();
  renderResources("tai-chi");
  renderEvents();
  renderCommunity();
}

function setupChips(containerId, key) {
  const container = document.getElementById(containerId);
  container.querySelectorAll(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      container
        .querySelectorAll(".chip")
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeFilters[key] = chip.dataset[key];
      renderResults();
    }),
  );
}

function filterUsers() {
  return users.filter((u) => {
    if (activeFilters.age !== "all" && !matchAge(u.age, activeFilters.age))
      return false;
    if (
      activeFilters.interest !== "all" &&
      u.interest !== activeFilters.interest
    )
      return false;
    if (activeFilters.exp !== "all" && u.experience !== activeFilters.exp)
      return false;
    return true;
  });
}

function matchAge(age, range) {
  if (range === "all") return true;
  if (range === "18-25") return age >= 18 && age <= 25;
  if (range === "26-35") return age >= 26 && age <= 35;
  if (range === "36-50") return age >= 36 && age <= 50;
  if (range === "51-65") return age >= 51 && age <= 65;
  if (range === "65+") return age >= 65;
  return true;
}

// renderResults: filter users and show sidebar cards
function renderResults() {
  const list = document.getElementById("resultsList");
  const filtered = filterUsers();
  document.getElementById("nearbyCount").textContent = filtered.length;
  list.innerHTML = filtered
    .map(
      (u) => `
    <div class="result-card" onclick="openUserDetail(${u.id})">
      <div class="name">${u.name}</div>
      <div class="meta">${u.age} &middot; ${u.group} &middot; ${u.experience}</div>
      <div class="tags"><span class="tag">${u.interest}</span><span class="tag">${u.event}</span></div>
    </div>
  `,
    )
    .join("");
}

function openUserDetail(id) {
  const u = users.find((x) => x.id === id);
  if (!u) return;
  const body = document.getElementById("modalBody");
  body.innerHTML = `
    <div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;">
      <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--accent-purple),var(--accent-blue));display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:1.6rem;color:#fff;flex-shrink:0;">${u.avatar}</div>
      <div><h2 class="modal-title" style="margin-bottom:6px;">${u.name}</h2><p style="color:var(--text-secondary);font-size:0.88rem;">${u.age} years &middot; ${u.location} &middot; ${u.experience} &middot; ${u.interest}</p></div>
    </div>
    <h3 style="font-family:var(--font-display);font-weight:600;margin:18px 0 8px;font-size:1.05rem;">About</h3>
    <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.6;">Practicing ${u.interest} with the ${u.group} group. Currently focused on ${u.event.toLowerCase()}.</p>
    <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">${[u.interest, u.experience, u.group].map((t) => `<span style="padding:4px 10px;border-radius:12px;background:rgba(139,92,246,0.12);color:var(--accent-purple);font-size:0.8rem;font-weight:500;">${t}</span>`).join("")}</div>
  `;
  openModal("detailModal");
}

function renderResources(category) {
  const grid = document.getElementById("resourcesGrid");
  const items = resourcesData.filter((r) => r.category === category);
  grid.innerHTML = items
    .map(
      (r) => `
    <article class="resource-card" onclick="toast('Resource opened: ${r.title}', 'info')">
      <h3>${r.title}</h3>
      <p class="description">${r.desc}</p>
      <div class="resource-meta">${r.meta.map((m) => `<span>${m}</span>`).join("")}</div>
      <div class="tags">${r.tags.map((t) => `<span>${t}</span>`).join("")}</div>
    </article>
  `,
    )
    .join("");
}

// renderEvents: sort and display event cards
function renderEvents() {
  const grid = document.getElementById("eventsGrid");
  const sorted = [...events].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  const sortMode = document.getElementById("eventsSort").value;
  if (sortMode === "popularity") sorted.sort((a, b) => b.attend - a.attend);
  if (sortMode === "price") sorted.sort((a, b) => a.price - b.price);
  grid.innerHTML = sorted
    .map((e) => {
      const d = new Date(e.date);
      const month = d.toLocaleString("en", { month: "short" });
      const day = d.getDate();
      return `
      <article class="event-card" onclick="openEventDetail(${e.id})">
        <div class="event-header">
          <div class="date-block"><span class="month">${month}</span><span class="day">${day}</span></div>
          <h3>${e.title}</h3>
        </div>
        <div class="event-body">
          <div class="meta-row">
            <span>${e.time}</span><span>${e.type}</span><span>${e.age}</span><span>${e.level}</span>
          </div>
          <div class="tags">${e.tags.map((t) => `<span>${t}</span>`).join("")}</div>
          <p>${e.desc}</p>
        </div>
        <div class="event-footer">
          <span style="font-size:0.85rem;color:var(--text-muted);">${e.attend}/${e.max} attending</span>
          <span class="price ${e.price === 0 ? "free" : ""}">${e.price === 0 ? "Free" : "£" + e.price}</span>
        </div>
      </article>
    `;
    })
    .join("");
}

function openEventDetail(id) {
  const e = events.find((x) => x.id === id);
  if (!e) return;
  const body = document.getElementById("modalBody");
  body.innerHTML = `<h2 class="modal-title">${e.title}</h2><p style="color:var(--text-secondary);margin-bottom:14px;">${new Date(e.date).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at ${e.time}</p><p style="font-size:0.92rem;line-height:1.6;color:var(--text-main);">${e.desc}</p><div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">${e.tags.map((t) => `<span style="padding:4px 10px;border-radius:12px;background:rgba(139,92,246,0.12);color:var(--accent-purple);font-size:0.8rem;font-weight:500;">${t}</span>`).join("")}</div>`;
  openModal("detailModal");
}

function loadMoreEvents() {
  events.push({
    id: 7,
    title: "Lorem ipsum dolor sit amet.",
    date: "2026-01-28",
    time: "20:00",
    type: "outdoor",
    age: "all",
    level: "beginner",
    price: 0,
    lat: 51.52,
    lng: -0.1,
    tags: ["qigong", "outdoor"],
    desc: "Lorem ipsum dolor sit amet.",
    attend: 10,
    max: 25,
  });
  renderEvents();
  toast("More events loaded", "success");
}

function refreshEvents() {
  renderEvents();
}

// renderCommunity: stats and group cards
function renderCommunity() {
  document.getElementById("totalMembers").textContent = users.length * 3;
  document.getElementById("totalGroups").textContent = groups.length;
  document.getElementById("totalEvents").textContent = events.length + 3;
  document.getElementById("totalCountries").textContent = 12;
  document.getElementById("communityGroups").innerHTML = groups
    .map(
      (g) => `
    <div class="group-card">
      <h4>${g.name}</h4>
      <p class="members">${g.members} members</p>
      <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:10px;">${g.desc}</p>
      <div class="tags">${g.tags.map((t) => `<span class="group-tag">${t}</span>`).join("")}</div>
    </div>
  `,
    )
    .join("");
}

function handleCreateEvent(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const title = f.get("title");
  events.push({
    id: Date.now(),
    title,
    date: f.get("date"),
    time: f.get("time"),
    type: f.get("type"),
    age: f.get("ageGroup"),
    level: f.get("level"),
    price: parseFloat(f.get("price") || 0),
    lat: 51.507,
    lng: -0.127,
    tags: ["new"],
    desc: f.get("description"),
    attend: 1,
    max: parseInt(f.get("maxParticipants") || 20),
  });
  closeModal("createEventModal");
  e.target.reset();
  document.getElementById("tagList").innerHTML = "";
  renderEvents();
  toast("Event created!", "success");
}

function openModal(id) {
  document.getElementById(id).classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  document.body.style.overflow = "";
}

function toast(msg, type = "info") {
  const container = document.getElementById("toastContainer");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-dot"></span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity .3s";
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// Tag input helper
function setupTagInput() {
  const input = document.querySelector("#tagInput input");
  if (!input) return;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      const list = document.getElementById("tagList");
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.innerHTML = `${val}<button onclick="this.parentElement.remove()">×</button>`;
      list.appendChild(tag);
      input.value = "";
    }
  });
}
document.addEventListener("DOMContentLoaded", init);
