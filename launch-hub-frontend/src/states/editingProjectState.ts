import { EditingProject } from "@/types/Project"
import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"

const editingProjectState = atom<EditingProject | null>({
  key: "editingProjectState",
  default: null
})

export const useEditingProjectValue = () => useRecoilValue(editingProjectState)

export const useSetEditingProjectState = () => useSetRecoilState(editingProjectState)

export const useEditingProjectState = () => useRecoilState(editingProjectState)
