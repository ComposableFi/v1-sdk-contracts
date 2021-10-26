/* global ethers */
/* eslint prefer-const: "off" */

import { getSelectors, DModulesAction } from "./libraries/proxyModules.js";

async function deployDProxyModules() {
	const accounts = await ethers.getSigners();
	const contractOwner = accounts[0];

	// deploy DModulesActions
	const DModulesActions = await ethers.getContractFactory("DModulesActions");
	const dModulesActions = await DModulesActions.deploy();
	await dModulesActions.deployed();
	console.log("DModulesActions deployed:", dModulesActions.address);

	// deploy DProxyModules
	const DProxyModules = await ethers.getContractFactory("ProtocolConfigProxy");
	const dProxyModules = await DProxyModules.deploy(contractOwner.address, dModulesActions.address);
	await dProxyModules.deployed();
	console.log("DProxyModules deployed:", dProxyModules.address);

	// deploy DProxyModulesInit
	// DProxyModulesInit provides a function that is called when the dProxyModules is upgraded to initialize state variables
	// Read about how the dModulesActions function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
	const DProxyModulesInit = await ethers.getContractFactory("DProxyModulesInit");
	const dProxyModulesInit = await DProxyModulesInit.deploy();
	await dProxyModulesInit.deployed();
	console.log("DProxyModulesInit deployed:", dProxyModulesInit.address);

	// deploy core modules
	console.log("");
	console.log("Deploying core modules");
	const ModuleNames = ["DProxyModulesFuncSelectors", "OwnershipModule"];
	const modulesActions = [];
	for (const ModuleName of ModuleNames) {
		const Module = await ethers.getContractFactory(ModuleName);
		const module = await Module.deploy();
		await module.deployed();
		console.log(`${ModuleName} deployed: ${module.address}`);
		modulesActions.push({
			moduleAddress: module.address,
			action: DModulesAction.Add,
			functionSelectors: getSelectors(module),
		});
	}

	console.log("Deploying business logic modules"); // your custom modules
	const CustomModuleNames = ["ExchangesConfigModule", "NetworksConfigModule"];
	const customModulesActions = [];
	for (const ModuleName of CustomModuleNames) {
		const Module = await ethers.getContractFactory(ModuleName);
		const module = await Module.deploy();
		await module.deployed();
		console.log(`${ModuleName} deployed: ${module.address}`);
		modulesActions.push({
			moduleAddress: module.address,
			action: DModulesAction.Add,
			functionSelectors: getSelectors(module),
		});
	}

	// upgrade dProxyModules with modules
	//console.log("");
	//console.log("DProxyModules modulesActions:", modulesActions);
	const iDModulesActions = await ethers.getContractAt("IDModulesActions", dProxyModules.address);
	let tx;
	let receipt;
	// call to init function
	let functionCall = dProxyModulesInit.interface.encodeFunctionData("init");
	tx = await iDModulesActions.runModuleFuncSelectorsAction(modulesActions, dProxyModulesInit.address, functionCall);
	console.log("DProxyModules modulesActions tx: ", tx.hash);
	receipt = await tx.wait();
	if (!receipt.status) {
		throw Error(`DProxyModules upgrade failed: ${tx.hash}`);
	}
	console.log("Completed dProxyModules modulesActions");
	return dProxyModules.address;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
	deployDProxyModules()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error(error);
			process.exit(1);
		});
}

const _deployDProxyModules = deployDProxyModules;
export { _deployDProxyModules as deployDProxyModules };
