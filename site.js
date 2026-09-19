/* ============================================================
   1) CONFIG DU MARIAGE — à personnaliser
   Tout ce qui est vide ("") ou en tableau vide ([]) affichera
   un texte "à venir" à la place sur le site, sans rien casser.
   ============================================================ */
const CONFIG = {
  prenom1: "Anaïs",
  prenom2: "Jimmy",

  // Heure du jour J pas encore connue : le compte à rebours compte
  // jusqu'à minuit ce jour-là. Mettez la vraie heure ici dès que vous
  // l'avez (format 24h), ex: "2027-10-09T14:00:00".
  dateISO: "2027-10-09T00:00:00",
  regionAffichee: "Sacy & Pierry, Marne",

  programme: [
    { heure: "Horaire à venir", titre: "Mairie", lieu: "Sacy (Marne)", adresse: "Mairie de Sacy, Marne", icon: "scroll" },
    { heure: "Horaire à venir", titre: "Cérémonie religieuse", lieu: "Église de Sacy (Marne)", adresse: "Église de Sacy, Marne", icon: "chapel" },
    { heure: "Horaire à venir", titre: "Vin d'honneur", lieu: "Lieu à confirmer", adresse: "", icon: "village" },
    { heure: "Horaire à venir", titre: "Repas", lieu: "Domaine Miltat, Pierry", adresse: "Domaine Miltat, Pierry, Marne", icon: "chateau" },
  ],

  adressePrincipale: { nom: "Domaine Miltat", adresse: "Pierry, Marne" },
  dressCode: "Tenue habillée — à préciser si vous avez un thème particulier.",
  hotels: [
    { nom: "La Crapounette", detail: "Chambres d'hôtes à Pierry, accueil chaleureux — coup de cœur des voyageurs" },
    { nom: "Hôtel Margaux", detail: "Hôtel à Épernay (10 min en voiture), pour une option plus classique" },
  ],
  contactNom: "",
  contactTel: "",
  rsvpDeadline: "", // ex: "1er août 2027"
  heroPhoto: "", // ex: "photo-anais-jimmy.jpg" — mettre le fichier à côté d'index.html
};

