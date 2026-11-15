# Mise en place de Supabase (≈ 15 min)

Supabase fournit la base de données, la connexion admin et le stockage des photos.

## 1. Créer le projet
1. Va sur https://supabase.com, crée un compte, puis **New project**.
2. Nom : `sav-pro-ci` · choisis un mot de passe de base de données (note-le) · région proche de la Côte d'Ivoire (par exemple Europe).
3. Attends la fin de la création (1 à 2 minutes).

## 2. Créer les tables et la sécurité
1. Menu **SQL Editor → New query**.
2. Colle le contenu de `supabase/schema.sql`, puis **Run**.
3. Nouvelle requête : colle `supabase/seed.sql`, puis **Run** (importe les 66 produits).

## 3. Envoyer les photos
1. Menu **Storage → bucket `products`** (créé par le schéma).
2. **Upload files** et sélectionne tout le contenu de `assets/img/` (`0.jpg` … `65.jpg`).

## 4. Créer ton compte administrateur
1. Menu **Authentication → Users → Add user → Create new user** : ton e-mail + un mot de passe solide.
2. Retourne dans **SQL Editor** et lance (avec ton e-mail) :
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'ton-email@exemple.com';
   ```
3. Dans **Authentication → Sign In / Providers**, désactive les inscriptions publiques (« Allow new users to sign up »).

## 5. Récupérer les clés du site
Menu **Project Settings → API** :
- **Project URL** : `https://xxxx.supabase.co`
- **anon public key** : clé publique, prévue pour être visible dans le site.

Ne communique et ne publie **jamais** la clé `service_role` ni le mot de passe de la base.

## 6. Connecter le site
1. Ouvre `config.js` et remplace `COLLE_ICI_LA_CLE_ANON_PUBLIC` par la clé **anon public** (ou **publishable**) de l'étape 5.
2. Publie sur GitHub (`git add . && git commit -m "Connexion Supabase" && git push`).
3. Ouvre `https://<ton-compte>.github.io/<ton-depot>/admin.html`, connecte-toi avec le compte admin de l'étape 4.

## 7. Utilisation au quotidien
- **admin.html → Catalogue** : modifier un prix, la disponibilité, ajouter un produit ou changer une photo. C'est visible sur le site immédiatement, sans git.
- **admin.html → Demandes** : les demandes de dépannage envoyées depuis le site, avec un bouton de réponse WhatsApp.
- Si la base est injoignable, le site affiche le catalogue intégré à `index.html`.
