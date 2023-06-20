import { useState } from "react"
import { useFetchEffect } from "./useFetchEffect"
import { Holder, SbtOwner } from "@/types/SbtOwner"
import securitiesAbi from "../../../constants/Securities.json"
import { holdersFromChain } from "../firestore/dataConverter"
import { getUser } from "../firestore/getUser"
import { useContract, useContractRead } from "@thirdweb-dev/react"

export const useGetSbtHolders = (sbtAddress: string) => {
  const [sbtOwners, setSbtOwners] = useState<SbtOwner[]>([])
  const { contract: sbtContract } = useContract(sbtAddress, securitiesAbi)
  const { data: sbtHolders, error: getHoldersError } = useContractRead(sbtContract, "getHolders")
  if (getHoldersError) {
    console.error(getHoldersError)
  }

  //get SBT holders
  useFetchEffect(
    async () => {
      //get sbt holders
      let holders: Holder[] = []
      try {
        const receivedHolders = sbtHolders
        holders = holdersFromChain(receivedHolders)
      } catch {}

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
            },
          ]
        })
      }
    },
    [],
    {
      skipFetch: [],
    }
  )

  return sbtOwners
}

// import { useState } from "react"
// import { useFetchEffect } from "./useFetchEffect"
// import { Holder, SbtOwner } from "@/types/SbtOwner"
// import securitiesAbi from "../../../constants/Securities.json"
// import { getUser } from "../firestore/getUser"
// import { ethers } from "ethers"
// import { useUserValue } from "@/states/userState"
// import { useRouter } from "next/router"
// import { useGetProject } from "./useGetProject"
// import { useContract, useContractRead } from "@thirdweb-dev/react"

// export const useGetSbtHolders = (sbtAddress: string) => {
//   const router = useRouter()
//   const { projectId, taskId } = router.query
//   const { project } = useGetProject(projectId)
//   const [sbtOwners, setSbtOwners] = useState<SbtOwner[]>([])
//   const user = useUserValue()

//   // console.log("project", project)
//   // console.log("sbtAddress", project?.sbtAddress)
//   // const contract = new ethers.Contract(project?.sbtAddress!, securitiesAbi, user?.provider)
//   // const sbtAmount = await contract.balanceOfHolder(memberAddr)
//   // console.log("sbtAmount", sbtAmount)
//   const { contract: sbtContract } = useContract(sbtAddress, securitiesAbi)
//   const { data: sbtHolders, error: getHoldersError } = useContractRead(sbtContract, "balanceOfHolder", [member])
//   if (getHoldersError) {
//     console.error(getHoldersError)
//   }

//   //get SBT holders
//   useFetchEffect(
//     async () => {
//       const addressArray: string[] = project?.memberIds ?? []

//       let holders: Holder[] = []
//       for (let i = 0; i < addressArray.length; i++) {
//         const holder = {
//           address: addressArray[i],
//           amount: ethers.BigNumber.from(
//             (await getSbtAmountOfEachHolder(addressArray[i])).toString()
//           ).toNumber(),
//         }
//         holders.push(holder)
//       }

//       //get users
//       for (let i = 0; i < holders.length; i++) {
//         const holder = holders[i]
//         //get user
//         const { data: owner } = await getUser(holder.address)
//         if (!owner) {
//           continue
//         }
//         setSbtOwners((currentValue) => {
//           if (!currentValue) {
//             return currentValue
//           }
//           return [
//             ...currentValue,
//             {
//               ...owner,
//               address: holder.address,
//               amount: holder.amount,
//             },
//           ]
//         })
//       }
//     },
//     [project, user],
//     {
//       skipFetch: [!project, !user],
//     }
//   )

//   return sbtOwners
// }
