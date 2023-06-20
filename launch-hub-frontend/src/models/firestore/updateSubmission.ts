import { doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase/client"
import { KEYS } from "./keys"
import { Res } from "../../types/Res"
import { AssignmentApplication } from "@/types/assignmentApplication"
import { Submission } from "@/types/submission"

type Props = {
  submissionId: string,
  submission: Partial<Submission>
}

export const updateSubmission = async ({ submissionId, submission }: Props): Promise<Res<null>> => {

  const docRef = doc(db, KEYS.SUBMISSIONS, submissionId)

  try {
    await updateDoc(docRef, submission)
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
