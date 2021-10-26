import { before } from "mocha";
const { expect } = require("chai");
const { ethers } = require("hardhat");
import { BigNumber, Contract } from "ethers";
import { getProviderOrWallet, ProviderOrWallet } from "../../networks";

// For local testing use `yarn test:local test/contracts/Swap.test.ts --network matic_mumbai`
// To test the published library use `yarn test:live test/contracts/Swap.test.ts --network matic_mumbai`


describe("verify Swap.sol library", function () {
  let providerOrWallet: ProviderOrWallet;
  let contractDemo: Contract;
  const networkId = 421611;
  const tokenAddress = "0x065270Fe2319B9E23d2894009542485EbDF125dA";

  before(async function () {
    providerOrWallet = await getProviderOrWallet("matic_mumbai");
    const ContractDemo = (
      await ethers.getContractFactory("ContractDemo")
    ).connect(providerOrWallet.wallet);
    contractDemo = await ContractDemo.deploy();
    await contractDemo.deployed();
  });

  it("should return true swap amount from contract", async function () {
    const amountIn = BigNumber.from("300000000000");
    const tokenIn = "0x065270Fe2319B9E23d2894009542485EbDF125dA";
    const tokenOut = "0x5B67676a984807a212b1c59eBFc9B3568a474F0a";
    const swapAmount = await contractDemo.getSwapAmount(
      tokenIn,
      tokenOut,
      amountIn
    );
    expect(swapAmount.toString()).to.not.be.null;
  }).timeout(50000);
  //TODO: Fix this test after publishing new contracts
  it("should successfully swap tokens", async function () {
    const amountIn = BigNumber.from("300000000000");
    const tokenIn = "0x065270Fe2319B9E23d2894009542485EbDF125dA";
    const tokenOut = "0x5B67676a984807a212b1c59eBFc9B3568a474F0a";
    const deadline = 1662019367;

    const erc20 = await ethers.getContractAt(
      "SampleTokenERC20",
      tokenAddress,
      providerOrWallet.wallet
    );
    await erc20.transfer(contractDemo.address, amountIn, {
      gasLimit: 1000000,
    });

    const swapReceipt = await contractDemo.swapTokens(
      tokenIn,
      tokenOut,
      amountIn,
      deadline,
      { gasLimit: 20000000 }
    );
    await swapReceipt.wait();
  }).timeout(50000);
}).timeout(50000);