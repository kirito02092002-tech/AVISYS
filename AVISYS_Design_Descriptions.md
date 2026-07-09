# AVISYS — Descriptions UI/UX détaillées par interface

Ce document décrit, page par page, ce que chaque écran doit contenir visuellement et fonctionnellement. À donner à l'agent IA (ou à un designer) en complément du prompt technique, pour qu'il génère des interfaces cohérentes avec la même direction visuelle partout.

---

## 0. Système de design global (à appliquer partout)

**Palette**
- Primaire : bleu nuit aviation — `#0F2A4A` (ou proche), utilisé pour la sidebar, headers, boutons principaux
- Accent : bleu ciel / cyan — `#2E9CDB`, utilisé pour liens actifs, highlights, graphiques
- Succès (Valide) : vert doux `#1E9E6B`
- Attention (À renouveler) : orange ambre `#E0A427`
- Danger (Expirée) : rouge corail `#D9534F`
- Neutres : blanc `#FFFFFF`, gris clair `#F5F7FA` (fond), gris moyen `#8A94A6` (texte secondaire), gris foncé `#1E2530` (texte principal)
- Pas plus de 3 couleurs vives à l'écran en même temps — le reste en neutres.

**Typographie**
- Police : Inter ou Manrope
- Titres de page : 24–28px, semi-bold
- Titres de section/carte : 16–18px, semi-bold
- Corps de texte : 14px, regular
- Labels/meta : 12px, medium, gris moyen

**Composants de base**
- Cartes (`cards`) : fond blanc, `rounded-xl` (12px), ombre légère (`shadow-sm`), padding 20-24px
- Boutons primaires : fond bleu nuit, texte blanc, `rounded-lg`, hover = léger assombrissement + transition 150ms
- Boutons secondaires : contour gris clair, fond transparent, hover = fond gris très clair
- Badges de statut : pastille arrondie avec couleur de fond pâle + texte de la couleur pleine correspondante (ex: badge "Valide" = fond vert pâle, texte vert foncé)
- Inputs : bordure fine grise, focus = bordure bleu accent + légère ombre bleutée
- Tables : lignes séparées par une bordure fine gris très clair, hover de ligne = fond gris très pâle

**Layout général (toutes pages connectées)**
- Sidebar gauche fixe (240px desktop, repliable en icônes, drawer sur mobile) : logo AVISYS en haut, liens de navigation adaptés au rôle avec icônes (lucide-react), item actif = fond bleu accent pâle + texte bleu nuit + barre verticale d'accent à gauche
- Header haut : titre de la page à gauche, à droite = cloche de notifications (badge rouge si non-lues), avatar utilisateur avec menu déroulant (Profil, Déconnexion)
- Contenu principal : fond gris très clair `#F5F7FA`, cartes blanches au-dessus
- Transitions de page : fade + léger slide vertical (8px) à l'entrée, via Framer Motion, durée ~200ms
- États de chargement : skeletons animés (pas de simples spinners) pour cartes et tables
- États vides : illustration simple/minimale + texte + bouton d'action ("Aucune formation pour le moment — Créer la première formation")

---

## 1. Authentification

### `/login`
- Écran centré, carte blanche max-width ~420px sur fond dégradé subtil bleu nuit → bleu plus profond (ou photo aéronautique très assombrie en arrière-plan avec overlay sombre)
- Logo AVISYS en haut de la carte
- Champs email / mot de passe avec icônes, bouton "Se connecter" pleine largeur
- Lien "Mot de passe oublié ?" discret sous le bouton
- Lien "Pas encore de compte ? Créer un compte technicien" en bas
- Micro-animation : la carte apparaît avec un léger fade + scale (0.98 → 1)

### `/register` (inscription technicien)
- Formulaire en plusieurs étapes (stepper horizontal en haut : 1. Identité · 2. Entreprise · 3. Justificatif) pour ne pas surcharger un seul écran
- Étape 1 : nom complet, email, mot de passe
- Étape 2 : matricule employé, entreprise/compagnie aérienne, numéro de licence (optionnel, avec tooltip explicatif)
- Étape 3 : zone d'upload glisser-déposer pour le badge/justificatif (aperçu de l'image une fois uploadée), bouton "Soumettre ma demande"
- Barre de progression du stepper animée
- Message de confirmation final avec icône check animée : "Votre demande a été envoyée, un administrateur va valider votre compte."

### `/pending-approval`
- Écran centré simple, icône horloge/sablier, message clair : "Votre compte est en attente de validation", sous-texte rassurant, bouton "Se déconnecter"

---

## 2. Admin Système

