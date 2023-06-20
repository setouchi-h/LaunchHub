import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
// @ts-ignore
import { developmentChains } from "../helper-hardhat-config"
// @ts-ignore
import { verify } from "../utils/verify"
import { storeImage, storeTokenUriMetadata } from "../utils/uploadToPinata"

const imageLocation = "./images"
let tokenUri: string | null = "ipfs://QmUnzswTarW8fVUH6aztH8h4sqoxuBCDyTnBrwvU4Z4T4d"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
}

const deploySecurities: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { deployments, getNamedAccounts, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (process.env.UPLOAD_TO_PINATA == "true") {
        log("Uploading to pinata...")
        tokenUri = await handleTokenUris()
    }

    log("Deploying securities...")
    const securities = await deploy("Securities", {
        from: deployer,
        args: [tokenUri],
        log: true,
    })

    if (!developmentChains.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
        log("Verifying...")
        await verify(securities.address, [tokenUri])
    }

    log("-------------------------------------------------")
}

async function handleTokenUris() {
    tokenUri = null
    const { responses: imageUploadResponses, files } = await storeImage(imageLocation)

    let tokenUriMetadata = { ...metadataTemplate }
    tokenUriMetadata.name = "testSBT"
    tokenUriMetadata.description = "This is a SBT for test!"
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[0].IpfsHash}`

    console.log("Uploading SBT metadata...")
    const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
    tokenUri = `ipfs://${metadataUploadResponse!.IpfsHash}`
    console.log("Token URI uploaded! They are:")
    console.log(tokenUri)

    return tokenUri
}

export default deploySecurities

deploySecurities.tags = ["all", "main", "securities"]
