import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/client'
import { KEYS } from './keys'
import { taskFromFirebase } from './dataConverter'
import { Res } from '../../types/Res'
import { Task } from '@/types/Task'

export const getTasksFromId = async (projectId: string): Promise<Res<Task[] | null>> => {
  const collectionRef = collection(db, KEYS.PROJECTS, projectId, KEYS.PROJECT.TASKS)

  try {
    const querySnapshot = await getDocs(collectionRef)

    let tasks: Task[] = []
    querySnapshot.forEach((doc) => {
      const task = taskFromFirebase({ ...doc.data(), id: doc.id })
      tasks.push(task)
    })

    return {
      data: tasks,
      error: null
    }

  } catch (error) {
    return {
      data: null,
      error: error
    }
  }
}