### `/admin/dashboard`
- Rangée de 4 cartes KPI en haut (icône + chiffre + label + petite variation en %) : Utilisateurs actifs, Comptes en attente, Formations totales, Certifications actives
- Carte "Comptes en attente de validation" listant les 5 dernières demandes avec avatar, nom, entreprise, boutons rapides Valider/Refuser
- Graphique en aire (recharts) : évolution du nombre d'utilisateurs actifs sur les 6 derniers mois
- Section "Activité récente" : liste chronologique compacte (icône + texte + timestamp relatif)

### `/admin/users`
- Barre supérieure : champ de recherche, filtres dropdown (rôle, statut), bouton "Importer CSV/Excel" (secondaire) et "Ajouter un utilisateur" (primaire) à droite
- Table : avatar + nom, email, rôle (badge coloré par rôle), statut (badge), entreprise, actions (icônes œil/edit/trash en fin de ligne, apparition au hover)
- Pagination en bas, sélection multiple avec actions groupées (valider plusieurs comptes en attente d'un coup)

### `/admin/users/:id`
- En-tête : avatar large, nom, rôle en badge, statut, boutons "Modifier le rôle", "Réinitialiser mot de passe", "Suspendre"
- Onglets : Informations · Formations suivies · Certifications · Logs d'activité
- Le justificatif d'inscription (photo badge) affiché en aperçu cliquable (lightbox)

### `/admin/settings`
- Sections en cartes verticales : Sécurité (politique mot de passe), Rôles & permissions (tableau récapitulatif des droits par rôle), Paramètres généraux de la plateforme

### `/admin/audit-log`
- Table dense avec filtres par type d'action et par utilisateur, chaque ligne avec icône selon type d'action (création/suppression/modification), timestamp précis au survol

---

## 3. Responsable Formation

### `/formateur/dashboard`
- Cartes KPI : Formations actives, Techniciens assignés, Taux de complétion moyen, Quiz en attente de correction (si applicable)
- Graphique barres horizontales : taux de complétion par formation (les plus en retard en haut, en rouge/orange dégradé)
- Widget "Prochaines réunions" (mini agenda, 3 prochaines avec date/heure)

### `/formateur/categories`
- Vue en grille de cartes par catégorie (icône représentant le type : réglementaire/technique/qualité/interne, nombre de formations associées), bouton "+" flottant ou en en-tête pour ajouter une catégorie
- Modal de création/édition simple (nom, type, description) avec animation d'ouverture en scale

### `/formateur/trainings`
- Vue en grille de cartes formation (image de couverture optionnelle, titre, catégorie en badge, durée, nombre de techniciens assignés, mini barre de progression moyenne)
- Filtres en haut : catégorie, statut (brouillon/publiée)
- Toggle vue grille / vue liste

### `/formateur/trainings/:id/edit`
- Layout deux colonnes : à gauche formulaire général (titre, description, catégorie, durée, prérequis en tags), à droite liste des chapitres en accordéon réordonnable (drag-and-drop, poignée de glisser visible au hover)
- Chaque chapitre déplié montre : zone d'upload vidéo (avec aperçu miniature une fois uploadée sur Cloudinary), liste des documents PDF attachés (icône fichier + nom + bouton supprimer)
- Sélecteur de techniciens assignés : champ recherche + liste avec cases à cocher, avatars

### `/formateur/trainings/:id/quiz`
- Constructeur de quiz : liste de questions en cartes numérotées, chaque carte a le texte de question, champs pour options de réponse, radio pour indiquer la bonne réponse
- Bouton "+ Ajouter une question" en bas, animation d'apparition de la nouvelle carte (slide + fade)
- Réglage "Score de passage requis (%)" en haut de page

### `/formateur/trainings/:id/progress`
- Table des techniciens assignés avec colonne barre de progression (visuelle, colorée selon avancement), statut quiz (réussi/échoué/non tenté), dernière activité
- Possibilité de trier par progression croissante pour repérer les retardataires

### `/formateur/meetings`
- Vue calendrier mensuel (grille) avec points colorés sur les jours ayant une réunion, clic ouvre le détail
- Bouton "Planifier une réunion" ouvre un panneau latéral (drawer) : titre, date/heure, lien visio, sélection participants

### `/formateur/forum`
- Liste des posts en cartes compactes (titre, auteur, catégorie, nombre de réponses, date), icônes de modération (masquer/supprimer) visibles au survol pour le formateur uniquement

---

## 4. Responsable RH

### `/rh/dashboard`
- Grande rangée de cartes KPI avec icônes distinctes : Total techniciens, Techniciens actifs, Certifications délivrées, Certifications expirées (en rouge), Certifications à renouveler (en orange), Progression moyenne
- Graphique donut : répartition des statuts de certification (Valide/À renouveler/Expirée) avec les 3 couleurs du système
- Graphique barres : conformité par département

### `/rh/compliance`
- En-tête avec un grand indicateur circulaire (jauge) du taux de conformité global en %, coloré selon le niveau (vert si >90%, orange si 70-90%, rouge si <70%)
- Tableau détaillé : département / technicien, nombre de certifs valides/à renouveler/expirées, formations obligatoires non réalisées — cellules colorées selon urgence
- Filtres par département en haut, export rapide en PDF/Excel via bouton en en-tête

### `/rh/certifications`
- Table complète : technicien, formation, date obtention, date expiration (avec compte à rebours en jours si proche), statut (badge), bouton téléchargement PDF
- Filtres : statut, date d'expiration (plage), département
- Ligne en fond légèrement rouge/orange pâle si expirée/à renouveler pour repérage visuel immédiat

### `/rh/reports`
- Sélecteurs de période et de type de rapport (conformité globale, par département, historique individuel)
- Aperçu du rapport généré affiché avant export (mini preview)
- Boutons "Exporter en PDF" et "Exporter en Excel" côte à côte, avec icônes respectives

### `/rh/employees/:id`
- En-tête profil technicien (avatar, nom, département, entreprise)
- Timeline verticale de l'historique de formation (chaque formation = point sur la ligne avec date, résultat, certif associée)

---

## 5. Technicien

### `/dashboard`
- Message d'accueil personnalisé en haut ("Bonjour, [Prénom]")
- Cartes d'alerte en priorité si certification proche expiration ou expirée (bandeau coloré orange/rouge, discret mais visible, avec CTA "Voir mes certifications")
- Section "Mes formations en cours" : cartes avec barre de progression, bouton "Continuer"
- Section "Formations à commencer" : cartes plus neutres avec bouton "Démarrer"
- Widget notifications récentes en sidebar droite (optionnel) ou en carte compacte

### `/trainings`
- Grille de cartes formations avec image de couverture, badge catégorie coloré selon type, barre de progression si commencée, icône cadenas si prérequis non remplis
- Filtres : catégorie, statut (à faire/en cours/terminé)

### `/trainings/:id`
- Layout type plateforme e-learning : lecteur vidéo large à gauche/haut, liste des chapitres en accordéon à droite/dessous avec coche verte sur les chapitres terminés
- Sous le lecteur : documents PDF téléchargeables (icônes fichier avec taille du fichier)
- Barre de progression globale de la formation en haut de page, sticky
- Bouton "Marquer comme terminé" / "Passer au quiz" en bas une fois tous les chapitres vus

### `/trainings/:id/quiz`
- Une question à la fois avec barre de progression du quiz en haut ("Question 3/10")
- Options de réponse en boutons larges cliquables (radio stylisé), feedback visuel immédiat optionnel
- Écran de résultat final : score en grand avec animation de compteur qui monte, badge réussite/échec, bouton "Voir mon certificat" si réussi ou "Réessayer" si échoué (selon règles définies)

### `/certifications`
- Grille de cartes "certificat" au design proche d'un vrai diplôme (bordure décorative subtile, nom certification, dates, statut en badge coin supérieur), bouton téléchargement PDF sur chaque carte
- Filtre par statut en haut, tri par date d'expiration

### `/forum`
- Liste de posts type fil de discussion (titre en gras, auteur + date en meta, extrait du contenu, nombre de réponses avec icône bulle)
- Bouton "+ Nouvelle question" flottant en bas à droite ou en en-tête
- Page détail post : contenu complet en haut, fil de commentaires en dessous, champ de réponse sticky en bas

### `/meetings`
- Vue calendrier ou liste chronologique des réunions à venir (carte par réunion : titre, date/heure, bouton "Rejoindre" actif seulement le jour J, sinon état désactivé avec compte à rebours)

### `/notifications`
- Liste chronologique groupée par jour ("Aujourd'hui", "Cette semaine", "Plus ancien"), icône selon type de notification (formation, certification, réunion, annonce), point bleu si non lue, clic marque comme lue avec transition de fondu

### `/profile`
- Formulaire simple : informations personnelles éditables (nom, email en lecture seule), matricule, entreprise, licence — affichage en lecture seule avec bouton "Demander une modification" (passe par validation admin) plutôt qu'édition libre, pour garder la fiabilité des données de vérification

---

## 6. Composants transverses à concevoir une seule fois

- `<StatCard />` — carte KPI réutilisable (icône, valeur, label, variation)
- `<StatusBadge status="valide|a_renouveler|expiree|active|pending|suspended" />`
- `<ProgressBar value={} />` avec dégradé de couleur selon le pourcentage
- `<FileUploader />` — zone drag-and-drop connectée à Cloudinary, avec barre de progression d'upload
- `<EmptyState icon title description action />`
- `<ConfirmDialog />` pour toute action destructive (suppression, suspension de compte)
- `<Skeleton />` pour les états de chargement de cartes/tables/listes

---

Ce document + le prompt technique précédent donnent à l'agent IA tout ce qu'il faut pour générer des interfaces visuellement cohérentes, page par page, dans le même esprit "pro-moderne, sobre, animé légèrement".
