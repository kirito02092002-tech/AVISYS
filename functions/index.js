/**
 * Cloud Function planifiée — alertes certifications J-90, J-60, J-30, J-15, J-7, J-0
 *
 * Déployer avec Firebase CLI :
 *   firebase init functions
 *   firebase deploy --only functions
 *
 * Nécessite le plan Blaze (facturation) pour Cloud Scheduler.
 */

const { onSchedule } = require('firebase-functions/v2/scheduler')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore, Timestamp } = require('firebase-admin/firestore')

initializeApp()
const db = getFirestore()

const ALERT_THRESHOLDS = [90, 60, 30, 15, 7, 0]

function computeStatus(expiryDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = expiryDate.toDate ? expiryDate.toDate() : new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'expiree'
  if (diffDays <= 60) return 'a_renouveler'
  return 'valide'
}

exports.checkCertificationAlerts = onSchedule('0 6 * * *', async () => {
  const snap = await db.collection('certifications').get()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const docSnap of snap.docs) {
    const cert = docSnap.data()
    const expiry = cert.expiryDate.toDate ? cert.expiryDate.toDate() : new Date(cert.expiryDate)
    expiry.setHours(0, 0, 0, 0)
    const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    const newStatus = computeStatus(cert.expiryDate)

    if (cert.status !== newStatus) {
      await docSnap.ref.update({ status: newStatus })
    }

    if (ALERT_THRESHOLDS.includes(daysRemaining)) {
      const message =
        daysRemaining === 0
          ? `Votre certification "${cert.name}" expire aujourd'hui.`
          : `Votre certification "${cert.name}" expire dans ${daysRemaining} jour(s).`

      await db.collection('notifications').add({
        uid: cert.uid,
        type: 'certification',
        message,
        read: false,
        relatedCertId: docSnap.id,
        createdAt: new Date().toISOString(),
      })
    }
  }
})
