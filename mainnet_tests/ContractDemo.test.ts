import { before } from "mocha";
import { BigNumber, Contract } from "ethers";
const { expect } = require("chai");
const { ethers } = require("hardhat");
import { getProviderOrWallet, ProviderOrWallet } from "../networks";
import {
  getContractDemoAddress,
  getExchangeAddress,
} from "../scripts/deployment/deploy/amm/deploymentConfig";
import { protocols } from "@composable-finance/v1-sdk-defi-protocols";
const hre = require("hardhat");

const USDC_ADDRESSES = {
  1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  137: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  42161: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
};

const USDT_ADDRESSES = {
  1: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  137: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  42161: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
};

// This represents the flow of the transferals
// i.e. if the test is run in polygon (137) the tokens will be sent to Abritrum (42161)
const REMOTE_NETWORKS = {
  1: 137,
  137: 42161,
  42161: 137,
}

//TODO: prepare amount and tokens for swapping and all
//if (process.env.MODE === "LIVE") {
describe("ContractDemo Mainnet Tests", async function () {
  let contractDemo: Contract;
  let providerOrWallet: ProviderOrWallet;
  let networkId: number;
  let remoteNetworkId: number;
  let contractDemoAddress: string;
  let USDC: string;
  let USDT: string;
  let addressTo: string;

  before(async function () {
    networkId = hre.network.config.network_id;
    remoteNetworkId = Object(REMOTE_NETWORKS)[networkId];
    contractDemoAddress = getContractDemoAddress(networkId);
    providerOrWallet = await getProviderOrWallet(networkId);
    addressTo = providerOrWallet.wallet.address;
    // @ts-ignore
    USDC = USDC_ADDRESSES[networkId];
    // @ts-ignore
    USDT = USDT_ADDRESSES[networkId];
    //console.log(providerOrWallet.wallet, USDC, USDT);
    contractDemo = await ethers.getContractAt(
      "ContractDemo",
      contractDemoAddress,
      providerOrWallet.wallet
    );
  });
  describe("Oracle Tests: Mainnet", async function () {
    it("should return token price from oracle", async function () {
      const tokenPrice = await contractDemo.getTokenPrice(USDC);
      expect(tokenPrice).to.not.be.null;
    });
  });

  describe("Transferal Tests: Mainnet", async function () {
    let tokenAddress: any;
    let destinationAddress: any;
    before(async function () {
      tokenAddress = USDC;
      destinationAddress = addressTo;
    });

    it("should return true if vault is not paused", async function () {
      const isPaused = await contractDemo.isPaused();
      expect(isPaused).to.be.false;
    }).timeout(50000);

    it("should return true if token is supported", async function () {
      const isTokenSupported = await contractDemo.isTokenSupported(
        tokenAddress,
        remoteNetworkId
      );
      expect(isTokenSupported).to.be.true;
    }).timeout(50000);

    it("should return vault token balance", async function () {
      const vaultTokenBalance = await contractDemo.getVaultTokenBalance(
        tokenAddress
      );
      expect(vaultTokenBalance).to.not.be.null;
    }).timeout(50000);

    it("should return a valid fee percentage", async function () {
      const feePercentage = await contractDemo.calculateFeePercentage(
        tokenAddress,
        5000000 // 5 USDC
      );
      expect(feePercentage).to.not.be.null;
    });

    it("should deposit some token into the vault", async function () {
      const tokenAmount = 20 * 10 ** 6;  // 20 USDC
      const maxTransferDelay = 1800;  // 30 min

      const erc20 = await ethers.getContractAt(
        protocols.erc20.abi,
        tokenAddress,
        providerOrWallet.wallet
      );

      await erc20.transfer(contractDemo.address, tokenAmount, {
        gasLimit: 1000000,
      });
      console.log("Calling Deposit token into demo contract", contractDemoAddress)
      const depositTokenReceipt = await contractDemo.depositToken(
        tokenAmount,
        tokenAddress,
        destinationAddress,
        remoteNetworkId,
        maxTransferDelay,
        { gasLimit: 400000, gasPrice: 100000000000 }  // gasPrice to 100gwei
      );
      console.log(depositTokenReceipt);
      console.log("Waiting for transaction to validate");
      await depositTokenReceipt.wait();
    }).timeout(120000);
  }).timeout(120000);
  describe("ExchangeLiquidity Tests: Mainnet", async function () {

    it("should deposit USDT & USDC into a liquidity pool", async () => {
      const amountA = 5000000; // 5 USDC
      const amountB = 5000000; // 5 USDT
      const tokenA = USDC;
      const tokenB = USDT;
      const minAmountOutA = 1;
      const minAmountOutB = 1;
      const deadline = new Date().getTime() + 120;

      const USDCContract = await ethers.getContractAt(
        protocols.erc20.abi,
        USDC,
        providerOrWallet.wallet
      );
      const usdcTx = await USDCContract.transfer(contractDemo.address, amountA, {
        gasLimit: 1000000,
      });
      await usdcTx.wait();
      const USDTContract = await ethers.getContractAt(
        protocols.erc20.abi,
        USDT,
        providerOrWallet.wallet
      );
      const usdtTx = await USDTContract.transfer(contractDemo.address, amountB, {
        gasLimit: 1000000,
      });
      await usdtTx.wait();
      const depositTokenReceipt = await contractDemo.addLiquidity(
        tokenA,
        tokenB,
        amountA,
        amountB,
        minAmountOutA,
        minAmountOutB,
        addressTo,
        deadline,
        { gasLimit: 1000000 }
      );
      await depositTokenReceipt.wait();
    }).timeout(180000);

    it("should deposit USDT and WETH into the liquidity pool", async () => {
      const amountToken = 5000000; // 5 USDC
      const amountETH = 50000000000000000; // 0.05 ETH
      const minAmountOutToken = 1;
      const minAmountOutETH = 1;
      const deadline = new Date().getTime() + 120;

      const tokenContract = await ethers.getContractAt(
        protocols.erc20.abi,
        USDT,
        providerOrWallet.wallet
      );
      const tknTx = await tokenContract.transfer(contractDemo.address, amountToken, {
        gasLimit: 1000000,
      });
      await tknTx.wait();

      const depositEthReceipt = await contractDemo.addLiquidityETH(
        USDT,
        amountToken,
        minAmountOutToken,
        amountETH.toString(),
        minAmountOutETH,
        addressTo,
        deadline,
        { gasLimit: 1000000, value: amountETH.toString() }
      );
      await depositEthReceipt.wait();
    }).timeout(180000);

    it("should remove USDC & USDT tokens from liquidity pool", async () => {
      const liquidity = 4000000;
      const minAmountOutA = 1;
      const minAmountOutB = 1;
      const deadline = new Date().getTime() + 120;

      const poolAddress = await contractDemo.getPoolAddress(USDC, USDT);
      const lpTokenContract = await ethers.getContractAt(
        protocols.erc20.abi,
        poolAddress,
        providerOrWallet.wallet
      );
      const lpTx = await lpTokenContract.transfer(contractDemo.address, liquidity, {
        gasLimit: 1000000,
      });
      await lpTx.wait();

      const removeTokenReceipt = await contractDemo.removeLiquidity(
        USDC,
        USDT,
        liquidity,
        minAmountOutA,
        minAmountOutB,
        addressTo,
        deadline,
        { gasLimit: 1000000 }
      );
      await removeTokenReceipt.wait();
    }).timeout(180000);

    it("should remove USDT and WETH from liquidity pool", async () => {
      const liquidity = 4000000; // 5 USDC;
      const ETH = "0x0000000000000000000000000000000000000000";
      const minAmountOutA = 1;
      const minAmountOutB = 1;
      const deadline = new Date().getTime() + 120;

      const poolAddress = await contractDemo.getPoolAddress(USDT, ETH);
      const lpTokenContract = await ethers.getContractAt(
        protocols.erc20.abi,
        poolAddress,
        providerOrWallet.wallet
      );
      const lpTx = await lpTokenContract.transfer(contractDemo.address, liquidity, {
        gasLimit: 1000000,
      });
      await lpTx.wait();

      const removeEthReceipt = await contractDemo.removeLiquidityETH(
        USDT,
        liquidity,
        minAmountOutA,
        minAmountOutB,
        addressTo,
        deadline,
        { gasLimit: 1000000 }
      );
      await removeEthReceipt.wait();
    }).timeout(180000);
  }).timeout(360000);
  describe("Swap Tests: Mainnet", async function () {
    it("should return true swap amount from contract", async function () {
      const amountIn = BigNumber.from("5000000");
      const swapAmount = await contractDemo.getSwapAmount(USDC, USDT, amountIn);
      expect(swapAmount.toString()).to.not.be.null;
    }).timeout(50000);

    it("should successfully swap tokens", async function () {
      const amountIn = BigNumber.from("5000000"); // 5 USDC;
      const deadline = Date.now() + 120;

      const USDCContract = await ethers.getContractAt(
        protocols.erc20.abi,
        USDC,
        providerOrWallet.wallet
      );
      console.log("Transfering USDC to the contract");
      const usdcTx = await USDCContract.transfer(contractDemo.address, amountIn, {
        gasLimit: 1000000,
      });
      await usdcTx.wait();

      console.log("Now calling the swap function of the contract");
      const swapReceipt = await contractDemo.swapTokens(
        USDC,
        USDT,
        amountIn,
        deadline,
        { gasLimit: 500000, gasPrice: 100000000000 }  // gasPrice to 100gwei
      );
      console.log(swapReceipt);
      await swapReceipt.wait();
    }).timeout(180000);
  }).timeout(1800000);
});
//}
