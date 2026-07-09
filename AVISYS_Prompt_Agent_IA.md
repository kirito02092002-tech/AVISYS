# AVISYS — Prompt de développement pour agent IA (Claude Code / Cursor / etc.)

Copie-colle tout ce document dans ton agent IA (Claude Code, Cursor, Windsurf...) comme instruction de projet. Il est structuré pour être exécuté par étapes (Phase 1, Phase 2...).

---

## 0. Rôle de l'agent

Tu es un développeur full-stack senior spécialisé en React (Vite), Firebase et Cloudinary. Tu vas construire **AVISYS**, une plateforme web de gestion des formations et de la conformité des techniciens aéronautiques, en remplaçant un suivi Excel existant. Construis le projet **étape par étape**, en me montrant l'arborescence de fichiers avant de générer du code massif, et en avançant module par module (pas tout d'un coup).

---

## 1. Contexte métier (à respecter strictement)

AVISYS centralise :
- la gestion des formations obligatoires des techniciens aéronautiques (réglementaires, techniques, qualité, internes) ;
- la génération et le suivi des certifications avec dates d'expiration ;
- un système d'alertes automatiques avant échéance : **J-90, J-60, J-30, J-15, J-7, jour J** ;
- un tableau de conformité (taux global, par département, par technicien) ;
- un tableau de bord RH (statistiques, exports PDF/Excel) ;
- un forum simple entre techniciens ;
- un module réunions (planification, invitations).

4 rôles : **admin**, **rh**, **formateur** (Responsable Formation), **technicien**.

---

## 2. Stack technique (imposée)

