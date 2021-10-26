const { ethers, upgrades } = require("hardhat");

// TODO - replace .js for .ts and read value for relevant chainID from Config contract
const exchangeAdaptersProxyAddress = process.env.EXCHANGE_ADAPTER_PROXY_ADDRESS;
module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
	const { deployer } = await getNamedAccounts();
	const chainId = await getChainId();

	console.log("Start upgrading to", chainId, "network");
	console.log("Deployer account:", deployer);

	const SushiswapAdapter = await ethers.getContractFactory("SushiswapAdapter");
	const result = await upgrades.upgradeProxy(exchangeAdaptersProxyAddress, SushiswapAdapter);
	console.log(result);
	console.log("VaultL1 has been upgraded to the new version");
};

module.exports.tags = ["upgrade_exchanges_adapters"];