/* Icônes ligne pour le programme */
const ICONS = {
  scroll: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h9a3 3 0 0 1 3 3v10a3 3 0 0 0 3 3H9a3 3 0 0 1-3-3V4Z"/><path d="M6 4a3 3 0 0 0-3 3v1h3"/><path d="M9 9h6M9 12.5h6"/></svg>`,
  chapel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M10.3 5.7h3.4"/><path d="M5 21V11l7-5 7 5v10"/><path d="M9.5 21v-6h5v6"/></svg>`,
  glass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10c0 4.4-3.2 7.5-5 7.5S7 8.4 7 4Z"/><path d="M12 11.5V19M9 21h6"/></svg>`,
  fork: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v6a1.6 1.6 0 0 0 1.6 1.6H9V21M6 3v4.5A1.5 1.5 0 0 0 7.5 9M10 3v4.5A1.5 1.5 0 0 1 8.5 9"/><path d="M16.5 3c-1.4 0-2.4 1.7-2.4 4.6 0 1.9.8 3 1.7 3.5V21"/></svg>`,
  village: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M4 20v-5h3v5"/><path d="M17 20v-6h3v6"/><path d="M9 20V10l3-3 3 3v10"/><path d="M12 4.2v2.6"/></svg>`,
  chateau: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M5 20V9l2-2 2 2v11"/><path d="M9 20V6h6v14"/><path d="M15 20V9l2-2 2 2v11"/></svg>`,
  default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="4"/></svg>`,
};

/* ============================================================
   2) CONFIG SUPABASE
   ============================================================ */
const SUPABASE_URL = "VOTRE_PROJET.supabase.co";
const SUPABASE_ANON_KEY = "VOTRE_ANON_KEY";
const PHOTOS_BUCKET = "photos";

/* ============================================================
   3) RENDU DU CONTENU (hero, programme, infos)
   ============================================================ */
function mapsUrl(query) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
}

function renderHero() {
  document.getElementById("heroNames").innerHTML =
    `${CONFIG.prenom1}<span class="amp">&amp;</span>${CONFIG.prenom2}`;
  document.getElementById("footerNames").textContent =
    `${CONFIG.prenom1} & ${CONFIG.prenom2}`;

  const dateStr = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .format(new Date(CONFIG.dateISO))
    .replace(/^./, (c) => c.toUpperCase());
  document.getElementById("heroDate").textContent = `${dateStr} — ${CONFIG.regionAffichee}`;

  if (CONFIG.heroPhoto) {
    const hero = document.getElementById("hero");
    hero.classList.add("has-photo");
    hero.style.backgroundImage = `url('${CONFIG.heroPhoto}')`;
  }
}

function renderProgramme() {
  const el = document.getElementById("timelineList");
  el.innerHTML = CONFIG.programme
    .map(
      (item) => `
      <div class="t-item">
        <div class="t-icon">${ICONS[item.icon] || ICONS.default}</div>
        <div>
          <div class="t-time">${item.heure}</div>
          <div class="t-title">${item.titre}</div>
          <div class="t-place">${item.lieu}</div>
          ${item.adresse ? `<a class="t-map" href="${mapsUrl(item.adresse)}" target="_blank" rel="noopener">Itinéraire →</a>` : ""}
        </div>
      </div>`
    )
    .join("");
}

function renderInfos() {
  const grid = document.getElementById("infosGrid");
  const cards = [];

  if (CONFIG.adressePrincipale) {
    cards.push(`
      <div class="info-card">
        <h3>Lieu du repas</h3>
        <p class="big">${CONFIG.adressePrincipale.nom}</p>
        <p class="small">${CONFIG.adressePrincipale.adresse}</p>
        <a class="maps-link" href="${mapsUrl(CONFIG.adressePrincipale.nom + ", " + CONFIG.adressePrincipale.adresse)}" target="_blank" rel="noopener">Ouvrir dans Google Maps →</a>
      </div>`);
  }

  cards.push(`
    <div class="info-card">
      <h3>Dress code</h3>
      <p class="small">${CONFIG.dressCode || "À préciser prochainement."}</p>
    </div>`);

  cards.push(`
    <div class="info-card">
      <h3>Où dormir</h3>
      <ul class="hotel-list">
        ${CONFIG.hotels.length
          ? CONFIG.hotels.map((h) => `<li><div class="hotel-name">${h.nom}</div><div class="hotel-detail">${h.detail}</div></li>`).join("")
          : `<li class="hotel-empty">Suggestions à venir.</li>`}
      </ul>
    </div>`);

  if (CONFIG.contactNom || CONFIG.contactTel) {
    cards.push(`
      <div class="info-card">
        <h3>Un contact sur place</h3>
        <p class="small">${[CONFIG.contactNom, CONFIG.contactTel].filter(Boolean).join(" — ")}</p>
      </div>`);
  }

  grid.innerHTML = cards.join("");
}

function renderRsvpSubtitle() {
  document.getElementById("rsvpSubtitle").textContent = CONFIG.rsvpDeadline
    ? `Merci de répondre avant le ${CONFIG.rsvpDeadline}.`
    : "Merci de nous dire si vous serez des nôtres.";
}

/* ============================================================
   4) COMPTE À REBOURS
   ============================================================ */
function startCountdown() {
  const target = new Date(CONFIG.dateISO).getTime();
  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    min: document.getElementById("cd-min"),
    sec: document.getElementById("cd-sec"),
  };
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      els.days.textContent = "0"; els.hours.textContent = "0";
      els.min.textContent = "0"; els.sec.textContent = "0";
      return;
    }
    els.days.textContent = Math.floor(diff / 86400000);
    els.hours.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0");
    els.min.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    els.sec.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   5) QR CODE
   ============================================================ */
function renderQRCode() {
  const url = window.location.href.split("#")[0] + "#galerie";
  // eslint-disable-next-line no-undef
  new QRCode(document.getElementById("qrcode"), {
    text: url, width: 130, height: 130, colorDark: "#3A2233", colorLight: "#FFFDF9",
  });
}

/* ============================================================
   6) SUPABASE — RSVP + Galerie photos
   ============================================================ */
async function initSupabase() {
  const isConfigured =
    SUPABASE_URL && !SUPABASE_URL.startsWith("VOTRE_") &&
    SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.startsWith("VOTRE_");

  if (!isConfigured) {
    document.getElementById("uploadStatus").textContent = "Galerie non activée pour l'instant.";
    return null;
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(`https://${SUPABASE_URL.replace(/^https?:\/\//, "")}`, SUPABASE_ANON_KEY);
  const { error } = await supabase.auth.signInAnonymously();
  if (error) console.error("Connexion anonyme échouée:", error.message);
  return supabase;
}

