import { doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase/client"
import { KEYS } from "./keys"
import { Res } from "../../types/Res"
import { AssignmentApplication } from "@/types/assignmentApplication"

type Props = {
  assignmentApplicationId: string,
  assignmentApplication: Partial<AssignmentApplication>
}

export const updateAssignmentApplication = async ({ assignmentApplicationId, assignmentApplication }: Props): Promise<Res<null>> => {

  const docRef = doc(db, KEYS.ASSIGNMENT_APPLICATIONS, assignmentApplicationId)

  try {
    await updateDoc(docRef, assignmentApplication)
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
