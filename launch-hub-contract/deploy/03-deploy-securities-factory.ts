import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
// @ts-ignore
import { verify } from "../utils/verify"
// @ts-ignore
import { developmentChains } from "../helper-hardhat-config"

const deploySecuritiesFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("Deploying factory...")
    const args: null[] = []
    const securiteisFactory = await deploy("SecuritiesFactory", {
        from: deployer,
        args,
        log: true,
    })

    if (!developmentChains.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
        log("Verifying...")
        await verify(securiteisFactory.address, args)
    }

    log("-------------------------------------------------")
}

export default deploySecuritiesFactory

deploySecuritiesFactory.tags = ["all", "factory", "securitiesFactory"]
