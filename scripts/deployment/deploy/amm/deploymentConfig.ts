import { ethers } from "hardhat";

const EMPTY_ADDRESS = ethers.constants.AddressZero;

export const exchanges = {
  //1: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // mainnet (uniswapv2)
  1: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", // mainnet (sushiswapv2)
  3: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // ropsten (uniswapv2)
  4: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // rinkeby (uniswapv2)
  137: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", // matic (sushiswap)
  80001: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", // matic_mumbai (sushiswap)
  42161: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", // arbitrum (sushiswap)
};

export const contractDemoAddress = {
  1: "", // mainnet
  137: "0x30aa353d0fD5C2A9c703Dd179cD53FaCF1b06cA9", // matic
  42161: "", // arbitrum
};

export function getExchangeAddress(networkId: number): string {
  let exchangeAddress;
  try {
    exchangeAddress = Object(exchanges)[networkId];
    if (exchangeAddress === undefined) {
      exchangeAddress = EMPTY_ADDRESS;
    }
  } catch {
    // One of the networks does not exist
    exchangeAddress = EMPTY_ADDRESS;
  }
  return exchangeAddress;
}

export function getContractDemoAddress(networkId: number): string {
  let exchangeAddress;
  try {
    exchangeAddress = Object(contractDemoAddress)[networkId];
    if (exchangeAddress === undefined) {
      exchangeAddress = EMPTY_ADDRESS;
    }
  } catch {
    // One of the networks does not exist
    exchangeAddress = EMPTY_ADDRESS;
  }
  return exchangeAddress;
}
