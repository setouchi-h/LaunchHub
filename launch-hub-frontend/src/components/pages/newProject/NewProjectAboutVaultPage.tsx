import Spacer from "@/components/ui/Spacer"
import Title from "@/components/ui/Title"
import { updateProject } from "@/models/firestore/updateProject"
import { usePageLeaveConfirmation } from "@/models/project/usePageLeaveConfirmation"
import { useEditingProjectValue } from "@/states/editingProjectState"
import { useRouter } from "next/router"
import { useContext, useState } from "react"
import { PATHS } from "../paths"
import accountFactoryAbi from "../../../../constants/AccountFactory.json"
import accountAbi from "../../../../constants/Account.json"
import networkConfig from "../../../../constants/networkMapping.json"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import ErrorMessage from "@/components/ui/ErrorMessage"
import { contractAddressesInterface } from "../../../types/networkAddress"
import PageContainer from "@/components/ui/PageContainer"
import { SmartAccountContext } from "../../auth/AuthProvider"
import { ChainId } from "@biconomy/core-types"
import Button from "@/components/ui/Button"
import { ethers } from "ethers"

const formInputSchema = z.object({
  ownerProfitShare: z
    .number()
    .int({ message: "Value must be an integer" })
    .min(0, { message: "Value must be between 0 and 100" })
    .max(100, { message: "Value must be between 0 and 100" }),
})

type NewProjectAboutVault = z.infer<typeof formInputSchema>

export default function NewProjectAboutVaultPage() {
  const { smartAccount } = useContext(SmartAccountContext)

  const addresses: contractAddressesInterface = networkConfig
  const chainString = ChainId.POLYGON_MUMBAI.toString()
  const accountFactoryAddr = addresses[chainString].AccountFactory[0]
  const adminAddr = "0x8eBD4fAa4fcEEF064dCaEa48A3f75d0D0A3ba3f2"

  const router = useRouter()
  const editingProject = useEditingProjectValue()
  const {
    register,
    getValues,
    formState: { errors },
  } = useForm<NewProjectAboutVault>({ resolver: zodResolver(formInputSchema) })
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(true)
  const [isPageLeaveAllowed, setIsPageLeaveAllowed] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  usePageLeaveConfirmation(isPageLeaveAllowed)

  const onDeployVault = async () => {
    setIsPageLeaveAllowed(true)
    setIsLoading(true)
    setIsButtonEnabled(false)
    if (!smartAccount) return
    try {
      const accountFactoryInterface = new ethers.utils.Interface(accountFactoryAbi)
      const encodedDeployAccountData = accountFactoryInterface.encodeFunctionData("deploy", [
        adminAddr,
        editingProject?.sbtAddress,
        getValues("ownerProfitShare"),
      ])
      const tx = {
        to: accountFactoryAddr,
        data: encodedDeployAccountData,
      }
      const txResponse = await smartAccount.sendTransaction({ transaction: tx })
      console.log("userOp hash: ", txResponse.hash)
      const txReciept = await txResponse.wait()
      console.log("Tx: ", txReciept)
      const newVaultAddress = txReciept.logs[1].address

      const headers = new Headers()
      headers.append("Content-Type", "application/json")
      if (process.env.NEXT_PUBLIC_BICONOMY_DASHBOARD_AUTH_KEY) {
        headers.append("authToken", process.env.NEXT_PUBLIC_BICONOMY_DASHBOARD_AUTH_KEY)
      }
      if (process.env.NEXT_PUBLIC_BICONOMY_API_KEY) {
        headers.append("apiKey", process.env.NEXT_PUBLIC_BICONOMY_API_KEY)
      }
      fetch(
        "https://paymaster-dashboard-backend.prod.biconomy.io/api/v1/public/sdk/smart-contract",
        {
          method: "POST",
          body: JSON.stringify({
            name: "Account",
            address: newVaultAddress,
            abi: JSON.stringify(accountAbi),
            whitelistedMethods: ["withdrawEth", "withdrawToken"],
          }),
          headers: headers,
        }
      )
        .then((response) => response.json())
        .then((json) => console.log(json))
        .catch((err) => console.log(err))

      if (!editingProject || !editingProject.id) {
        return
      }
      await updateProject({
        projectId: editingProject.id,
        project: {
          ...editingProject,
          vaultAddress: newVaultAddress,
          ownerProfitShare: getValues("ownerProfitShare"),
          state: "ongoing",
          lastModifiedAt: new Date(),
        },
      })

      setIsLoading(false)

      //go to project page
      router.push(PATHS.PROJECT(editingProject.id))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <PageContainer>
      <Title>Creating Treasury Contract for the Project</Title>
      <Spacer size={30} />

      <p>
        Project sales are accumulated in the treasury contract.
        <br />
        Sales stored in the treasury contract will be divided into bounties for project owners,
        contributors, and a service fee.
      </p>
      <Spacer size={20} />

      <p>SBT address</p>
      <p>{editingProject?.sbtAddress}</p>
      <Spacer size={20} />

      <div>
        <label>
          <h3>Founder&apos;s share of the profit(%)</h3>
          <input
            type="number"
            placeholder="Proportion"
            {...register("ownerProfitShare", { valueAsNumber: true })}
          />
          {errors.ownerProfitShare && (
            <ErrorMessage>{errors.ownerProfitShare?.message}</ErrorMessage>
          )}
        </label>
      </div>
      <Spacer size={20} />

      <Button isEnabled={isButtonEnabled} isLoading={isLoading} onClick={onDeployVault}>
        Deploy Vault
      </Button>
    </PageContainer>
  )
}
