import { deployments, ethers, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { SecuritiesFactory, Securities } from "../../typechain-types"
import { expect } from "chai"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("SecuritiesFactory Unit Tests", () => {
          let securitiesFactory: SecuritiesFactory, securities: Securities
          let deployer: SignerWithAddress, founder: SignerWithAddress, admin: SignerWithAddress
          const URI = "ipfs://QmUnzswTarW8fVUH6aztH8h4sqoxuBCDyTnBrwvU4Z4T4d"
          const ID = 0

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              admin = accounts[1]
              founder = accounts[2]

              await deployments.fixture(["securitiesFactory"])
              const SecuritiesFactory = await deployments.get("SecuritiesFactory")
              securitiesFactory = (await ethers.getContractAt(
                  "SecuritiesFactory",
                  SecuritiesFactory.address
              )) as SecuritiesFactory
          })

          describe("deploy", () => {
              beforeEach(() => {
                  securitiesFactory = securitiesFactory.connect(founder)
              })
              it("emits an event after deploying", async () => {
                  await expect(securitiesFactory.deploy(URI)).to.emit(
                      securitiesFactory,
                      "SecuritiesDeployed"
                  )
              })
              it("transfers ownership correctly", async () => {
                  const txResponse = await securitiesFactory.deploy(URI)
                  const txReceipt = await txResponse.wait(1)
                  const event = txReceipt.events?.find((x) => x.event === "SecuritiesDeployed")

                  securities = (await ethers.getContractAt(
                      "Securities",
                      event?.args?._securitiesAddr
                  )) as Securities
                  await expect(await securities.owner()).to.be.equal(founder.address)
              })
              it("sets uri correctly", async () => {
                  const txResponse = await securitiesFactory.deploy(URI)
                  const txReceipt = await txResponse.wait(1)
                  const event = txReceipt.events?.find((x) => x.event === "SecuritiesDeployed")

                  securities = (await ethers.getContractAt(
                      "Securities",
                      event?.args?._securitiesAddr
                  )) as Securities
                  await expect(await securities.uri(ID)).to.be.equal(URI)
              })
          })
      })
