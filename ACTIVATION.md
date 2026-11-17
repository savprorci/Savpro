# Procédure d'activation : GitHub + Supabase

Objectif : site en ligne, catalogue lu depuis Supabase, photos visibles, enregistrement possible depuis `admin.html`.

> **Premier réflexe** : ouvre `https://<ton-compte>.github.io/<ton-depot>/diagnostic.html`, appuie sur **Lancer le diagnostic**, puis **Copier le rapport**. Chaque ligne en ✖ indique la correction à faire.

---

## PARTIE A : GitHub (publication du site)

### A1. Contenu du dépôt
À la **racine** du dépôt (pas dans un sous-dossier), on doit voir :

```
index.html   admin.html   diagnostic.html   config.js   README.md
.nojekyll    .gitignore
assets/img/  (66 photos : 0.jpg … 65.jpg)
supabase/    (schema.sql, seed.sql, fix-acces.sql)
.github/workflows/pages.yml
```

Points de vigilance :
- Si tout est dans un dossier `sav-pro-ci/`, déplace le contenu à la racine.
- Le dossier `.github` (commence par un point) est souvent oublié lors d'un envoi par glisser-déposer. Utilise `git push`, ou **Add file → Create new file** avec le nom `.github/workflows/pages.yml` et colle le contenu.
- Le dossier `assets/img/` doit contenir 66 fichiers. Test : ouvre `…/assets/img/0.jpg` dans le navigateur, une photo doit s'afficher.

### A2. Activer GitHub Pages
1. Dépôt → **Settings → Pages**.
2. **Build and deployment → Source : GitHub Actions**.

### A3. Vérifier le déploiement
1. Onglet **Actions** : le dernier « Déploiement GitHub Pages » doit avoir une coche verte (1 à 2 min).
2. Croix rouge : ouvre l'exécution et copie le message d'erreur.
3. Aucun workflow listé : `.github/workflows/pages.yml` n'est pas dans le dépôt (voir A1).

### A4. Ouvrir la bonne version
- Adresse : `https://<ton-compte>.github.io/<ton-depot>/`
- Recharge avec **Ctrl+F5** (ou navigation privée) pour éviter l'ancienne version en cache.

---

## PARTIE B : Supabase (base de données)

### B1. Tables et sécurité
1. Menu **SQL Editor → New query**.
2. Colle `supabase/schema.sql` → **Run** (erreur « already exists » = déjà fait, sans gravité).
3. Colle `supabase/seed.sql` → **Run** (importe/actualise les 66 produits).

### B2. Droits d'accès à l'API (étape qui bloque le plus souvent)
1. **SQL Editor → New query**.
2. Colle `supabase/fix-acces.sql` → **Run**.
3. Résultats attendus en bas : `nb_produits = 66`, `nb_admins ≥ 1` (après B3).

