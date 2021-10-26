require("dotenv").config();
const { ethers } = require("hardhat");
const { deployUpgradable } = require("../utils");
const { getProviderOrWallet } = require("../../../../networks");

// TODO: read next two lines from Config, switch to .ts
const uniswapRouterAddress = process.env.UNISWAP_ROUTER_ADDRESS;
const exchangeConfigAddress = process.env.EXCHANGE_CONFIG_ADDRESS;

module.exports = async ({ getNamedAccounts, getChainId }) => {
	const { deployer } = await getNamedAccounts();
	const chainId = parseInt(await getChainId());
	const networkName = network.name;
	const providerOrWallet = await getProviderOrWallet(networkName);

	if (!uniswapRouterAddress) {
		throw `Please provide sushiswapRouterAddress in the ${networkName.toLowerCase()}.env file`;
	}

	console.log("Starting Sushiswap adapter deployment to", networkName, "network");
	console.log("Deployer account:", deployer);

	const adapterAddress = await deployUpgradable("UniswapV2Adapter", [uniswapRouterAddress]);

	const ammId = ethers.utils.formatBytes32String("uniswapv2");
	console.log(chainId, ammId, adapterAddress);
	const exchangesConfigModule = await ethers.getContractAt("ExchangesConfigModule", exchangeConfigAddress, providerOrWallet.wallet);
	console.log(exchangeConfigAddress);
	const tx = await exchangesConfigModule.setExchangeAdapterAddress(chainId, ammId, adapterAddress);
	await tx.wait();
	console.log(tx);

	console.log(await exchangesConfigModule.getNetworkExchangeAdapterAddress(chainId, ammId));
	console.log("Finish!");
};

module.exports.tags = ["deploy:Uniswap_Adapter"];

// HOW TO USE THIS
// SUSHISWAP_ROUTER_ADDRESS needs to be included in the .env file
// Run `yarn hardhat deploy --tags SushiswapAdapter --network <your_network>`

//UniswapV2Adapter proxy address: 0x88D53A82647a8e22cC9fAbf36C73f508df0fF2B1
