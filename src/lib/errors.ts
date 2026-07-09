/** Remove undefined values — Firestore rejects undefined fields */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>
}

export function getFirebaseErrorMessage(error: unknown): string {
  const err = error as { code?: string; message?: string }

  switch (err.code) {
    case 'auth/email-already-in-use':
      return 'Cet email est déjà utilisé. Connectez-vous ou choisissez un autre email.'
    case 'auth/weak-password':
      return 'Mot de passe trop faible (minimum 6 caractères).'
    case 'auth/invalid-email':
      return 'Adresse email invalide.'
    case 'auth/operation-not-allowed':
      return 'Inscription par email désactivée dans Firebase. Activez "Email/Password" dans Authentication.'
    case 'permission-denied':
      return 'Accès à la base de données refusé. Déployez les règles Firestore : firebase deploy --only firestore:rules'
    case 'unavailable':
      return 'Firebase temporairement indisponible. Réessayez dans quelques instants.'
    default:
      if (err.message?.includes('Missing or insufficient permissions')) {
        return 'Permissions Firestore insuffisantes. Déployez firestore.rules sur votre projet Firebase (avisys-64b2a).'
      }
      return err.message ?? 'Erreur lors de l\'inscription. Réessayez.'
  }
}