- **Frontend** : React + Vite (JavaScript ou TypeScript — utilise TypeScript si possible pour la robustesse des rôles/types)
- **Styling** : Tailwind CSS
- **Backend/DB** : Firebase (Firestore pour les données, Firebase Auth pour l'authentification)
- **Stockage fichiers** (vidéos, PDF, documents, images justificatives) : **Cloudinary** — Firestore ne stocke que les métadonnées (url, nom, taille, type, formation liée), jamais les fichiers eux-mêmes.
- **Déploiement** : Vercel
- **Génération PDF côté client** : librairie type `jspdf` ou `pdf-lib` pour les certificats et rapports RH exportables
- **Export Excel** : `sheetjs` (xlsx)
- **Notifications email** : Firebase Cloud Functions + un service (Resend, SendGrid ou Firebase Extensions "Trigger Email")

---

## 3. Modèle de données Firestore

```
users/{uid}
  - email
  - fullName
  - role: "admin" | "rh" | "formateur" | "technicien"
  - status: "pending" | "active" | "suspended"
  - department: string
  - employeeId: string (matricule)
  - company: string (compagnie aérienne / entreprise)
  - licenseNumber: string (ex: licence Part-66, optionnel)
  - idDocumentUrl: string (Cloudinary — badge/justificatif uploadé à l'inscription)
  - createdAt, updatedAt

categories/{categoryId}
  - name, type: "reglementaire" | "technique" | "qualite" | "interne"
  - description

trainings/{trainingId}
  - title, description, categoryId, duration, prerequisites: []
  - assignedTo: [uid...]
  - createdBy (formateur uid)
  - chapters: sous-collection trainings/{id}/chapters/{chapterId}
      - title, order, videoUrl (Cloudinary), documentUrls: []

quizzes/{quizId}
  - trainingId, type: "intermediaire" | "examen_final"
  - questions: [{ question, options: [], correctAnswer }]
  - passingScore

quizAttempts/{attemptId}
  - uid, quizId, trainingId, score, answers, attemptDate, passed: boolean

certifications/{certId}
  - uid, trainingId, name
  - issueDate, expiryDate
  - authority
  - status: "valide" | "a_renouveler" | "expiree"  (calculé automatiquement)
  - pdfUrl (Cloudinary)

progress/{progressId}
  - uid, trainingId, completedChapters: [], percentage, lastAccessed

forumPosts/{postId}
  - title, content, authorId, category, createdAt, moderated: boolean
  forumPosts/{postId}/comments/{commentId}
    - content, authorId, createdAt

meetings/{meetingId}
  - title, date, link, invitedUids: [], createdBy

notifications/{notifId}
  - uid, type, message, read: boolean, createdAt, relatedCertId (optionnel)

auditLogs/{logId}
  - uid, action, targetId, timestamp, details
```

---

## 4. Authentification & gestion des rôles

- Utilise **Firebase Auth** (email/mot de passe, + option Google plus tard).
- **Ne jamais utiliser un simple booléen `isAdmin`.** Utilise le champ `role` (`admin | rh | formateur | technicien`) + `status` (`pending | active | suspended`).
- Inscription technicien : formulaire dédié demandant : nom complet, matricule employé, entreprise/compagnie aérienne, numéro de licence (si applicable), upload d'un badge/justificatif (photo, via Cloudinary). Le compte est créé avec `status: "pending"`. Un admin ou RH doit valider manuellement (passage à `active`) avant que le technicien puisse se connecter à la plateforme.
- Après connexion, redirige l'utilisateur selon son `role` :
  - `admin` → `/admin/dashboard`
  - `rh` → `/rh/dashboard`
  - `formateur` → `/formateur/dashboard`
  - `technicien` → `/dashboard`
- Sécurise l'accès aux routes avec un composant `<ProtectedRoute allowedRoles={[...]}>`.
- Écris les **Firestore Security Rules** pour que chaque collection ne soit lisible/modifiable que par les rôles autorisés (ex : seuls `admin`/`rh` peuvent changer le `status` d'un user ; seul le propriétaire ou un `formateur`/`admin` peut lire un `progress`).
- Pour un contrôle serveur renforcé (optionnel en V2) : Cloud Function qui synchronise `role` vers des **Custom Claims** Firebase Auth.

---

## 5. Stockage des fichiers (Cloudinary)

- Vidéos de formation, PDF, présentations, documents justificatifs, photos de profil → uploadés vers Cloudinary (`resource_type: "video"` pour vidéos, `"raw"` ou `"auto"` pour PDF/docs, `"image"` pour photos).
- Firestore stocke uniquement : `{ url, publicId, fileName, fileSize, mimeType, uploadedAt }`.
- Crée un composant réutilisable `<FileUploader />` (upload widget Cloudinary ou upload direct via preset non signé) utilisable dans : création de formation, ajout de chapitre, upload de certificat, inscription technicien.

---

## 6. Arborescence des pages par rôle

### Public / Auth
- `/login`
- `/register` (formulaire technicien détaillé, cf section 4)
- `/forgot-password`
- `/pending-approval` (écran affiché si `status === "pending"`)

### Admin Système
- `/admin/dashboard` — vue globale (users actifs, formations, certifs, alertes système)
- `/admin/users` — liste, recherche, filtres par rôle/statut ; import CSV/Excel ; validation des inscriptions `pending`
- `/admin/users/:id` — fiche utilisateur, changer rôle/statut, réinitialiser mot de passe
- `/admin/settings` — paramètres de sécurité, logs d'audit
- `/admin/audit-log` — journal des actions

### Responsable Formation
- `/formateur/dashboard` — formations actives, taux de complétion, dernières activités
- `/formateur/categories` — CRUD catégories (réglementaire, technique, qualité, interne)
- `/formateur/trainings` — liste des formations, CRUD
- `/formateur/trainings/:id/edit` — édition formation : chapitres, upload vidéos/PDF, prérequis, techniciens assignés
- `/formateur/trainings/:id/quiz` — création/édition quiz et examen final
- `/formateur/trainings/:id/progress` — suivi de progression par technicien
- `/formateur/meetings` — planification réunions, invitations
- `/formateur/forum` — modération des publications

### Responsable RH
- `/rh/dashboard` — KPIs (total techniciens, actifs, certifs délivrées/expirées/à renouveler, progression moyenne)
- `/rh/compliance` — tableau de conformité (global, par département, par technicien)
- `/rh/certifications` — liste de toutes les certifications, filtres statut
- `/rh/reports` — génération et export PDF/Excel des rapports
- `/rh/employees/:id` — historique de formation d'un technicien

### Technicien
- `/dashboard` — mes formations assignées, alertes d'expiration, notifications récentes
- `/trainings` — catalogue de mes formations (assignées + disponibles)
- `/trainings/:id` — lecteur vidéo, documents téléchargeables, progression, reprise où il s'est arrêté
- `/trainings/:id/quiz` — passage du quiz/examen, résultat, historique des tentatives
- `/certifications` — mes certifications (statut Valide/À renouveler/Expirée), téléchargement PDF
- `/forum` — liste des posts, création de post, réponses (type Reddit simplifié)
- `/meetings` — calendrier des réunions auxquelles il est invité
- `/notifications` — centre de notifications
- `/profile` — mes informations, matricule, licence

### Commun (tous rôles connectés)
- Barre latérale/nav adaptée dynamiquement au `role`
- `/notifications` (cloche avec badge non-lus)
- `/profile`

---

## 7. Système d'alertes automatiques (point critique)

- Crée une **Cloud Function planifiée** (Cloud Scheduler, ex: tous les jours à 6h) qui :
  1. Parcourt `certifications` où `expiryDate` approche.
  2. Calcule le nombre de jours restants.
  3. Si le nombre de jours restants correspond exactement à 90, 60, 30, 15, 7 ou 0 → crée un document dans `notifications` pour le technicien concerné + déclenche un email.
  4. Met à jour automatiquement le champ `status` de la certification (`valide` / `a_renouveler` en dessous de 60 jours par exemple / `expiree` si `expiryDate < today`).
- Les responsables RH voient ces mêmes alertes agrégées dans `/rh/compliance`.

---

## 8. Forum (type Reddit simplifié)

- Collection `forumPosts` (titre, contenu, auteur, catégorie, date) + sous-collection `comments`.
- Pas d'upvote pour le MVP.
- Modération : le formateur/admin peut supprimer ou masquer un post.
- Filtrage par catégorie (ex: technique, réglementaire, général).

---

## 9. Direction UI/UX

- Style : **entre pro et moderne**, sobre, peu de couleurs (2-3 couleurs max : une couleur primaire type bleu aviation / bleu nuit, une couleur d'accent, du gris neutre), typographie claire (ex: Inter ou Manrope).
- Animations légères et fluides (transitions de page, hover, apparition de cartes) — utilise **Framer Motion**.
- Composants premium : cartes avec ombre douce, coins arrondis modérés (rounded-xl), bonne hiérarchie visuelle, espacements généreux.
- Responsive obligatoire (mobile, tablette, desktop).
- Dashboards avec graphiques (utilise `recharts`) pour les taux de conformité et statistiques RH.
- Dark mode optionnel en V2.

Utilise Tailwind avec une palette de design tokens définie dans `tailwind.config.js` dès le départ (couleurs primaire/secondaire/accent/neutre, spacing, radius) plutôt que des couleurs Tailwind par défaut dispersées dans le code.

---

## 10. Sécurité (non-fonctionnel, obligatoire)

- HTTPS (géré par Vercel).
- Mots de passe gérés uniquement par Firebase Auth (jamais stockés en clair).
- Firestore Security Rules strictes par rôle (voir section 4).
- Protection XSS/CSRF : éviter `dangerouslySetInnerHTML`, valider/sanitizer toute entrée utilisateur (forum notamment).
- Audit log des actions sensibles (changement de rôle, suppression d'utilisateur, validation de compte).
- Variables sensibles (clés Cloudinary, config Firebase) en variables d'environnement Vercel, jamais commit dans le repo.

---

## 11. Plan d'exécution demandé à l'agent (ordre de développement)

Demande à l'agent de suivre ces phases dans l'ordre, en attendant validation entre chaque phase si besoin :

1. **Setup projet** : Vite + React + TS + Tailwind + Firebase SDK + config Cloudinary + structure de dossiers (`/src/pages`, `/src/components`, `/src/features`, `/src/lib`, `/src/hooks`, `/src/context`).
2. **Authentification** : login, register technicien, `AuthContext`, `ProtectedRoute`, écran `pending-approval`.
3. **Gestion utilisateurs (Admin)** : CRUD users, validation des comptes pending, changement de rôle.
4. **Gestion formations (Formateur)** : catégories, formations, chapitres, upload Cloudinary, quiz.
5. **Espace Technicien** : catalogue formations, lecteur, progression, passage de quiz.
6. **Certifications** : génération automatique après réussite d'examen, génération PDF, statut dynamique.
7. **Alertes/notifications** : Cloud Function planifiée + centre de notifications in-app + email.
8. **Conformité + Dashboard RH** : graphiques, exports PDF/Excel.
9. **Forum + Réunions**.
10. **Polish UI/UX** : animations, responsive final, états de chargement/erreur, empty states.
11. **Déploiement Vercel** + variables d'environnement.

---

## 12. Ce que je veux que tu me livres à chaque étape

- L'arborescence des fichiers créés/modifiés.
- Le code complet des fichiers concernés.
- Les Firestore Security Rules mises à jour si la phase touche à de nouvelles collections.
- Un court résumé de ce qui reste à faire pour la phase suivante.

Commence par la **Phase 1 (Setup projet)** et attends ma confirmation avant de passer à la Phase 2.
