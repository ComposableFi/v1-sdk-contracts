const { deployments, getNamedAccounts, run } = require("hardhat");

async function deployUpgradable(contractName, initializeFunctionArgs = [], artifactName = contractName, verify = true, log = true) {
	const { deployer, user1 } = await getNamedAccounts();
	const { address } = await deployments.deploy(contractName, {
		from: deployer,
		skipIfAlreadyDeployed: true,
		contract: artifactName, // name in artifacts
		proxy: {
			owner: deployer, //TODO: replace with another address e.g. multisig address
			proxyContract: "OpenZeppelinTransparentProxy",
			execute: { init: { methodName: "initialize", args: initializeFunctionArgs } },
		},
		log,
	});
	console.log(contractName, "proxy address:", address);

	if (verify) {
		console.log("Contract verification start");
		await new Promise((resolve) => setTimeout(resolve, 5000)); /// add delay to fix issues on kovan network. TODO re-verify in the future
		try {
			const implementationDeployment = await deployments.get(`${contractName}_Implementation`);
			await run("verify:verify", { address: implementationDeployment.address, constructorArguments: [] });
		} catch (error) {
			console.warn("\n !!! Contract not verified");
			console.error(`Error: ${error.message}\n`);
		}
	}

	return address;
}

async function deployNonUpgradable(contractName, constructorArgs, skipIfAlreadyDeployed = true, log = true) {
	const { deployer } = await getNamedAccounts();
	const contract = await deployments.deploy(contractName, {
		from: deployer,
		skipIfAlreadyDeployed: skipIfAlreadyDeployed,
		contract: contractName,
		args: constructorArgs,
		log,
	});
	console.log(`${contractName} deployed at address: ${contract.address}`);
	return contract;
}

module.exports = {
	deployUpgradable,
	deployNonUpgradable,
};
