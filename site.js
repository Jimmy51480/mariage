/* ============================================================
   1) CONFIG DU MARIAGE — à personnaliser
   ============================================================ */
const CONFIG = {
  dateISO: "2027-06-12T16:00:00", // format AAAA-MM-JJThh:mm:ss, utilisé pour le compte à rebours
  lieuAdresse: "12 chemin des Vignes, 33210 Langon",

  programme: [
    { heure: "16h00", titre: "Cérémonie", lieu: "Domaine des Tilleuls — jardin" },
    { heure: "17h30", titre: "Cocktail", lieu: "Terrasse" },
    { heure: "20h00", titre: "Dîner", lieu: "Grange" },
    { heure: "22h30", titre: "Soirée dansante", lieu: "Grange" },
  ],

  hotels: [
    { nom: "Château de Malle", detail: "10 min en voiture — chambres à partir de 120€" },
    { nom: "Hôtel ibis Langon", detail: "8 min en voiture — option économique" },
    { nom: "Camping des Vignes", detail: "5 min à pied — emplacements et mobil-homes" },
  ],
};

/* ============================================================
   2) CONFIG SUPABASE — à remplacer par votre propre projet
   Project Settings → API → Project URL / anon public key.
   La clé "anon" est publique par design (protégée par les policies RLS),
   elle peut être exposée côté client sans risque.
   Voir SETUP.md pour la marche à suivre complète.
   ============================================================ */
const SUPABASE_URL = "https://ukbbykzddovzkjwdizpj.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrYmJ5a3pkZG92emtqd2RpenBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMjI4NzYsImV4cCI6MjEwNDc5ODg3Nn0.mjCWGFYxEqiRHpYmXDRDPd4RTuH1RSsH3Nf0XGg1NTc";
const PHOTOS_BUCKET = "photos";

/* ============================================================
   3) RENDU DU CONTENU STATIQUE (programme, hôtels, adresse)
   ============================================================ */
function renderProgramme() {
  const el = document.getElementById("timelineList");
  el.innerHTML = CONFIG.programme
    .map(
      (item) => `
      <div class="t-item">
        <div class="t-time">${item.heure}</div>
        <div class="t-dot-col"><div class="t-dot"></div></div>
        <div class="t-body">
          <div class="t-title">${item.titre}</div>
          <div class="t-place">${item.lieu}</div>
        </div>
      </div>`
    )
    .join("");
}

function renderHotels() {
  const el = document.getElementById("hotelList");
  el.innerHTML = CONFIG.hotels
    .map(
      (h) => `<li><div class="hotel-name">${h.nom}</div><div class="hotel-detail">${h.detail}</div></li>`
    )
    .join("");
}

function renderMapsLink() {
  const el = document.getElementById("mapsLink");
  el.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.lieuAdresse);
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
      els.days.textContent = "0";
      els.hours.textContent = "0";
      els.min.textContent = "0";
      els.sec.textContent = "0";
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    els.days.textContent = d;
    els.hours.textContent = String(h).padStart(2, "0");
    els.min.textContent = String(m).padStart(2, "0");
    els.sec.textContent = String(s).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   5) QR CODE — pointe automatiquement vers la page en cours
   ============================================================ */
function renderQRCode() {
  const url = window.location.href.split("#")[0] + "#galerie";
  // eslint-disable-next-line no-undef
  new QRCode(document.getElementById("qrcode"), {
    text: url,
    width: 140,
    height: 140,
    colorDark: "#1E3527",
    colorLight: "#FBF8F2",
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
    console.warn(
      "Supabase n'est pas configuré : le RSVP et la galerie ne fonctionneront pas tant que SUPABASE_URL / SUPABASE_ANON_KEY (dans site.js) n'ont pas été renseignés. Voir SETUP.md."
    );
    document.getElementById("uploadStatus").textContent = "Galerie non activée pour l'instant.";
    return null;
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(`https://${SUPABASE_URL.replace(/^https?:\/\//, "")}`, SUPABASE_ANON_KEY);

  const { error } = await supabase.auth.signInAnonymously();
  if (error) console.error("Connexion anonyme échouée:", error.message);

  return supabase;
}

/* ---- RSVP ---- */
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
      msgOut.textContent = "La galerie/RSVP n'est pas encore configurée par les mariés — réessayez plus tard.";
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

/* ---- Galerie photos ---- */
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
    img.src = url;
    img.loading = "lazy";
    img.alt = "Photo envoyée par un invité";
    img.addEventListener("click", () => {
      lightboxImg.src = url;
      lightbox.classList.add("open");
    });
    fig.appendChild(img);
    if (prepend) grid.prepend(fig);
    else grid.appendChild(fig);
    empty.style.display = "none";
  }

  uploadBtn.addEventListener("click", () => {
    if (!supabase) {
      status.textContent = "Galerie non activée pour l'instant.";
      return;
    }
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
        const { error: upErr } = await supabase.storage
          .from(PHOTOS_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
        const { error: dbErr } = await supabase.from("photos").insert({
          url: pub.publicUrl,
          storage_path: path,
        });
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

  // Chargement initial
  supabase
    .from("photos")
    .select("url, created_at")
    .order("created_at", { ascending: false })
    .limit(300)
    .then(({ data, error }) => {
      if (error) return console.error(error);
      if (!data || !data.length) {
        empty.style.display = "block";
        return;
      }
      data.forEach((row) => addPhotoToGrid(row.url, false));
    });

  // Nouvelles photos en direct (Supabase Realtime)
  supabase
    .channel("photos-live")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "photos" },
      (payload) => addPhotoToGrid(payload.new.url, true)
    )
    .subscribe();
}

/* ============================================================
   INIT
   ============================================================ */
(async function init() {
  document.getElementById("heroDate").textContent =
    new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      .format(new Date(CONFIG.dateISO))
      .replace(/^./, (c) => c.toUpperCase()) + " — Domaine des Tilleuls, Langon";

  renderProgramme();
  renderHotels();
  renderMapsLink();
  startCountdown();
  renderQRCode();

  const supabase = await initSupabase();
  wireRSVP(supabase);
  wireGallery(supabase);
})();
