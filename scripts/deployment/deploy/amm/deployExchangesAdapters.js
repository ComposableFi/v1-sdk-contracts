require("dotenv").config();

const { deployUpgradable } = require("../utils");

const sushiswapRouterAddress = process.env.SUSHISWAP_ROUTER_ADDRESS;

module.exports = async ({ getNamedAccounts, getChainId }) => {
	const { deployer } = await getNamedAccounts();
	const chainId = parseInt(await getChainId());
	const networkName = network.name;

	if (sushiswapRouterAddress === undefined) {
		throw `Please provide sushiswapRouterAddress in the ${networkName.toLowerCase()}.env file`;
	}

	console.log("Starting Sushiswap adapter deployment to", networkName, "network");
	console.log("Deployer account:", deployer);

	await deployUpgradable("SushiswapAdapter", [sushiswapRouterAddress]);

	console.log("Finish!");
};

module.exports.tags = ["deploy_exchanges_adapters"];

// HOW TO USE THIS
// SUSHISWAP_ROUTER_ADDRESS needs to be included in the .env file:
// TODO: refactor the above as we will need more adapters soon and the addresses are constants - create deployment config file and keep all the constants there
// Run `yarn hardhat deploy --tags deploy_exchanges_adapters --network <your_network>` or deploy:exchanges_adapters <network_name>
