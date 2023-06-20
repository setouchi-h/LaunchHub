import React, { useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import { DropResult } from "../DroppableTaskColumn/DroppableTaskColumn"
import { useSetProjectState } from "@/states/projectState"
import TaskCard from "../TaskCard"
import { Task } from "@/types/Task"

type DraggableTask = {
  id: string,
  index: number
}

type Props = {
  task: Task,
  index: number
}

const DraggableTask: React.FC<Props> = ({ task, index }) => {

  const ref = useRef<HTMLLIElement>(null)
  const setProject = useSetProjectState()
  const isDraggable = false

  const [, drag] = useDrag<DraggableTask>({
    type: "item",
    item: { id: task.id, index },
    end: (_, monitor) => {
      if (!isDraggable) { return }
      //drag and drop between columns
      const dropResult = monitor.getDropResult() as DropResult

      if (dropResult) {
        setProject((currentProject) => {
          if (!currentProject) { return currentProject }
          const currentTasks = currentProject.tasks
          const newTasks = currentTasks.map((currentTask) => {
            if (currentTask.id === task.id) {
              return {
                ...currentTask,
                stage: dropResult.taskStage
              }
            } else {
              return currentTask
            }
          })
          return { ...currentProject, tasks: newTasks }
        })
      }
    }
  })

  const [, drop] = useDrop<DraggableTask>({
    accept: ["item"],
    drop: (item) => {
      if (!isDraggable) { return }
      //sorting within the same column
      const fromIndex = item.index
      const newIndex = index

      setProject((currentProject) => {
        if (!currentProject) { return currentProject }
        const currentTaskIndexes = currentProject.taskIndexes
        const newTaskIndexes = currentTaskIndexes.map((currentTaskIndex) => {
          const index = currentTaskIndex.index
          if (newIndex < fromIndex) {
            if (index < newIndex) { return currentTaskIndex }
            if (index > fromIndex) { return currentTaskIndex }
            if (index === fromIndex) {
              return { ...currentTaskIndex, index: newIndex }
            }
            return { ...currentTaskIndex, index: currentTaskIndex.index + 1 }
          }

          if (newIndex > fromIndex) {
            if (index > newIndex) { return currentTaskIndex }
            if (index < fromIndex) { return currentTaskIndex }
            if (index === fromIndex) {
              return { ...currentTaskIndex, index: newIndex }
            }
            return { ...currentTaskIndex, index: currentTaskIndex.index - 1 }
          }

          return currentTaskIndex
        })
        return { ...currentProject, taskIndexes: newTaskIndexes }
      })
    }
  })

  drag(drop(ref))

  return (
    <li
      ref={ref}
    >
      <TaskCard
        task={task}
      />
    </li>
  )
}

export default DraggableTask