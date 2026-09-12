# Configurer et déployer le site — Supabase + Vercel

Le site (`index.html` + `site.js`) fonctionne déjà pour les sections Programme
et Infos pratiques. Il ne manque que Supabase pour activer le **RSVP** et la
**galerie photos**.

## 1. Personnaliser le contenu

`site.js`, objet `CONFIG` en haut : date, adresse, programme, hôtels.
`index.html` : rechercher "Camille" / "Antoine" et le numéro de contact.

## 2. Créer le projet Supabase

Si vous avez déjà un compte, `supabase.com/dashboard` → **New project**
(gratuit, tier Free largement suffisant : 500 Mo DB, 1 Go Storage, 50k
utilisateurs auth actifs/mois).

Récupérez **Project URL** et **anon public key** dans
`Project Settings → API`, à coller dans `site.js` (`SUPABASE_URL`,
`SUPABASE_ANON_KEY`).

## 3. Activer les connexions anonymes

`Authentication → Providers → Anonymous Sign-ins` → activer.

Les invités n'ont pas de compte : chaque visite crée une session anonyme
(role `authenticated` côté RLS), ce qui suffit à distinguer "quelqu'un passé
par le site" d'un bot random qui trouverait l'URL de l'API.

## 4. Tables + RLS

SQL Editor → coller et exécuter :

```sql
-- RSVP
create table rsvp (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  presence text not null,
  nombre int default 1,
  regime text,
  message text,
  created_at timestamptz default now()
);
alter table rsvp enable row level security;

create policy "insert_rsvp_authenticated"
on rsvp for insert
to authenticated
with check (true);
-- pas de policy select : lecture uniquement via le dashboard (service role)

-- Photos
create table photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  storage_path text not null,
  created_at timestamptz default now()
);
alter table photos enable row level security;

create policy "insert_photos_authenticated"
on photos for insert
to authenticated
with check (true);

create policy "select_photos_public"
on photos for select
to public
using (true);
```

## 5. Realtime sur la table `photos`

Table Editor → table `photos` → icône Realtime (ou `Database → Replication`)
→ activer. C'est ce qui permet aux nouvelles photos d'apparaître en direct
chez tout le monde sans recharger la page.

## 6. Storage bucket

`Storage → New bucket` → nom `photos` → **Public bucket** activé (lecture
publique directe par URL, sans policy SELECT nécessaire sur `storage.objects`).

Limiter les uploads : dans les réglages du bucket, `File size limit` → 15 MB,
`Allowed MIME types` → `image/*`.

Puis SQL Editor pour la policy d'écriture :

```sql
create policy "insert_photos_bucket_authenticated"
on storage.objects for insert
to authenticated
with check (bucket_id = 'photos');
```

## 7. Déployer sur Vercel

Le site est 100% statique (pas de build), donc soit :

```bash
npm i -g vercel
cd site-mariage
vercel        # suit les prompts, déploie en preview
vercel --prod # met en prod
```

Soit via GitHub : push le dossier dans un repo, `Import Project` sur
vercel.com, laisser le preset sur **Other** (pas de build command, output = `/`).

Aucune variable d'environnement Vercel nécessaire : `SUPABASE_URL` et
`SUPABASE_ANON_KEY` sont déjà en dur dans `site.js` — c'est normal, la clé
anon est publique par conception (protégée par les policies RLS ci-dessus,
pas par le secret).

## 8. Le QR code

Se génère automatiquement depuis l'URL de la page une fois en ligne (pointe
vers `#galerie`). Rien à configurer, juste une capture d'écran à imprimer une
fois le site déployé sur son domaine final.

## Pour aller plus loin

- **Réponses RSVP** : Table Editor → `rsvp`, ou export CSV depuis le dashboard.
- **Toutes les photos** : Storage → bucket `photos` → sélection + download.
- Si le trafic dépasse le tier gratuit un soir de mariage, c'est peu probable
  (quelques dizaines de Mo par photo compressée, quelques dizaines d'invités) —
  mais Supabase passe en pay-as-you-go sans interruption si besoin.
