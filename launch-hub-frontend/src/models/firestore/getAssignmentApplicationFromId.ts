import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/client'
import { KEYS } from './keys'
import { assignmentApplicationFromFirebase } from './dataConverter'
import { Res } from '../../types/Res'
import { AssignmentApplication } from '@/types/assignmentApplication'
import { getUser } from './getUser'

export const getAssignmentApplicationFromId = async (assignmentApplicationId: string): Promise<Res<AssignmentApplication | null>> => {

  const docRef = doc(db, KEYS.ASSIGNMENT_APPLICATIONS, assignmentApplicationId)

  try {
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
      const assignmentApplication = assignmentApplicationFromFirebase({
        ...docSnapshot.data(),
        id: docSnapshot.id
      })
      const { data: user, error: getUserError } = await getUser(assignmentApplication.userId)
      if (!user) {
        return {
          data: null,
          error: getUserError
        }
      }

      return {
        data: {
          ...assignmentApplication,
          user: user
        },
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
