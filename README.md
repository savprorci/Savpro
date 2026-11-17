# SAV PRO Côte d'Ivoire

Application web (sans installation) du service **SAV PRO Côte d'Ivoire** : énergie, engins & dépannage.

## Fonctionnalités

- **Catalogue** : groupes électrogènes, matériels et outillages de chantier, matériels d'électricité, pièces de rechange.
- **Devis par WhatsApp** : depuis une fiche produit ou le panier.
- **Speed Dépannage** : prestations, niveaux de service (SLA), demande urgente, suivi de dossier ; appel et WhatsApp en un clic.
- **Domaines d'activité**, **localisation**, **parc**, **espace client** et **partenaires**.
- Interface responsive (mobile et ordinateur), thème blanc avec blocs bleus.

## Contact

- Téléphone / WhatsApp : +225 07 08 53 41 31
- E-mail : savprorci@gmail.com

## Structure du dépôt

```
.
├── index.html                  # Le site public (HTML, CSS, JS)
├── admin.html                  # Espace pro : 2FA, rôles, catalogue, ventes/commissions, demandes, équipe, journal
├── manifest.json               # PWA : nom, icônes, captures, raccourcis
├── sw.js                       # PWA : service worker (cache, hors ligne)
├── offline.html                # PWA : page hors ligne
├── icons/                      # PWA : icônes (192, 512, maskable, Apple, favicon)
├── screenshots/                # PWA : captures d'écran (mobile et bureau)
├── config.js                   # URL et clé publique Supabase
├── diagnostic.html             # Test automatique GitHub + Supabase
├── ACTIVATION.md               # Procédure d'activation pas à pas
├── assets/img/                 # Photos produits (<id>.jpg)
├── PHOTOS.md                   # Table produit → fichier photo
├── SUPABASE.md                 # Guide de création du backend
├── supabase/schema.sql         # Tables, sécurité, stockage
├── supabase/seed.sql           # Import des 66 produits
├── supabase/fix-acces.sql      # Droits d'accès à l'API
├── supabase/sql/               # Fichiers numérotés 01 à 07 pour le SQL Editor
├── supabase/email-template-connexion.html  # Modèle d'e-mail du code de connexion
├── supabase/v2-roles-commissions-audit.sql  # Rôles, 2FA, commissions 10 %, journal
├── .nojekyll                   # Désactive Jekyll sur GitHub Pages
├── .gitignore
├── .github/workflows/pages.yml # Déploiement automatique sur GitHub Pages
└── README.md
```

## Utilisation en local

Ouvrir `index.html` dans un navigateur (garder le dossier `assets/` à côté). Aucune dépendance à installer.
Les polices (Google Fonts) nécessitent une connexion Internet ; sans elle, des polices système sont utilisées.

## Publication sur GitHub Pages

1. Créer un dépôt sur GitHub et y envoyer les fichiers :
   ```bash
   git init
   git add .
   git commit -m "Première version SAV PRO CI"
   git branch -M main
   git remote add origin https://github.com/<votre-compte>/<votre-depot>.git
   git push -u origin main
   ```
2. Sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
3. Le workflow publie le site à chaque envoi sur `main`. L'adresse apparaît dans l'onglet **Actions** puis **Settings → Pages**.

## Personnalisation

- Numéro WhatsApp, e-mail et clé de stockage : constantes au début du script de `index.html` (`WA`, `MAIL`, `KEY`).
- Couleurs : variables CSS `:root` en haut de la balise `<style>`.

## Données et sécurité

- Le catalogue modifié est enregistré dans le navigateur (`localStorage`), sur l'appareil de l'utilisateur uniquement.
- Le mode administrateur est géré côté navigateur : il **ne constitue pas une protection** (le code est lisible par tout visiteur). Ne jamais y placer de secret ni de donnée confidentielle.

## Licence

Tous droits réservés © SAV PRO Côte d'Ivoire. Ajouter un fichier `LICENSE` si vous souhaitez ouvrir le code.
