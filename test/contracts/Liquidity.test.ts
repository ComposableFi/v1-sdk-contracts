import { before } from "mocha";
import { Contract } from "ethers";
const { ethers } = require("hardhat");
import { getProviderOrWallet, ProviderOrWallet } from "../../networks";

describe("ExchangeLiquidity library", function() {
  let providerOrWallet: ProviderOrWallet;
  let contractDemo: Contract;
  const addressTo = "0x0000e6203db925dbfb9e3d650a80a1e2f4a78e94";
  const mumbaiMaticTKNAddress = "0xA785B32Da0d3126DBb9FB929E46b7EE3b4AFe372";
  const mumbaiMaticTKN2Address = "0x373130be3242969A1BBB18287173880Ad3eeeAcf";

  before(async function () {
    providerOrWallet = await getProviderOrWallet("matic_mumbai");
    const ContractDemo = (await ethers.getContractFactory("ContractDemo")).connect(providerOrWallet.wallet);
    contractDemo = await ContractDemo.deploy();
    await contractDemo.deployed();
  });

  it("should deposit token liquidity into a pool", async () => {
    const amountA = "500000000";
    const amountB = "500000000";
    const tokenA = mumbaiMaticTKNAddress;
    const tokenB = mumbaiMaticTKN2Address;
    const minAmountOutA = 1;
    const minAmountOutB = 1;
    const deadline = new Date().getTime() + 120;

    const tokenAContract = await ethers.getContractAt(
      "SampleTokenERC20",
      mumbaiMaticTKNAddress,
      providerOrWallet.wallet
    );
    await tokenAContract.transfer(contractDemo.address, amountA, {gasLimit: 1000000});

    const tokenBContract = await ethers.getContractAt(
      "SampleTokenERC20",
      mumbaiMaticTKN2Address,
      providerOrWallet.wallet
    );
    await tokenBContract.transfer(contractDemo.address, amountB, {gasLimit: 1000000});
    const depositTokenReceipt = await contractDemo.addLiquidity(
      tokenA,
      tokenB,
      amountA,
      amountB,
      minAmountOutA,
      minAmountOutB,
      addressTo,
      deadline,
      {gasLimit: 1000000}
    );
    await depositTokenReceipt.wait();
  }).timeout(50000);

  it('should deposit token and WETH into the liquidity pool', async () => {
    const amountToken = "500000000";
    const amountETH = 500000000;
    const token: string = mumbaiMaticTKN2Address;
    const minAmountOutToken = 1;
    const minAmountOutETH = 1;
    const deadline = new Date().getTime() + 120;

    const tokenContract = await ethers.getContractAt(
      "SampleTokenERC20",
      token,
      providerOrWallet.wallet
    );
    await tokenContract.transfer(contractDemo.address, amountToken, {gasLimit: 1000000});

    const depositEthReceipt = await contractDemo.addLiquidityETH(
      token,
      amountToken,
      minAmountOutToken,
      amountETH.toString(),
      minAmountOutETH,
      addressTo,
      deadline,
      {gasLimit: 1000000, value: amountETH.toString()}
    );
    await depositEthReceipt.wait();
  })

  it("should remove tokens from liquidity pool", async () => {
    const addressTo = "0x0000e6203db925dbfb9e3d650a80a1e2f4a78e94";
    const liquidity = "5000";
    const tokenA = mumbaiMaticTKNAddress;
    const tokenB = mumbaiMaticTKN2Address;
    const minAmountOutA = 1;
    const minAmountOutB = 1;
    const deadline = new Date().getTime() + 120;


    const poolAddress = await contractDemo.getPoolAddress(tokenA, tokenB);
    const lpTokenContract = await ethers.getContractAt(
      "SampleTokenERC20",
      poolAddress,
      providerOrWallet.wallet
    );
    await lpTokenContract.transfer(contractDemo.address, liquidity, {gasLimit: 1000000});

    const removeTokenReceipt = await contractDemo.removeLiquidity(
      tokenA, tokenB, liquidity, minAmountOutA, minAmountOutB, addressTo, deadline, {gasLimit: 1000000}
    );
    await removeTokenReceipt.wait();
  });

  it("should remove token and WETH from liquidity pool", async () => {
    const addressTo = "0x0000e6203db925dbfb9e3d650a80a1e2f4a78e94";
    const liquidity = "5000";
    const token = mumbaiMaticTKNAddress;//mumbaiMaticTKN2Address;
    const ETH = "0x0000000000000000000000000000000000000000";
    const minAmountOutA = 1;
    const minAmountOutB = 1;
    const deadline = new Date().getTime() + 120;

    const poolAddress = await contractDemo.getPoolAddress(token, ETH);
    const lpTokenContract = await ethers.getContractAt(
      "SampleTokenERC20",
      poolAddress,
      providerOrWallet.wallet
    );
    await lpTokenContract.transfer(contractDemo.address, liquidity, {gasLimit: 1000000});

    const removeEthReceipt = await contractDemo.removeLiquidityETH(
      token, liquidity, minAmountOutA, minAmountOutB, addressTo, deadline, {gasLimit: 1000000}
    );
    await removeEthReceipt.wait();
  });
}).timeout(50000);