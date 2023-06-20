import { doc, getDoc } from 'firebase/firestore'
import { User } from '../../types/User'
import { db } from '../firebase/client'
import { KEYS } from './keys'
import { userFromFirebase } from './dataConverter'
import { Res } from '../../types/Res'

export const getUser = async (uid: string): Promise<Res<User | null>> => {

  const docRef = doc(db, KEYS.USERS, uid)

  try {
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
      const user = userFromFirebase(docSnapshot.data())
      return {
        data: user,
        error: null
      }

    } else {
      return {
        data: null,
        error: null
      }
    }

  } catch (error) {
    return {
      data: null,
      error: error
    }
  }
}