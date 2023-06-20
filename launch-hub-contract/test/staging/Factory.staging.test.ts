import { ethers, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { Factory } from "../../typechain-types"

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Factory Staging Tests", () => {
          let factory: Factory

          beforeEach(async () => {
              const FactoryFactory = await ethers.getContractFactory("Factory")
              factory = (await FactoryFactory.deploy()) as Factory
          })

          it("")
      })
