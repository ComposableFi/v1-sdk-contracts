import { use } from "chai";
import { solidity } from "ethereum-waffle";

const { expect } = require("chai");
const { ethers } = require("hardhat");
import { ProviderOrWallet, getProviderOrWallet } from "../../networks";
import { before } from "mocha";
import { Contract, BigNumber } from "ethers";

use(solidity);

// For local testing use `yarn test:local test/contracts/Transferal.test.ts --network matic_mumbai`
// To test the published library use `yarn test:live test/contracts/Transferal.test.ts --network matic_mumbai`

describe("Contract Library Tests", function () {
  describe("verify Transferal.sol library", function () {
    let providerOrWallet: ProviderOrWallet;
    let contractDemo: Contract;
    const networkId = 421611;
    const vaultAddress = "0x6D701AEe4ef9418495921c32e60BFB5a0AC7a3d7";
    const vaultProxyAddress = "0x83B9511B9475d4D87598fEaE59Cbad4b3aBE451B"; //"0x593995e1D2a66086c7884986d03d4C5fd37ee615";
    const tokenAddress = "0x065270Fe2319B9E23d2894009542485EbDF125dA";
    const destinationAddress = "0x0000e6203DB925DbFB9e3d650A80a1E2f4A78e94";

    before(async function () {
      providerOrWallet = await getProviderOrWallet("matic_mumbai");
      const ContractDemo = (
        await ethers.getContractFactory("ContractDemo")
      ).connect(providerOrWallet.wallet);
      contractDemo = await ContractDemo.deploy();
      await contractDemo.deployed();
    });

    it("should return true if vault is not paused", async function () {
      const isPaused = await contractDemo.isPaused();
      expect(isPaused).to.be.false;
    }).timeout(50000);

    it("should return true if token is supported", async function () {
      const isTokenSupported = await contractDemo.isTokenSupported(
        tokenAddress,
        networkId
      );
      expect(isTokenSupported).to.be.true;
    }).timeout(50000);

    it("should return a valid fee percentage", async function () {
      const feePercentage = await contractDemo.calculateFeePercentage(
        tokenAddress,
        10
      );
      expect(feePercentage).to.not.be.null;
    });

    it("should deposit TKN to vault", async function () {
      const erc20 = await ethers.getContractAt(
        "SampleTokenERC20",
        tokenAddress,
        providerOrWallet.wallet
      );
      const txTransfer = await erc20.transfer(contractDemo.address, 10, {gasLimit: 1000000});
      await txTransfer.wait();
      const depositTokenReceipt = await contractDemo.depositToken(
        10,
        tokenAddress,
        destinationAddress,
        networkId,
        10,
        { gasLimit: 20000000 }
      );
      await depositTokenReceipt.wait();
    }).timeout(120000);
  }).timeout(120000);

});
