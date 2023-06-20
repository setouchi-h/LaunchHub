import Spacer from "@/components/ui/Spacer"
import Title from "@/components/ui/Title"
import ErrorMessage from "@/components/ui/ErrorMessage"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/router"
import { PATHS } from "../paths"
import { usePageLeaveConfirmation } from "@/models/project/usePageLeaveConfirmation"
import { useEditingProjectState } from "@/states/editingProjectState"
import securitiesFactoryAbi from "../../../../constants/SecuritiesFactory.json"
import networkConfig from "../../../../constants/networkMapping.json"
import { SmartContract, Web3Button, useStorageUpload } from "@thirdweb-dev/react"
import { ethers } from "ethers"
import { updateProject } from "@/models/firestore/updateProject"
import { contractAddressesInterface } from "../../../types/networkAddress"
import { Astar } from "@thirdweb-dev/chains"
import PageContainer from "@/components/ui/PageContainer"

const formInputSchema = z.object({
  sbtTokenName: z.string().nonempty({ message: "Required" }),
  sbtImage: z.custom<FileList>().transform((data) => data[0]),
})

type NewProjectAboutSbt = z.infer<typeof formInputSchema>

export default function NewProjectAboutSbtPage() {
  const router = useRouter()
  const metadataTemplate = {
    name: "",
    description: "",
    image: "",
  }

  const addresses: contractAddressesInterface = networkConfig
  const chainString = Astar.chainId.toString()
  // sbt factory address
  const sbtFactoryAddr = addresses[chainString].SecuritiesFactory[0]
  const { mutateAsync: upload } = useStorageUpload()
  const [editingProject, setEditingProject] = useEditingProjectState()
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(true)
  const [isPageLeaveAllowed, setIsPageLeaveAllowed] = useState<boolean>(false)
  usePageLeaveConfirmation(isPageLeaveAllowed)
  const {
    register,
    getValues,
    formState: { errors },
  } = useForm<NewProjectAboutSbt>({ resolver: zodResolver(formInputSchema) })

  const onDeploySbt = async (contract: SmartContract<ethers.BaseContract>) => {
    setIsPageLeaveAllowed(true)
    const sbtTokenName = getValues("sbtTokenName")
    const sbtImage = getValues("sbtImage")
    const uri = await uploadToIpfs({ tokenName: sbtTokenName, tokenImage: sbtImage })
    const tx = await contract.call("deploy", [uri])
    const sbtAddress = tx.receipt.events[0].address as string

    setIsButtonEnabled(false)
    setIsPageLeaveAllowed(true)

    await updateProjectData({ sbtTokenName: sbtTokenName, sbtAddress: sbtAddress })

    if (!editingProject || !editingProject?.id) {
      return
    }
    //set editing project globally
    setEditingProject({
      ...editingProject,
      sbtTokenName: sbtTokenName,
      sbtAddress: sbtAddress,
    })

    router.push(PATHS.NEW_PROJECT.ABOUT_VAULT)
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
            <p>Token Name</p>
            <input type="text" placeholder="Token name..." {...register("sbtTokenName")} />
            {errors.sbtTokenName && <ErrorMessage>{errors.sbtTokenName?.message}</ErrorMessage>}
          </label>
        </div>
        <Spacer size={20} />

        <div>
          <label>
            <p>Token Image</p>
          </label>
          <input type="file" accept=".jpg, .jpeg, .png" {...register("sbtImage")} />
          {errors.sbtImage && <ErrorMessage>{errors.sbtImage?.message}</ErrorMessage>}
        </div>
        <Spacer size={20} />

        <Web3Button
          contractAddress={sbtFactoryAddr}
          contractAbi={securitiesFactoryAbi}
          action={onDeploySbt}
          onError={(error) => console.log(error)}
          isDisabled={!isButtonEnabled}
        >
          Deploy SBT
        </Web3Button>
      </form>
    </PageContainer>
  )
}
