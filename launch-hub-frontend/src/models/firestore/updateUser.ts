import { doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase/client"
import { KEYS } from "./keys"
import { User } from "../../types/User"
import { Res } from "../../types/Res"

export const updateUser = async ({ userId, user }: { userId: string, user: Partial<User> }): Promise<Res<null>> => {

  const docRef = doc(db, KEYS.USERS, userId)

  try {
    await updateDoc(docRef, user)
    return {
      data: null,
      error: null
    }

  } catch (error) {
    return {
      data: null,
      error: error
    }
  }

}