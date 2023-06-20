import { Submission } from "@/types/submission"
import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"

const submissionsState = atom<Submission[]>({
  key: "submissionsState",
  default: [],
  dangerouslyAllowMutability: true,
})

export const useSubmissionsValue = () => useRecoilValue(submissionsState)

export const useSetSubmissionsState = () => useSetRecoilState(submissionsState)

export const useSubmissionsState = () => useRecoilState(submissionsState)
