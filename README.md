# AVISYS — Plateforme de gestion des formations aéronautiques

Plateforme web React + Firebase + Cloudinary pour la gestion des formations, certifications et conformité des techniciens aéronautiques.

## Stack

- **Frontend** : React 19 + Vite + TypeScript + Tailwind CSS v4
- **Backend** : Firebase Auth + Firestore
- **Fichiers** : Cloudinary (vidéos, PDF, badges, certificats)
- **UI** : Framer Motion, Recharts, Lucide React
- **Exports** : jsPDF, SheetJS (xlsx)

## Démarrage rapide

```bash
npm install
cp .env.example .env
npm run dev
```

## Configuration Firebase & Cloudinary

Voir `.env.example` pour les variables requises. Déployez les règles Firestore avec `firebase deploy --only firestore:rules`.

Pour le premier admin, créez manuellement un document `users/{uid}` avec `role: "admin"` et `status: "active"`.

## Rôles

| Rôle | Dashboard |
|------|-----------|
| admin | `/admin/dashboard` |
| rh | `/rh/dashboard` |
| formateur | `/formateur/dashboard` |
| technicien | `/dashboard` |
