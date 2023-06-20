import React, { useState } from "react"
import * as s from "./style"
import { z } from "zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Spacer from "@/components/ui/Spacer/Spacer"
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage"
import Button from "@/components/ui/Button"
import { useUserState } from "@/states/userState"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { updateUser } from "@/models/firestore/updateUser"

const formInputSchema = z.object({
  name: z.string().nonempty({ message: "Required" }),
})

type UserName = z.infer<typeof formInputSchema>

const UserNameDialog: React.FC = () => {
  const [user, setUser] = useUserState()
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserName>({ resolver: zodResolver(formInputSchema) })
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(true)
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false)

  const onSaveUserName: SubmitHandler<UserName> = async (data) => {
    if (!user) {
      return
    }
    setIsButtonEnabled(false)
    setIsButtonLoading(true)

    //save user name
    await updateUser({
      userId: user.uid,
      user: { name: data.name }
    })

    //set user state
    setUser((currentValue) => {
      if (!currentValue) {
        return currentValue
      }
      return {
        ...currentValue,
        name: data.name,
      }
    })

    setIsOpen(false)
    setIsButtonEnabled(true)
    setIsButtonLoading(false)
  }

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay css={s.dialogOverlayStyle} />
        <AlertDialog.Content css={s.dialogContentStyle}>
          <AlertDialog.Title>User Name</AlertDialog.Title>
          <form>
            <div>
              <label>
                <p>User Name</p>
                <input
                  type="text"
                  placeholder="User name..."
                  {...register("name")}
                />
                {errors.name && <ErrorMessage>{errors.name?.message}</ErrorMessage>}
              </label>
            </div>
            <Spacer size={20} />

            <div>
              <Button
                onClick={handleSubmit(onSaveUserName)}
                isEnabled={isButtonEnabled}
                isLoading={isButtonLoading}
              >
                Save
              </Button>
            </div>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export default UserNameDialog
