import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "./scripts/tasks";
import "hardhat-deploy";
import "solidity-coverage";
require("@openzeppelin/hardhat-upgrades");
require("hardhat-abi-exporter");
require("@nomiclabs/hardhat-etherscan");

import networks from "./networks";
require("dotenv").config();

export default {
  networks: networks,
  solidity: {
    compilers: [
      { version: "0.5.17" },
      { version: "0.7.3" },
      { version: "0.7.6" },
      { version: "0.6.8" },
      { version: "0.6.4" },
      { version: "0.8.4" },
    ],
  },
  typechain: {
    outDir: "types/",
    target: "ethers-v5",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  abiExporter: {
    path: "./abi",
    clear: true,
    flat: true,
    spacing: 2,
    pretty: false,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    abi: "./abi",
    deploy: "./scripts/deployment/deploy",
    deployments: "./scripts/deployment/deployments",
  },
  namedAccounts: {
    deployer: 0,
  },
};
