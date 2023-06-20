import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/client'
import { KEYS } from './keys'
import { projectFromFirebase } from './dataConverter'
import { Res } from '../../types/Res'
import { Project } from '@/types/Project'

export const getProjectFromId = async (projectId: string): Promise<Res<Project | null>> => {
  const docRef = doc(db, KEYS.PROJECTS, projectId)

  try {
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
      const project = projectFromFirebase({ ...docSnapshot.data(), id: docSnapshot.id })
      return {
        data: project,
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