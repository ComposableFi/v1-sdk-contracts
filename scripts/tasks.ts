import { task } from "hardhat/config";
//import { deployments, ethers, network } from "hardhat";
import { getProviderOrWallet } from "../networks";

// task(
//   "validateOracleDeployment",
//   "Validates correct deployment of Oracles to the mainnet"
// ).addParam("name", "Name of the deployed oracle adapter")
//   .addParam("token", "Address of the token to fetch price for")
//   .addParam("tokenPriceAggregator", "Address of the oracle aggregator for a token")
//   .addParam("network", "Network to which the oracle adapter is deployed")
//   .setAction(async function (taskArgs, hre) {
//     const deployedOracleAdapter = await hre.deployments.getOrNull(taskArgs.token);
//     if(!deployedOracleAdapter) {
//       throw `Oracle deployment ${taskArgs.name} does not exist`;
//     }
//
//     const providerOrWallet = await getProviderOrWallet(taskArgs.network);
//
//     console.log("Validating contract on network:", taskArgs.network);
//     const oracleAdapter = await hre.ethers.getContractAt(
//       deployedOracleAdapter.abi,
//       deployedOracleAdapter.address,
//       providerOrWallet.wallet
//     );
//
//     const token = taskArgs.token;
//     const tokenPriceAggregator = taskArgs.token_price_aggregator;
//     const addTokenPriceAggregator = await oracleAdapter.addTokenPriceAggregator(token, tokenPriceAggregator);
//     await addTokenPriceAggregator.wait();
//
//     const tokenPrice = (await oracleAdapter.getTokenPrice(token)).toNumber();
//     console.log('Token price : ', tokenPrice);
//   });
