import { atom, selector, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Project } from '../types/Project';

const projectState = atom<Project | null | undefined>({
  key: "projectState",
  default: undefined
})

export const useProjectValue = () => useRecoilValue(projectState)

export const useSetProjectState = () => useSetRecoilState(projectState)

export const useProjectState = () => useRecoilState(projectState)

const tasksState = selector({
  key: "selector/tasksState",
  get: ({ get }) => {
    return get(projectState)?.tasks ?? []
  }
})

export const useTasksValue = () => useRecoilValue(tasksState)

const taskIndexesState = selector({
  key: "selector/taskIndexesState",
  get: ({ get }) => {
    return get(projectState)?.taskIndexes ?? []
  }
})

export const useTaskIndexesValue = () => useRecoilValue(taskIndexesState)