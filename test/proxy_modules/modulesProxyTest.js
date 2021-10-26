/* global describe it before ethers */

import {
	getSelectors,
	DModulesAction,
	removeSelectors,
	findAddressPositionInModules,
} from "../../scripts/deployment/config/libraries/proxyModules.js";

import { deployDProxyModules } from "../../scripts/deployment/config/deployConfig.js";

import { assert } from "chai";

describe("DModulesProxyTest", async function () {
	let dModulesProxyAddress;
	let dModulesActions;
	let dProxyModulesFuncSelectors;
	let ownershipModule;
	let exchangesConfigModule, networksConfigModule;
	let tx;
	let receipt;
	let result;
	const addresses = [];

	before(async function () {
		dModulesProxyAddress = await deployDProxyModules();
		dModulesActions = await ethers.getContractAt("DModulesActions", dModulesProxyAddress);
		dProxyModulesFuncSelectors = await ethers.getContractAt("DProxyModulesFuncSelectors", dModulesProxyAddress);
		ownershipModule = await ethers.getContractAt("OwnershipModule", dModulesProxyAddress);
		exchangesConfigModule = await ethers.getContractAt("ExchangesConfigModule", dModulesProxyAddress);
		networksConfigModule = await ethers.getContractAt("NetworksConfigModule", dModulesProxyAddress);

		for (const address of await dProxyModulesFuncSelectors.getAllModulesAddresses()) {
			//console.log("adding module address: ", address);
			addresses.push(address);
		}
	});

	//TODO: remove or change num of modules upon new modules added
	it("should have 5 modules -- call to modulesAddresses function", async () => {
		assert.equal(addresses.length, 5);
	});

	it("modules should have the right function selectors -- call to getModuleFuncSelectors function", async () => {
		let selectors = getSelectors(dModulesActions);
		result = await dProxyModulesFuncSelectors.getModuleFuncSelectors(addresses[0]);
		assert.sameMembers(result, selectors);
		selectors = getSelectors(dProxyModulesFuncSelectors);
		result = await dProxyModulesFuncSelectors.getModuleFuncSelectors(addresses[1]);
		assert.sameMembers(result, selectors);
		selectors = getSelectors(ownershipModule);
		result = await dProxyModulesFuncSelectors.getModuleFuncSelectors(addresses[2]);
		assert.sameMembers(result, selectors);
		selectors = getSelectors(exchangesConfigModule);
		result = await dProxyModulesFuncSelectors.getModuleFuncSelectors(addresses[3]);
		assert.sameMembers(result, selectors);
		selectors = getSelectors(networksConfigModule);
		result = await dProxyModulesFuncSelectors.getModuleFuncSelectors(addresses[4]);
		assert.sameMembers(result, selectors);
	});

	it("selectors should be associated to modules correctly -- multiple calls to moduleAddress function", async () => {
		assert.equal(addresses[0], await dProxyModulesFuncSelectors.moduleAddress("0x69ea61d0"));
		assert.equal(addresses[1], await dProxyModulesFuncSelectors.moduleAddress("0x40aad2fa"));
		assert.equal(addresses[1], await dProxyModulesFuncSelectors.moduleAddress("0x01ffc9a7"));
		assert.equal(addresses[2], await dProxyModulesFuncSelectors.moduleAddress("0xf2fde38b"));
		assert.equal(addresses[2], await dProxyModulesFuncSelectors.moduleAddress("0x8da5cb5b"));
	});

	it("should add test1 functions", async () => {
		const Test1Module = await ethers.getContractFactory("Test1Module");
		const test1Module = await Test1Module.deploy();
		await test1Module.deployed();
		addresses.push(test1Module.address);
		const selectors = getSelectors(test1Module).remove(["supportsInterface(bytes4)"]);
		tx = await dModulesActions.runModuleFuncSelectorsAction(
			[
				{
					moduleAddress: test1Module.address,
					action: DModulesAction.Add,
					functionSelectors: selectors,
				},
			],
			ethers.constants.AddressZero,
			"0x",
			{ gasLimit: 800000 }
		);
		receipt = await tx.wait();
		if (!receipt.status) {
			throw Error(`ProxyModules upgrade failed: ${tx.hash}`);
		}
		result = await dProxyModulesFuncSelectors.getModuleFuncSelectors(test1Module.address);
		assert.sameMembers(result, selectors);
	});

	it("should test function call", async () => {
		const test1Module = await ethers.getContractAt("Test1Module", dModulesProxyAddress);
		await test1Module.test1Func10();
	});

	it("should replace supportsInterface function", async () => {
		const Test1Module = await ethers.getContractFactory("Test1Module");
		const selectors = getSelectors(Test1Module).get(["supportsInterface(bytes4)"]);
		const testModuleAddress = addresses[5];
		tx = await dModulesActions.runModuleFuncSelectorsAction(
			[
				{
					moduleAddress: testModuleAddress,
					action: DModulesAction.Replace,
					functionSelectors: selectors,
				},
			],
			ethers.constants.AddressZero,
			"0x",
			{ gasLimit: 800000 }
		);
		receipt = await tx.wait();
		if (!receipt.status) {
			throw Error(`ProxyModules upgrade failed: ${tx.hash}`);
		}
		result = await dProxyModulesFuncSelectors.getModuleFuncSelectors(testModuleAddress);
		assert.sameMembers(result, getSelectors(Test1Module));
	});

	it("should add test2 functions", async () => {
		const Test2Module = await ethers.getContractFactory("Test2Module");
		const test2Module = await Test2Module.deploy();
		await test2Module.deployed();
		addresses.push(test2Module.address);
		const selectors = getSelectors(test2Module);
		tx = await dModulesActions.runModuleFuncSelectorsAction(
			[
				{
					moduleAddress: test2Module.address,
					action: DModulesAction.Add,
					functionSelectors: selectors,
				},
			],
			ethers.constants.AddressZero,
			"0x",
			{ gasLimit: 800000 }
		);
		receipt = await tx.wait();
		if (!receipt.status) {
			throw Error(`ProxyModules upgrade failed: ${tx.hash}`);
		}
		result = await dProxyModulesFuncSelectors.getModuleFuncSelectors(test2Module.address);
		assert.sameMembers(result, selectors);
	});

	it("should remove some test2 functions", async () => {
		const test2Module = await ethers.getContractAt("Test2Module", dModulesProxyAddress);
		const functionsToKeep = ["test2Func1()", "test2Func5()", "test2Func6()", "test2Func19()", "test2Func20()"];
		const selectors = getSelectors(test2Module).remove(functionsToKeep);
		tx = await dModulesActions.runModuleFuncSelectorsAction(
			[
				{
					moduleAddress: ethers.constants.AddressZero,
					action: DModulesAction.Remove,
					functionSelectors: selectors,
				},
			],
			ethers.constants.AddressZero,
			"0x",
			{ gasLimit: 800000 }
		);
		receipt = await tx.wait();
		if (!receipt.status) {
			throw Error(`ProxyModules upgrade failed: ${tx.hash}`);
		}
		result = await dProxyModulesFuncSelectors.getModuleFuncSelectors(addresses[6]);
		assert.sameMembers(result, getSelectors(test2Module).get(functionsToKeep));
	});

	it("should remove some test1 functions", async () => {
		const test1Module = await ethers.getContractAt("Test1Module", dModulesProxyAddress);
		const functionsToKeep = ["test1Func2()", "test1Func11()", "test1Func12()"];
		const selectors = getSelectors(test1Module).remove(functionsToKeep);
		tx = await dModulesActions.runModuleFuncSelectorsAction(
			[
				{
					moduleAddress: ethers.constants.AddressZero,
					action: DModulesAction.Remove,
					functionSelectors: selectors,
				},
			],
			ethers.constants.AddressZero,
			"0x",
			{ gasLimit: 800000 }
		);
		receipt = await tx.wait();
		if (!receipt.status) {
			throw Error(`ProxyModules upgrade failed: ${tx.hash}`);
		}
		result = await dProxyModulesFuncSelectors.getModuleFuncSelectors(addresses[5]);
		assert.sameMembers(result, getSelectors(test1Module).get(functionsToKeep));
	});

	it("remove all functions and modules except 'runModuleFuncSelectorsAction' and 'getAllModulesFuncSelectors'", async () => {
		let selectors = [];
		let modules = await dProxyModulesFuncSelectors.getAllModulesFuncSelectors();
		for (let i = 0; i < modules.length; i++) {
			selectors.push(...modules[i].functionSelectors);
		}
		selectors = removeSelectors(selectors, [
			"getAllModulesFuncSelectors()",
			"runModuleFuncSelectorsAction(tuple(address,uint8,bytes4[])[],address,bytes)",
		]);
		tx = await dModulesActions.runModuleFuncSelectorsAction(
			[
				{
					moduleAddress: ethers.constants.AddressZero,
					action: DModulesAction.Remove,
					functionSelectors: selectors,
				},
			],
			ethers.constants.AddressZero,
			"0x",
			{ gasLimit: 800000 }
		);
		receipt = await tx.wait();
		if (!receipt.status) {
			throw Error(`ProxyModules upgrade failed: ${tx.hash}`);
		}
		modules = await dProxyModulesFuncSelectors.getAllModulesFuncSelectors();

		assert.equal(modules.length, 2);
		assert.equal(modules[0][0], addresses[0]);
		assert.sameMembers(modules[0][1], ["0x69ea61d0"]);
		assert.equal(modules[1][0], addresses[1]);
		assert.sameMembers(modules[1][1], ["0x697f9960"]);
	});

	it("add most functions and modules", async () => {
		const modulesFuncSelectors = getSelectors(dProxyModulesFuncSelectors).remove(["supportsInterface(bytes4)"]);
		const Test1Module = await ethers.getContractFactory("Test1Module");
		const Test2Module = await ethers.getContractFactory("Test2Module");
		// Any number of functions from any number of modules can be added/replaced/removed in a
		// single transaction
		const actions = [
			{
				moduleAddress: addresses[1],
				action: DModulesAction.Add,
				functionSelectors: modulesFuncSelectors.remove(["getAllModulesFuncSelectors()"]),
			},
			{
				moduleAddress: addresses[2],
				action: DModulesAction.Add,
				functionSelectors: getSelectors(ownershipModule),
			},
			{
				moduleAddress: addresses[3],
				action: DModulesAction.Add,
				functionSelectors: getSelectors(exchangesConfigModule),
			},
			{
				moduleAddress: addresses[4],
				action: DModulesAction.Add,
				functionSelectors: getSelectors(networksConfigModule),
			},

			{
				moduleAddress: addresses[5],
				action: DModulesAction.Add,
				functionSelectors: getSelectors(Test1Module),
			},
			{
				moduleAddress: addresses[6],
				action: DModulesAction.Add,
				functionSelectors: getSelectors(Test2Module),
			},
		];
		tx = await dModulesActions.runModuleFuncSelectorsAction(actions, ethers.constants.AddressZero, "0x", { gasLimit: 8000000 });
		receipt = await tx.wait();
		if (!receipt.status) {
			throw Error(`ProxyModules upgrade failed: ${tx.hash}`);
		}
		const modules = await dProxyModulesFuncSelectors.getAllModulesFuncSelectors();
		const moduleAddresses = await dProxyModulesFuncSelectors.getAllModulesAddresses();

		assert.equal(moduleAddresses.length, 7);
		assert.equal(modules.length, 7);
		assert.sameMembers(moduleAddresses, addresses);
		assert.equal(modules[0][0], moduleAddresses[0], "first module");
		assert.equal(modules[1][0], moduleAddresses[1], "second module");
		assert.equal(modules[2][0], moduleAddresses[2], "third module");
		assert.equal(modules[3][0], moduleAddresses[3], "fourth module");
		assert.equal(modules[4][0], moduleAddresses[4], "fifth module");
		assert.equal(modules[5][0], moduleAddresses[5], "sixth module");
		assert.equal(modules[6][0], moduleAddresses[6], "seventh module");
		assert.sameMembers(modules[findAddressPositionInModules(addresses[0], modules)][1], getSelectors(dModulesActions));
		assert.sameMembers(modules[findAddressPositionInModules(addresses[1], modules)][1], modulesFuncSelectors);
		assert.sameMembers(modules[findAddressPositionInModules(addresses[2], modules)][1], getSelectors(ownershipModule));
		assert.sameMembers(modules[findAddressPositionInModules(addresses[3], modules)][1], getSelectors(exchangesConfigModule));
		assert.sameMembers(modules[findAddressPositionInModules(addresses[4], modules)][1], getSelectors(networksConfigModule));
		assert.sameMembers(modules[findAddressPositionInModules(addresses[5], modules)][1], getSelectors(Test1Module));
		assert.sameMembers(modules[findAddressPositionInModules(addresses[6], modules)][1], getSelectors(Test2Module));
	});
});