function wireRSVP(supabase) {
  const form = document.getElementById("rsvpForm");
  const msgOut = document.getElementById("rsvpMsgOut");
  const submitBtn = document.getElementById("rsvpSubmit");

  document.querySelectorAll("#presenceGroup input[type=radio]").forEach((input) => {
    input.addEventListener("change", () => {
      document.querySelectorAll("#presenceGroup .radio-pill").forEach((p) => p.classList.remove("checked"));
      input.closest(".radio-pill").classList.add("checked");
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!supabase) {
      msgOut.textContent = "La galerie/RSVP n'est pas encore configurée — réessayez plus tard.";
      msgOut.className = "form-msg show err";
      return;
    }
    const presence = form.querySelector("input[name=presence]:checked");
    if (!presence) return;
    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi…";
    try {
      const { error } = await supabase.from("rsvp").insert({
        nom: document.getElementById("rsvpName").value.trim(),
        presence: presence.value,
        nombre: Number(document.getElementById("rsvpNb").value) || 1,
        regime: document.getElementById("rsvpRegime").value.trim(),
        message: document.getElementById("rsvpMsg").value.trim(),
      });
      if (error) throw error;
      form.reset();
      document.querySelectorAll("#presenceGroup .radio-pill").forEach((p) => p.classList.remove("checked"));
      msgOut.textContent = "Merci ! Votre réponse a bien été envoyée.";
      msgOut.className = "form-msg show ok";
    } catch (err) {
      console.error(err);
      msgOut.textContent = "Une erreur est survenue, réessayez dans un instant.";
      msgOut.className = "form-msg show err";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Envoyer ma réponse";
    }
  });
}

function wireGallery(supabase) {
  const uploadBtn = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("fileInput");
  const status = document.getElementById("uploadStatus");
  const grid = document.getElementById("galleryGrid");
  const empty = document.getElementById("galleryEmpty");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");

  function addPhotoToGrid(url, prepend) {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    img.src = url; img.loading = "lazy"; img.alt = "Photo envoyée par un invité";
    img.addEventListener("click", () => { lightboxImg.src = url; lightbox.classList.add("open"); });
    fig.appendChild(img);
    if (prepend) grid.prepend(fig); else grid.appendChild(fig);
    empty.style.display = "none";
  }

  uploadBtn.addEventListener("click", () => {
    if (!supabase) { status.textContent = "Galerie non activée pour l'instant."; return; }
    fileInput.click();
  });

  fileInput.addEventListener("change", async () => {
    const files = Array.from(fileInput.files || []);
    if (!files.length || !supabase) return;
    status.textContent = `Envoi de ${files.length} photo(s)…`;
    let done = 0;
    for (const file of files) {
      try {
        const path = `${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`;
        const { error: upErr } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
        const { error: dbErr } = await supabase.from("photos").insert({ url: pub.publicUrl, storage_path: path });
        if (dbErr) throw dbErr;
        done++;
        status.textContent = `${done}/${files.length} photo(s) envoyée(s)…`;
      } catch (err) {
        console.error(err);
        status.textContent = "Une photo n'a pas pu être envoyée — réessayez.";
      }
    }
    status.textContent = `${done} photo(s) ajoutée(s) à la galerie. Merci !`;
    fileInput.value = "";
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.id === "lightboxClose") lightbox.classList.remove("open");
  });

  if (!supabase) return;

  supabase.from("photos").select("url, created_at").order("created_at", { ascending: false }).limit(300)
    .then(({ data, error }) => {
      if (error) return console.error(error);
      if (!data || !data.length) { empty.style.display = "block"; return; }
      data.forEach((row) => addPhotoToGrid(row.url, false));
    });

  supabase.channel("photos-live")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "photos" }, (payload) => addPhotoToGrid(payload.new.url, true))
    .subscribe();
}

/* ============================================================
   INTRO — portail qui s'ouvre à l'arrivée sur le site
   Ne se rejoue pas si l'invité revient plus tard (même onglet).
   ============================================================ */
function playIntro() {
  const intro = document.getElementById("intro");
  if (!intro) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let alreadySeen = false;
  try { alreadySeen = sessionStorage.getItem("introSeen") === "1"; } catch (e) { /* stockage indisponible, tant pis */ }

  if (alreadySeen || reduced) {
    intro.classList.add("hidden");
    return;
  }

  document.body.style.overflow = "hidden";
  setTimeout(() => {
    intro.classList.add("open");
    document.body.style.overflow = "";
    try { sessionStorage.setItem("introSeen", "1"); } catch (e) { /* tant pis */ }
    setTimeout(() => intro.classList.add("hidden"), 1300);
  }, 450);
}

/* ============================================================
   INIT
   ============================================================ */
(async function init() {
  playIntro();
  renderHero();
  renderProgramme();
  renderInfos();
  renderRsvpSubtitle();
  startCountdown();
  renderQRCode();

  const supabase = await initSupabase();
  wireRSVP(supabase);
  wireGallery(supabase);
})();
