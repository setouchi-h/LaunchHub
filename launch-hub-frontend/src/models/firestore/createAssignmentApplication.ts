import { collection, doc, setDoc } from "firebase/firestore"
import { db } from "../firebase/client"
import { KEYS } from "./keys"
import { Res } from "../../types/Res"
import { AssignmentApplication, EditingAssignmentApplication } from "@/types/assignmentApplication"
import { User } from "@/types/User"

type Props = {
  assignmentApplication: EditingAssignmentApplication,
  user: User
}

export const createAssignmentApplication = async ({ assignmentApplication, user }: Props): Promise<Res<AssignmentApplication | null>> => {

  const docId = doc(collection(db, KEYS.ASSIGNMENT_APPLICATIONS)).id
  const docRef = doc(collection(db, KEYS.ASSIGNMENT_APPLICATIONS), docId)

  try {
    await setDoc(docRef, assignmentApplication)
    return {
      data: {
        ...assignmentApplication,
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
