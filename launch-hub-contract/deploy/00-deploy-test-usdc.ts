import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
// @ts-ignore
import { developmentChains } from "../helper-hardhat-config"

const deployTestUSDC: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mock...")

        log("Deploying test USDC...")
        const testUSDC = await deploy("TestUSDC", {
            from: deployer,
            args: [],
            log: true,
        })
    }

    log("-------------------------------------------------")
}

export default deployTestUSDC

deployTestUSDC.tags = ["all", "mock"]
