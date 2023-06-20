import { useState } from "react"
import { useFetchEffect } from "./useFetchEffect"
import { Holder, SbtOwner } from "@/types/SbtOwner"
import securitiesAbi from "../../../constants/Securities.json"
import { getUser } from "../firestore/getUser"
import { ethers } from "ethers"
import { useUserValue } from "@/states/userState"
import { useRouter } from "next/router"
import { useGetProject } from "./useGetProject"

export const useGetSbtHolders = () => {
  const router = useRouter()
  const { projectId, taskId } = router.query
  const { project } = useGetProject(projectId)
  const [sbtOwners, setSbtOwners] = useState<SbtOwner[]>([])
  const user = useUserValue()

  const getSbtAmountOfEachHolder = async (memberAddr: string) => {
    console.log("provider", user?.provider)
    console.log("project", project)
    console.log("sbtAddress", project?.sbtAddress)
    const contract = new ethers.Contract(project?.sbtAddress!, securitiesAbi, user?.provider)
    const sbtAmount = await contract.balanceOfHolder(memberAddr)
    console.log("sbtAmount", sbtAmount)
    return sbtAmount
  }

  //get SBT holders
  useFetchEffect(
    async () => {
      const addressArray: string[] = project?.memberIds ?? []

      let holders: Holder[] = []
      for (let i = 0; i < addressArray.length; i++) {
        const holder = {
          address: addressArray[i],
          amount: ethers.BigNumber.from(
            (await getSbtAmountOfEachHolder(addressArray[i])).toString()
          ).toNumber(),
        }
        holders.push(holder)
      }

      //get users
      for (let i = 0; i < holders.length; i++) {
        const holder = holders[i]
        //get user
        const { data: owner } = await getUser(holder.address)
        if (!owner) {
          continue
        }
        setSbtOwners((currentValue) => {
          if (!currentValue) {
            return currentValue
          }
          return [
            ...currentValue,
            {
              ...owner,
              address: holder.address,
              amount: holder.amount,
            },
          ]
        })
      }
    },
    [project, user],
    {
      skipFetch: [!project, !user],
    }
  )

  return sbtOwners
}
