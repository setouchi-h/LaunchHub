import React, { useRef, useState } from "react"
import * as s from "./style"
import * as Dialog from "@radix-ui/react-dialog"
import { z } from "zod"
import { EditingTask, TaskIndex } from "@/types/Task"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Spacer from "@/components/ui/Spacer/Spacer"
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage"
import Button from "@/components/ui/Button"
import { useUserValue } from "@/states/userState"
import { useProjectState } from "@/states/projectState"
import { Project } from "@/types/Project"
import { updateProject } from "@/models/firestore/updateProject"
import { createTask } from "@/models/firestore/createTask"

const formInputSchema = z
  .object({
    title: z
      .string()
      .nonempty({ message: "Required" }),
    outline: z
      .string(),
    details: z
      .string()
      .nonempty({ message: "Required" }),
    bountySbt: z
      .number()
      .int({ message: "Value must be an integer" })
      .min(0, { message: "Value must be between 0 and 100" })
  })

type NewTask = z.infer<typeof formInputSchema>

const AddNewTaskDialog: React.FC = () => {

  const user = useUserValue()
  const [project, setProject] = useProjectState()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<NewTask>({ resolver: zodResolver(formInputSchema) })
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(true)
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

  const onSubmitNewTask: SubmitHandler<NewTask> = async (data) => {
    setIsButtonEnabled(false)
    setIsButtonLoading(true)
    if (!user || !project) { return }

    //create task
    const newTask: EditingTask = {
      title: data.title,
      stage: "todo",
      outline: data.outline,
      details: data.details,
      bountySbt: data.bountySbt,
      ownerId: user.uid,
      asigneeIds: [],
      assignmentApplicationIds: [],
      submissionIds: []
    }
    const { data: createdTask } = await createTask({
      projectId: project.id,
      task: newTask
    })

    if (!createdTask) { return }

    //update taskIndexes
    const newTaskIndexes: TaskIndex[] = [
      ...project.taskIndexes.map(($0) => (
        { taskId: $0.taskId, index: $0.index + 1 }
      )),
      { taskId: createdTask.id, index: 0 }
    ]
    await updateProject({
      projectId: project.id,
      project: { taskIndexes: newTaskIndexes }
    })

    //update project state
    const newProject: Project = {
      ...project,
      tasks: [...project.tasks, createdTask],
      taskIndexes: newTaskIndexes
    }
    setProject(newProject)

    setIsDialogOpen(false)
    setIsButtonEnabled(true)
    setIsButtonLoading(false)
    reset()
  }

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Dialog.Trigger asChild>
        <button css={s.addNewTaskButtonStyle}>
          + Add New Task
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay css={s.dialogOverlayStyle} />
        <Dialog.Content css={s.dialogContentStyle} >
          <div css={s.titleContainerStyle}>
            <Dialog.Title >
              New Task
            </Dialog.Title>
            <div css={s.closeButtonSpacerStyle} />
            <Dialog.Close asChild>
              <button aria-label="Close" css={s.closeButtonStyle}>
                x
              </button>
            </Dialog.Close>
          </div>

          <form>
            <Spacer size={20} />

            <div>
              <label>
                <p>
                  Task Name
                </p>
                <input
                  placeholder="Task name..."
                  {...register("title")}
                />
                {errors.title && (
                  <ErrorMessage>
                    {errors.title?.message}
                  </ErrorMessage>
                )}
              </label>
            </div>

            <Spacer size={20} />
            <div>
              <label>
                <p>
                  Outline
                </p>
                <input
                  placeholder="Outline..."
                  {...register("outline")}
                />
                {errors.outline && (
                  <ErrorMessage>
                    {errors.outline?.message}
                  </ErrorMessage>
                )}
              </label>
            </div>

            <Spacer size={20} />
            <div>
              <label>
                <p>
                  Details
                </p>
                <textarea
                  placeholder="Details..."
                  {...register("details")}
                />
                {errors.details && (
                  <ErrorMessage>
                    {errors.details?.message}
                  </ErrorMessage>
                )}
              </label>
            </div>

            <Spacer size={20} />
            <div>
              <label>
                <p>
                  Amount of Bounty SBT
                </p>
                <input
                  type="number"
                  placeholder="Amount of bounty SBT..."
                  {...register("bountySbt", { valueAsNumber: true })}
                />
                {errors.bountySbt && (
                  <ErrorMessage>
                    {errors.bountySbt?.message}
                  </ErrorMessage>
                )}
              </label>
              <Spacer size={20} />
            </div>

            <div>
              <Button
                onClick={handleSubmit(onSubmitNewTask)}
                isEnabled={isButtonEnabled}
                isLoading={isButtonLoading}
              >
                Create
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default AddNewTaskDialog