### B3. Compte administrateur
1. **Authentication → Users** : ton utilisateur doit exister et être **confirmé** (sinon : ouvrir l'utilisateur → *Confirm user*).
2. **SQL Editor** (avec ton e-mail) :
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'ton-email@exemple.com'
   on conflict do nothing;
   ```
3. Contrôle : `select * from public.admins;` renvoie 1 ligne.

### B4. API et clé
1. **Project Settings → API** : l'API de données (Data API) doit être activée, avec le schéma `public` exposé.
2. **Project Settings → API Keys** : copie la clé **publishable** (`sb_publishable_…`).
3. Colle-la dans `config.js` (champ `SUPABASE_ANON_KEY`) et publie. Jamais la clé « secret » / `service_role`.

### B5. Photos (facultatif au départ)
- Le site affiche déjà les photos depuis `assets/img/` (GitHub).
- Pour les gérer en ligne : **Storage** → bucket `products` (public). Les photos ajoutées depuis `admin.html` y sont envoyées automatiquement.
- Si l'envoi par le tableau de bord Supabase échoue (« NetworkUnreachable »), c'est la connexion : envoie par petits lots ou change de réseau.

---

## PARTIE C : Contrôle final

| Test | Résultat attendu |
|---|---|
| `diagnostic.html` → Lancer | Tout en ✔ côté GitHub et Supabase |
| `diagnostic.html` → Tester l'admin | « Compte reconnu » + « Écriture autorisée » |
| Site (`index.html`) | 66 produits, photos visibles |
| `admin.html` → modifier un prix → Enregistrer | « Enregistré · visible sur le site » |
| Recharger le site | Nouveau prix affiché |

## Symptômes courants

| Symptôme | Cause probable | Correction |
|---|---|---|
| Page blanche / 404 | Pages non activé ou mauvais dossier | A1 + A2 |
| Pas de photos | `assets/img/` non publié | A1 |
| Catalogue vide ou ancien | Lecture Supabase refusée (le site retombe sur la copie intégrée) | B2 et B4 |
| « Ce compte n'a pas les droits administrateur » | Ligne manquante dans `admins` | B3 |
| « Connexion refusée » | Mot de passe faux ou e-mail non confirmé | B3 |
| Enregistrement impossible | Droits manquants ou compte non admin | B2 + B3 |

---

# VERSION 2 : rôles, 2FA, commissions, journal, Speed rouge et blanc

## Ce qui change
- **Espace pro** (`admin.html`) : connexion avec code 2FA (application d'authentification), session mémorisée sur l'appareil (connexion automatique).
- **Rôles** : administrateur (tout), partenaire (ses produits + ses commissions), technicien (demandes de dépannage).
- **Création de contenu par les partenaires** : leurs produits sont publiés après validation par l'administrateur.
- **Commission de 10 %** par vente de produit d'un partenaire (taux modifiable par partenaire). L'administrateur enregistre la vente ; la commission est calculée automatiquement, puis marquée « payée » (mobile money, virement…) avec la référence.
- **Journal d'activité** enregistré par le serveur : toutes les modifications (produits, ventes, demandes, équipe) et les événements du site (visites, pages, produits vus, clics WhatsApp et appel, demandes de dépannage, connexions pro).
- **Site** : noms de produits en majuscules agrandis ; page Speed Dépannage en rouge et blanc.
- **Correction** : le bouton « Envoyer la demande urgente » était cassé par la connexion Supabase (conflit de nom de fonction) ; il fonctionne à nouveau.

## Ordre d'activation (important)

### 1. Supabase : activer la 2FA
**Authentication → Sign In / Providers → Multi-Factor Authentication** : activer **TOTP** (activé par défaut sur la plupart des projets).

### 2. Supabase : lancer la version 2
1. Vérifie que ton compte admin est déjà reconnu (ancienne table `admins`) : il est migré automatiquement.
2. **SQL Editor → New query** : colle `supabase/v2-roles-commissions-audit.sql` → **Run**.
3. Résultat attendu : `nb_admins ≥ 1`, `nb_produits = 66`.

> Dès cette étape, toute écriture exige le code 2FA : connecte-toi avec `admin.html` et active la 2FA **avant** de modifier quoi que ce soit.
> Si tu es bloqué : dans le SQL Editor, remplace le corps de `public.is_aal2()` par `select true` (désactive temporairement l'exigence 2FA).

### 3. GitHub
Remplace `index.html`, `admin.html` et `diagnostic.html`, ajoute `supabase/v2-roles-commissions-audit.sql`, puis `git push` et attends la coche verte.

### 4. Première connexion admin
1. Ouvre `admin.html`, e-mail et mot de passe.
2. Scanne le QR code avec Google Authenticator / Microsoft Authenticator / Authy, saisis le code à 6 chiffres.
3. Les connexions suivantes sur le même appareil sont automatiques ; le code n'est redemandé que sur un nouvel appareil ou après déconnexion.

### 5. Ajouter un partenaire ou un technicien
1. Supabase → **Authentication → Users → Add user** (e-mail + mot de passe provisoire, cocher « Auto confirm »).
2. `admin.html` → **Équipe → Ajouter un membre** : e-mail, nom, rôle, commission (10 par défaut).
3. La personne se connecte sur `admin.html` et active sa propre 2FA.

### 6. Enregistrer une vente et payer la commission
1. **Ventes & commissions → Enregistrer une vente** : produit, montant, date, client.
2. Si le produit appartient à un partenaire, la commission de 10 % est calculée et apparaît « À payer ».
3. Après paiement au partenaire : **Marquer la commission payée** + moyen et référence.

### Téléphone perdu (2FA)
Supabase → Authentication → Users → l'utilisateur → supprimer le facteur d'authentification ; il en recréera un à la prochaine connexion.


---

# PWA : application installable

## Fichiers (tous à la RACINE du dépôt)
`manifest.json`, `sw.js`, `offline.html`, dossiers `icons/` (7 images) et `screenshots/` (4 images), plus `index.html` et `admin.html` mis à jour.

## Ce que ça apporte
- **Installation** sur l'écran d'accueil (Android, ordinateur, iPhone) avec l'icône SAV PRO.
- **Démarrage rapide** et **mode hors ligne** : la page s'ouvre sans réseau ; une page « Vous êtes hors ligne » propose d'appeler ou d'écrire sur WhatsApp.
- **Raccourcis** (appui long sur l'icône) : Speed Dépannage, Catalogue, Espace pro.
- **Mises à jour automatiques** : en ligne, le site charge toujours la dernière version ; les photos sont gardées en cache.
- Les données Supabase (catalogue, comptes, 2FA, ventes, journal) ne sont **jamais** mises en cache.

## Installer l'application
- **Android (Chrome)** : un bandeau « Installer SAV PRO » apparaît, ou menu ⋮ → Installer l'application.
- **iPhone (Safari)** : Partager → Sur l'écran d'accueil.
- **Ordinateur (Chrome/Edge)** : icône d'installation dans la barre d'adresse.

## Vérifier
1. `diagnostic.html` : la section « 3. PWA » doit être entièrement en ✔.
2. Chrome → F12 → onglet Application : Manifest sans erreur, Service Workers « activated ».

## Publier une nouvelle version
Après un changement important, augmente `VERSION` dans `sw.js` (`savpro-v2`, `savpro-v3`…) pour forcer le renouvellement du cache.


## Erreur PWABuilder (name, icons, short_name, start_url en rouge)
PWABuilder affiche ces quatre champs en rouge quand il **ne trouve pas le manifest**. Causes, de la plus fréquente à la plus rare :
1. **L'ancien `index.html` est encore en ligne** (sans la ligne `<link rel="manifest">`). Remplace-le par la version du zip.
2. **`manifest.json` n'est pas à la racine du dépôt** ou le dossier `icons/` / `screenshots/` manque.
3. **Mauvaise adresse saisie** : utilise exactement `https://savprorci.github.io/Sav-Pro/` (avec le `/` final et les majuscules).
4. **Résultat gardé en mémoire par PWABuilder** : après la correction, ouvre `https://savprorci.github.io/Sav-Pro/manifest.json` dans le navigateur (le JSON doit s'afficher), puis relance l'analyse dans PWABuilder.

Contrôle rapide : ouvre `…/Sav-Pro/diagnostic.html`, appuie sur « Lancer le diagnostic » et regarde la section **3. PWA**. Chaque ✖ indique le fichier à renvoyer.

Remarque : `manifest.json` contient le chemin du dépôt (`/Sav-Pro/`). Si tu passes sur un domaine à toi (racine du site), remplace `/Sav-Pro/` par `/` dans `id`, `start_url`, `scope` et `shortcuts`.


---

# VERSION 3 : connexion par e-mail, slides modifiables, images agrandies

## Ce qui change
- **Connexion unique par e-mail** (espace pro) : tu saisis ton e-mail, tu reçois un code à usage unique, puis le code 2FA de ton application d'authentification. Plus de mot de passe à retenir. La connexion automatique sur l'appareil est conservée.
- **Slides de l'accueil modifiables par l'administrateur** (onglet **Slides** de `admin.html`) : titre, texte, bouton, page ouverte, ordre, affichage/masquage, et média = photo d'un produit, image téléversée ou vidéo (MP4/WebM, 25 Mo max). Les modifications sont visibles tout de suite sur le site ; sans slide en base, le site garde ses slides d'origine.
- **Fenêtres images agrandies** (slides, fiches produits, détail) et **image entière visible** (les photos étaient rognées dans les petites fenêtres sur téléphone).

## A. Connexion par e-mail : à configurer dans Supabase (obligatoire)
L'envoi d'e-mails intégré à Supabase est réservé aux tests : environ 2 e-mails par heure et seulement vers les membres de ton organisation Supabase. Il faut donc un service d'envoi (SMTP).

1. Crée un compte gratuit chez un service d'envoi (Brevo, Resend, Mailjet…) et vérifie ton adresse ou ton domaine d'expéditeur.
2. Supabase → **Authentication → Emails → SMTP Settings** : active « Custom SMTP » et saisis serveur, port, identifiant, mot de passe et adresse d'expédition.
3. Supabase → **Authentication → Emails → Templates → Magic link** : objet `Votre code de connexion SAV PRO`, contenu = fichier `supabase/email-template-connexion.html` (il contient `{{ .Token }}`, le code à 6 chiffres).
4. Supabase → **Authentication → URL Configuration** : Site URL = `https://savprorci.github.io/Sav-Pro/admin.html`.
5. Supabase → **Authentication → Rate Limits** : relève la limite d'e-mails par heure si besoin.
6. Chaque membre doit avoir un compte (Authentication → Users) et un rôle (onglet **Équipe**) : un e-mail inconnu ne reçoit aucun code.

Tant que le SMTP n'est pas prêt, le lien **« Se connecter avec un mot de passe »** reste disponible. Quand tout fonctionne, mets `PASSWORD_LOGIN: false` dans `config.js` pour que l'e-mail soit le seul mode de connexion.

## B. Slides : à activer
1. SQL Editor → colle `supabase/sql/07_slides.sql` → Run (crée la table, le stockage `slides` et recopie les 7 slides d'origine).
2. `admin.html` → onglet **Slides** : ↑ ↓ pour l'ordre, **Modifier** pour le texte et le média, **+ Nouvelle slide**.
3. Variables possibles dans les textes : `{nc}` (références du catalogue), `{nl}` (équipements en location), `{dom}` (domaines).

Conseils vidéo : MP4 (H.264), 720p, 10 à 15 secondes, moins de 25 Mo ; elle se lance sans son, en boucle, quand sa slide s'affiche. Image : format paysage, 1600 px de large au plus (réduite automatiquement).

## C. Publier
Envoie sur GitHub `index.html`, `admin.html`, `sw.js`, `config.js` et le dossier `supabase/`, puis attends la coche verte. Le cache du service worker passe en version `savpro-v3` : les téléphones se mettent à jour au prochain chargement en ligne.


---

# VERSION 4 : apparence modifiable (fond d'écran, couleurs des blocs, textes fins)

## Ce que l'administrateur peut régler (admin.html → onglet « Apparence »)
- **Fond d'écran** : image (JPEG/PNG), affichage « couvrir l'écran » ou « mosaïque », **voile de lisibilité** réglable (0 à 90 %) pour que les textes restent lisibles.
- **Couleur de fond de la page.**
- **Couleur des blocs** (cartes produits, tuiles, formules, fenêtres) : couleur 1 + couleur 2 (dégradé), couleur du liseré et du prix, texte clair/foncé/automatique. 5 modèles prêts : Bleu (origine), Rouge, Clair, Sombre, Vert. La page Speed Dépannage garde son rouge et blanc.
- **Couleur du slider** (bandeau de l'accueil).
- **Textes des articles** : épaisseur **Gras / Semi-gras / Normal / Fin**, et casse MAJUSCULES ou normale.
- Un **aperçu** s'affiche avant d'enregistrer ; **Rétablir l'apparence d'origine** remet tout à zéro.

## Activer
1. Supabase → SQL Editor : lance `supabase/sql/08_apparence.sql` (étapes 4 et 7 déjà faites).
2. GitHub : remplace `index.html`, `admin.html`, `sw.js`, `config.js` ; ajoute `supabase/sql/08_apparence.sql`.
3. `admin.html` → Apparence → règle, vérifie l'aperçu, **Enregistrer**. Les visiteurs voient le changement au prochain chargement (Ctrl+F5 si besoin).

## Sans Supabase (fichier HTML seul)
Dans `config.js`, la ligne `THEME` accepte les mêmes réglages (exemple en commentaire) : `wall_url`, `wall_overlay`, `blk_c1`, `blk_c2`, `blk_accent`, `art_weight` (300 = fin), etc. Le réglage enregistré dans l'admin a priorité.

## Conseils
- Fond d'écran : image légère (moins de 500 Ko après envoi, elle est réduite à 1600 px), voile de 40 à 70 % si l'image est chargée.
- Blocs clairs : choisis « Texte des blocs » automatique ; le site passe tout seul en texte foncé.
- Textes « Fin » : plus élégants en grande taille ; garde « Normal » si la lisibilité en plein soleil compte.
