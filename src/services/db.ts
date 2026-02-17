import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { TargetData } from '../types';

export async function saveTargetReport(data: TargetData): Promise<void> {
  const docId = data.id || data.name;

  try {
    await setDoc(doc(db, 'reports', docId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CAMERONE] Erreur sauvegarde Firestore:', error);
    throw new Error('Échec de l\'archivage du dossier.');
  }
}
