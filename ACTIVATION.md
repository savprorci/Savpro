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
