import { collection, doc, setDoc } from "firebase/firestore"
import { db } from "../firebase/client"
import { KEYS } from "./keys"
import { Res } from "../../types/Res"
import { EditingSubmission, Submission } from "@/types/submission"
import { User } from "@/types/User"

type Props = {
  submission: EditingSubmission,
  user: User
}

export const createSubmission = async ({ submission, user }: Props): Promise<Res<Submission | null>> => {

  const docId = doc(collection(db, KEYS.SUBMISSIONS)).id
  const docRef = doc(collection(db, KEYS.SUBMISSIONS), docId)

  try {
    await setDoc(docRef, submission)
    return {
      data: {
        ...submission,
        id: docId,
        user: user
      },
      error: null
    }

  } catch (error) {
    return {
      data: null,
      error: error
    }
  }
}