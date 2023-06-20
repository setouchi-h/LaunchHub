import { ethers, network, deployments } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { expect, assert } from "chai"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Securities } from "../../typechain-types"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Securities SBT Unit Tests", () => {
          let securities: Securities
          let founder: SignerWithAddress, member: SignerWithAddress
          const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000"
          const URI = "ipfs://QmUnzswTarW8fVUH6aztH8h4sqoxuBCDyTnBrwvU4Z4T4d"
          const NEW_URI = "ipfs://QmSsYRx3LpDAb1GZQm7zZ1AuHZjfbPkD6J7s9r41xu1mf8"
          const TOKEN_AMOUNT = 10
          const ID = 0

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              founder = accounts[0]
              member = accounts[1]
              await deployments.fixture(["main"])
              const Securities = await deployments.get("Securities")
              securities = (await ethers.getContractAt(
                  "Securities",
                  Securities.address
              )) as Securities
          })

          describe("constructor", () => {
              it("sets starting value correctly", async () => {
                  const uri = await securities.uri(ID)
                  await expect(await securities.uri(ID)).to.be.equal(URI)
              })
          })
          describe("setURI", () => {
              it("sets new uri correctly", async () => {
                  await securities.setURI(NEW_URI)
                  await expect(await securities.uri(ID)).to.be.equal(NEW_URI)
              })
              it("exclusively allows owner to set uri", async () => {
                  securities = securities.connect(member)
                  await expect(securities.setURI(NEW_URI)).to.be.revertedWith(
                      "Ownable: caller is not the owner"
                  )
              })
          })
          describe("mint", () => {
              it("emits an event after minting", async () => {
                  await expect(securities.mint(TOKEN_AMOUNT, member.address))
                      .to.emit(securities, "SbtMinted")
                      .withArgs(member.address, 0, TOKEN_AMOUNT)
              })
              it("exclusively allows owner to mint", async () => {
                  securities = securities.connect(member)
                  await expect(securities.mint(TOKEN_AMOUNT, member.address)).to.be.revertedWith(
                      "Ownable: caller is not the owner"
                  )
              })
              it("updates balance correctly after minting", async () => {
                  await securities.mint(TOKEN_AMOUNT, member.address)
                  assert.equal(
                      (await securities.balanceOfAll()).toString(),
                      TOKEN_AMOUNT.toString()
                  )
                  assert.equal(
                      (await securities.balanceOfHolder(member.address)).toString(),
                      TOKEN_AMOUNT.toString()
                  )
              })
              it("adds array if a new participant", async () => {
                  await securities.mint(TOKEN_AMOUNT, founder.address)
                  await securities.mint(TOKEN_AMOUNT, member.address)
                  assert.equal((await securities.getHolders()).length, 2)
              })
              it("does not add array if an existing participant", async () => {
                  await securities.mint(TOKEN_AMOUNT, member.address)
                  await securities.mint(TOKEN_AMOUNT, member.address)
                  assert.equal(
                      (await securities.getHolders()).toString(),
                      member.address.toString()
                  )
                  assert.equal((await securities.getHolders()).length, 1)
              })
              it("reverts minting if holder is zero address", async () => {
                  await expect(securities.mint(TOKEN_AMOUNT, ADDRESS_ZERO)).to.be.revertedWith(
                      "ERC1155: mint to the zero address"
                  )
              })
          })
          describe("burn", () => {
              it("emits an event after burning", async () => {
                  await securities.mint(TOKEN_AMOUNT, member.address)
                  await expect(securities.burn(member.address, TOKEN_AMOUNT))
                      .to.emit(securities, "SbtBurned")
                      .withArgs(member.address, ID, TOKEN_AMOUNT)
              })
              it("exclusively allows owner to burn", async () => {
                  await securities.mint(TOKEN_AMOUNT, member.address)
                  securities = securities.connect(member)
                  await expect(securities.burn(member.address, TOKEN_AMOUNT)).to.be.revertedWith(
                      "Ownable: caller is not the owner"
                  )
              })
              it("updates balance correctly after burning", async () => {
                  const BURN_AMOUNT = 3
                  const initialAmount = (
                      await securities.balanceOfHolder(member.address)
                  ).toNumber()
                  await securities.mint(TOKEN_AMOUNT, member.address)
                  await securities.burn(member.address, BURN_AMOUNT)
                  await expect(
                      (await securities.balanceOfHolder(member.address)).toNumber()
                  ).to.be.equal(initialAmount + TOKEN_AMOUNT - BURN_AMOUNT)
                  await expect((await securities.balanceOfAll()).toNumber()).to.be.equal(
                      initialAmount + TOKEN_AMOUNT - BURN_AMOUNT
                  )
              })
              it("reverts if exceeds balance", async () => {
                  const BURN_AMOUNT = 12
                  await securities.mint(TOKEN_AMOUNT, member.address)
                  await expect(securities.burn(member.address, BURN_AMOUNT)).to.be.revertedWith(
                      "ERC1155: burn amount exceeds balance"
                  )
              })
              it("reverts burning if holder is zero address", async () => {
                  await expect(securities.burn(ADDRESS_ZERO, TOKEN_AMOUNT)).to.be.revertedWith(
                      "ERC1155: burn from the zero address"
                  )
              })
          })
          describe("safeTransferFrom", () => {
              it("reverts transfer", async () => {
                  await securities.mint(TOKEN_AMOUNT, member.address)
                  await expect(
                      securities.safeTransferFrom(
                          member.address,
                          founder.address,
                          ID,
                          TOKEN_AMOUNT,
                          "0x"
                      )
                  ).to.be.revertedWithCustomError(securities, "Securities__NonTransferable")
              })
          })
          describe("safeBatchTransferFrom", () => {
              it("reverts batch transfer", async () => {
                  await securities.mint(TOKEN_AMOUNT, member.address)
                  await expect(
                      securities.safeBatchTransferFrom(
                          member.address,
                          founder.address,
                          [ID],
                          [TOKEN_AMOUNT],
                          "0x"
                      )
                  ).to.be.revertedWithCustomError(securities, "Securities__NonTransferable")
              })
          })
          describe("setApprovalForAll", () => {
              it("reverts approval", async () => {
                  await securities.mint(TOKEN_AMOUNT, member.address)
                  await expect(
                      securities.setApprovalForAll(founder.address, true)
                  ).to.be.revertedWithCustomError(securities, "Securities__NonTransferable")
              })
          })
      })
