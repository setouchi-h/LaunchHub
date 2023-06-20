import Spacer from "@/components/ui/Spacer"
import Title from "@/components/ui/Title"
import ErrorMessage from "@/components/ui/ErrorMessage"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useContext, useState } from "react"
import { useRouter } from "next/router"
import { PATHS } from "../paths"
import { usePageLeaveConfirmation } from "@/models/project/usePageLeaveConfirmation"
import { useEditingProjectState } from "@/states/editingProjectState"
import securitiesFactoryAbi from "../../../../constants/SecuritiesFactory.json"
import securitiesAbi from "../../../../constants/Securities.json"
import networkConfig from "../../../../constants/networkMapping.json"
import { useStorageUpload } from "@thirdweb-dev/react"
import { ethers } from "ethers"
import { updateProject } from "@/models/firestore/updateProject"
import { contractAddressesInterface } from "../../../types/networkAddress"
import PageContainer from "@/components/ui/PageContainer"
import LoadingCircle from "@/components/ui/LoadingCircle/LoadingCircle"
import Button from "@/components/ui/Button/Button"
import { SmartAccountContext } from "../../auth/AuthProvider"
import { ChainId } from "@biconomy/core-types"

const formInputSchema = z.object({
  sbtTokenName: z.string().nonempty({ message: "Required" }),
  sbtImage: z.custom<FileList>().transform((data) => data[0]),
})

type NewProjectAboutSbt = z.infer<typeof formInputSchema>

export default function NewProjectAboutSbtPage() {
  const { smartAccount } = useContext(SmartAccountContext)

  const router = useRouter()
  const metadataTemplate = {
    name: "",
    description: "",
    image: "",
  }

  const addresses: contractAddressesInterface = networkConfig
  const chainString = ChainId.POLYGON_MUMBAI.toString()
  // sbt factory address
  const sbtFactoryAddr = addresses[chainString].SecuritiesFactory[0]
  const { mutateAsync: upload } = useStorageUpload()
  const [editingProject, setEditingProject] = useEditingProjectState()
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(true)
  const [isPageLeaveAllowed, setIsPageLeaveAllowed] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  usePageLeaveConfirmation(isPageLeaveAllowed)
  const {
    register,
    getValues,
    formState: { errors },
  } = useForm<NewProjectAboutSbt>({ resolver: zodResolver(formInputSchema) })

  const onDeploySbt = async () => {
    setIsPageLeaveAllowed(true)
    setIsLoading(true)
    setIsButtonEnabled(false)
    if (!smartAccount) return
    try {
      const sbtTokenName = getValues("sbtTokenName")
      const sbtImage = getValues("sbtImage")
      const uri = await uploadToIpfs({ tokenName: sbtTokenName, tokenImage: sbtImage })

      const securitiesFactoryInterfacen = new ethers.utils.Interface(securitiesFactoryAbi)
      const encodedDeploySbtData = securitiesFactoryInterfacen.encodeFunctionData("deploy", [uri])
      const tx = {
        to: sbtFactoryAddr,
        data: encodedDeploySbtData,
      }
      const txResponse = await smartAccount.sendTransaction({ transaction: tx })
      console.log("userOp hash: ", txResponse.hash)
      const txReciept = await txResponse.wait()
      console.log("Tx: ", txReciept)
      const newSbtAddress = txReciept.logs[1].address

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
            name: "Securities",
            address: newSbtAddress,
            abi: JSON.stringify(securitiesAbi),
            whitelistedMethods: ["mint"],
          }),
          headers: headers,
        }
      )
        .then((response) => response.json())
        .then((json) => console.log(json))
        .catch((err) => console.log(err))

      await updateProjectData({ sbtTokenName: sbtTokenName, sbtAddress: newSbtAddress })

      if (!editingProject || !editingProject?.id) {
        return
      }
      //set editing project globally
      setEditingProject({
        ...editingProject,
        sbtTokenName: sbtTokenName,
        sbtAddress: newSbtAddress,
      })

      setIsLoading(false)
      router.push(PATHS.NEW_PROJECT.ABOUT_VAULT)
    } catch (error) {
      console.log(error)
    }
  }

  // SBTのmetadataの作成
  const uploadToIpfs = async ({
    tokenName,
    tokenImage,
  }: {
    tokenName: string
    tokenImage: File
  }) => {
    var uri: string | null = null
    if (tokenImage) {
      const uploadUri = await upload({
        data: [tokenImage],
        options: { uploadWithoutDirectory: true },
      })
      uri = uploadUri[0]
    } else {
      uri = "ipfs://QmTsfF3METLsEikk6DsJuRtdcaEoRXvzG94d7vE9bWQ4ib"
    }

    let tokenUriMetadata = { ...metadataTemplate }
    tokenUriMetadata.name = tokenName
    tokenUriMetadata.description = "SBT for Share Profit"
    tokenUriMetadata.image = uri
    const tokenUri = await upload({
      data: [tokenUriMetadata],
      options: { uploadWithoutDirectory: true },
    })
    return tokenUri[0]
  }

  const updateProjectData = async ({
    sbtTokenName,
    sbtAddress,
  }: {
    sbtTokenName: string
    sbtAddress: string
  }) => {
    if (!editingProject || !editingProject?.id) {
      return
    }
    // update project
    await updateProject({
      projectId: editingProject.id,
      project: {
        sbtTokenName: sbtTokenName,
        sbtAddress: sbtAddress,
      },
    })
  }

  return (
    <PageContainer>
      <Title>Setting up SBT</Title>
      <Spacer size={30} />

      <p>
        A soulbound token (SBT) is a non-transferable fungible token (NFT).
        <br />
        In this app, SBTs are distributed to contributors to the project, and proceeds are
        distributed among SBT owners.
      </p>
      <Spacer size={20} />

      <form>
        <div>
          <label>
            <h3>Token Name</h3>
            <input type="text" placeholder="Token name..." {...register("sbtTokenName")} />
            {errors.sbtTokenName && <ErrorMessage>{errors.sbtTokenName?.message}</ErrorMessage>}
          </label>
        </div>
        <Spacer size={20} />

        <div>
          <label>
            <h3>Token Image</h3>
          </label>
          <input type="file" accept=".jpg, .jpeg, .png" {...register("sbtImage")} />
          {errors.sbtImage && <ErrorMessage>{errors.sbtImage?.message}</ErrorMessage>}
        </div>
        <Spacer size={20} />

        {isLoading ? (
          <LoadingCircle />
        ) : (
          <>
            <Button isEnabled={isButtonEnabled} isLoading={isLoading} onClick={onDeploySbt}>
              Deploy SBT
            </Button>
          </>
        )}
      </form>
    </PageContainer>
  )
}
