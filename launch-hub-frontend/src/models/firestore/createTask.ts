import { collection, doc, setDoc } from "firebase/firestore"
import { db } from "../firebase/client"
import { KEYS } from "./keys"
import { Res } from "../../types/Res"
import { EditingTask, Task } from "@/types/Task"

type Props = {
  projectId: string,
  task: EditingTask
}

export const createTask = async ({ projectId, task }: Props): Promise<Res<Task | null>> => {
  const docId = doc(collection(db, KEYS.PROJECTS, projectId, KEYS.PROJECT.TASKS)).id
  const docRef = doc(collection(db, KEYS.PROJECTS, projectId, KEYS.PROJECT.TASKS), docId)

  try {
    await setDoc(docRef, task)
    return {
      data: {
        ...task,
        id: docId
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
