import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

const firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG as string)

if (!getApps()?.length) {
  initializeApp(firebaseConfig)
}

export const db = getFirestore()
export const storage = getStorage()
export const auth = getAuth()