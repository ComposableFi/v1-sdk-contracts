/* global describe it before ethers */

import {
	getSelectors,
	DModulesAction,
	removeSelectors,
	findAddressPositionInModules,
} from "../../scripts/deployment/config/libraries/proxyModules.js";

import { deployDProxyModules } from "../../scripts/deployment/config/deployConfig.js";

import { assert, expect } from "chai";
const BN = ethers.BigNumber;
//import { Bignumber } from "ethers";

describe("DModulesProxyTest", async function () {
	let dModulesProxyAddress;
	let dModulesActions;
	let dProxyModulesFuncSelectors;
	let ownershipModule;
	let exchangesConfigModule, networksConfigModule;
	let tx;
	let receipt;
	let result;
	let accounts;
	const addresses = [];

	before(async function () {
		accounts = await ethers.getSigners();
		dModulesProxyAddress = await deployDProxyModules();
		dModulesActions = await ethers.getContractAt("DModulesActions", dModulesProxyAddress);
		dProxyModulesFuncSelectors = await ethers.getContractAt("DProxyModulesFuncSelectors", dModulesProxyAddress);
		ownershipModule = await ethers.getContractAt("OwnershipModule", dModulesProxyAddress);
		//networksConfigModule = await ethers.getContractAt("INetworksConfigModule", dModulesProxyAddress);
		networksConfigModule = await ethers.getContractAt(
			"contracts/utils/protocol_config/interfaces/INetworksConfigModule.sol:INetworksConfigModule",
			dModulesProxyAddress
		);
		//exchangesConfigModule = await ethers.getContractAt("ExchangesConfigModule", dModulesProxyAddress);
		exchangesConfigModule = await ethers.getContractAt(
			"contracts/utils/protocol_config/interfaces/IExchangesConfigModule.sol:IExchangesConfigModule",
			dModulesProxyAddress
		);

		for (const address of await dProxyModulesFuncSelectors.getAllModulesAddresses()) {
			//console.log("adding module address: ", address);
			addresses.push(address);
		}
	});

	describe("Testing ExchangesConfigModule...", async function () {
		let chainlinkAdapter;
		let mumbaiNetworkId, hhNetworkId;
		let exchangeId, ammId;
		//TODO: replace chainlink with Uniswap2
		before(async function () {
			const ChainlinkAdapter = await ethers.getContractFactory("ChainlinkAdapter");
			chainlinkAdapter = await ChainlinkAdapter.deploy();
			await chainlinkAdapter.deployed();
			hhNetworkId = 31337;
			mumbaiNetworkId = 80001;
			ammId = ethers.utils.formatBytes32String("chainlink");
		});
		it("should set and get exchange adapter address", async () => {
			await exchangesConfigModule.setExchangeAdapterAddress(mumbaiNetworkId, ammId, chainlinkAdapter.address);
			expect(await exchangesConfigModule.getNetworkExchangeAdapterAddress(mumbaiNetworkId, ammId)).to.be.equal(
				chainlinkAdapter.address
			);
		});
		it("should revert when trying to set EOA address as an exchange adapter", async () => {
			await expect(exchangesConfigModule.setExchangeAdapterAddress(hhNetworkId, ammId, accounts[1].address)).to.be.revertedWith(
				"Exchanges::setExchangeAdapterAddress: Exchange adapter address has no code"
			);
		});

		it("should get network exchanges list", async () => {
			const ChainlinkAdapter = await ethers.getContractFactory("ChainlinkAdapter");
			const chainlinkAdapter1 = await ChainlinkAdapter.deploy();
			await chainlinkAdapter1.deployed();
			const ammId1 = ethers.utils.formatBytes32String("chainlink1");
			await exchangesConfigModule.setExchangeAdapterAddress(mumbaiNetworkId, ammId1, chainlinkAdapter1.address);
			let exchanges = (await exchangesConfigModule.getNetworkExchanges(mumbaiNetworkId)).map(ethers.utils.parseBytes32String);
			expect(exchanges).to.have.members(["chainlink", "chainlink1"]);
		});

		it("should replace exchange adapter", async () => {
			const ChainlinkAdapter = await ethers.getContractFactory("ChainlinkAdapter");
			const chainlinkAdapter1 = await ChainlinkAdapter.deploy();
			await chainlinkAdapter1.deployed();
			await exchangesConfigModule.setExchangeAdapterAddress(mumbaiNetworkId, ammId, chainlinkAdapter1.address);
			expect(await exchangesConfigModule.getNetworkExchangeAdapterAddress(mumbaiNetworkId, ammId)).to.be.equal(
				chainlinkAdapter1.address
			);
		});

		it("should remove network exchanges adapter", async () => {
			await exchangesConfigModule.removeNetworkExchangeAdapter(mumbaiNetworkId, ammId);
			expect(await exchangesConfigModule.getNetworkExchangeAdapterAddress(mumbaiNetworkId, ammId)).to.be.equal(
				ethers.constants.AddressZero
			);
		});
	});

	describe("Testing NetworksConfigModule...", async function () {
		async function compareConfigs(cfg1, cfg2) {
			expect(cfg1.networkId.toString(), "cfg1.networkId").to.eql(cfg2.networkId.toString());

			expect(cfg1.timeout.toString(), "cfg1.timeout").eql(cfg2.timeout.toString());
			expect(cfg1.gasPrice.toString(), "cfg1.gasPrice").eql(cfg2.gasPrice.toString());
			expect(cfg1.gas.toString(), "cfg1.gas").eql(cfg2.gas.toString());
			expect(cfg1.networkName.toString(), "cfg1.networkName").eql(cfg2.networkName.toString());
			expect(cfg1.vaultAddress.toString(), "cfg1.vaultAddress").eql(cfg2.vaultAddress.toString());
			//expect(cfg1.url, "cfg1.url").eql(cfg2.url);
			/*expect(
				[cfg1.networkId, cfg1.timeout, cfg1.gasPrice, cfg1.gas, cfg1.networkName, cfg1.vaultAddress, cfg1.networkName, cfg1.url],
				"Objects aren't equal"
			).to.eql([
				cfg2.networkId,
				cfg2.timeout,
				cfg2.gasPrice,
				cfg2.gas,
				cfg2.networkName,
				cfg2.vaultAddress,
				cfg2.networkName,
				cfg2.url,
			]);*/
		}
		let ropstenConfig, maticMumbaiConfig;
		before(async function () {
			ropstenConfig = {
				networkId: BN.from(421611), //ropsten
				timeout: BN.from(120000),
				gasPrice: BN.from(20000000),
				gas: BN.from(10000000),
				networkName: ethers.utils.formatBytes32String("rinkeby"),
				vaultAddress: "0xC80f04563Cd7ddFdF95a3706ba02808D3274C9F1", // the network vault proxy address
				url: "https://rinkeby.arbitrum.io/rpc",
			};
			maticMumbaiConfig = {
				networkName: ethers.utils.formatBytes32String("maticMumbaiConfig"),
				timeout: BN.from(0),
				networkId: BN.from(80001),
				url: "https://matic-mumbai.chainstacklabs.com",
				gasPrice: BN.from(1000000000),
				gas: BN.from(10000000),
				vaultAddress: "0x5c6678513702Ccf311Ef9F3834884D46B70BEa62",
			};
			//await networksConfigModule.addNetworkConfig(maticMumbaiConfig);
		});
		it("addNetworkConfig(NetworkConfig memory _configToAdd)", async () => {
			await networksConfigModule.addNetworkConfig(maticMumbaiConfig);
			const cfg = await networksConfigModule.getNetworkConfigById(80001);
			await compareConfigs(cfg, maticMumbaiConfig);
		});
		it("Fails when trying to duplicate the same network via add method", async () => {
			expect(networksConfigModule.addNetworkConfig(maticMumbaiConfig)).revertedWith(
				"Use updateNetworkConfig to modify existing network"
			);
		});
		it("removeNetworkConfig(uint256 _ntwId)", async () => {
			await networksConfigModule.removeNetworkConfig(maticMumbaiConfig.networkId);
			expect(
				await networksConfigModule.getNetworkConfigByName(ethers.utils.formatBytes32String("maticMumbaiConfig")).networkId
			).to.be.eql(undefined);
		});
		it("updateNetworkConfig(NetworkConfig memory _configToAdd)", async () => {
			await networksConfigModule.addNetworkConfig(ropstenConfig);
			expect(ropstenConfig.vaultAddress !== ethers.constants.AddressZero).to.be.true;
			const genVaultAddress = ropstenConfig.vaultAddress;
			ropstenConfig.vaultAddress = ethers.constants.AddressZero;
			expect((await networksConfigModule.getNetworkConfigById(ropstenConfig.networkId).vaultAddress) == ethers.constants.AddressZero);
			ropstenConfig.vaultAddress = genVaultAddress;
			await networksConfigModule.removeNetworkConfig(ropstenConfig.networkId);
		});
		it("updateNetworkConfig and updateNetworkConfig fails when trying to set not unique config name", async () => {
			await networksConfigModule.addNetworkConfig(maticMumbaiConfig);
			const genRopstenName = ropstenConfig.networkName;
			ropstenConfig.networkName = maticMumbaiConfig.networkName;
			await expect(networksConfigModule.addNetworkConfig(ropstenConfig)).to.be.revertedWith(
				"Network name is used for another network"
			);
			ropstenConfig.networkName = genRopstenName;
			await networksConfigModule.addNetworkConfig(ropstenConfig);
			ropstenConfig.networkName = maticMumbaiConfig.networkName;
			await expect(networksConfigModule.updateNetworkConfig(ropstenConfig)).to.be.revertedWith(
				"Network name is used for another network"
			);
			ropstenConfig.networkName = genRopstenName;
			await networksConfigModule.removeNetworkConfig(ropstenConfig.networkId);
			await networksConfigModule.removeNetworkConfig(maticMumbaiConfig.networkId);
		});
		it("getNetworkIds()", async () => {
			await networksConfigModule.addNetworkConfig(maticMumbaiConfig);
			await networksConfigModule.addNetworkConfig(ropstenConfig);
			expect((await networksConfigModule.getNetworkIds()).map(toString)).to.eql(
				[ropstenConfig.networkId, maticMumbaiConfig.networkId].map(toString)
			);
		});
		it("removes networkNameToId[networkName] of the name being replaced", async () => {
			await networksConfigModule.removeNetworkConfig(maticMumbaiConfig.networkId);
			await networksConfigModule.addNetworkConfig(maticMumbaiConfig);
			const genMaticMumbaiConfigName = maticMumbaiConfig.networkName;
			maticMumbaiConfig.networkName = ethers.utils.formatBytes32String("changedName");
			await networksConfigModule.updateNetworkConfig(maticMumbaiConfig);
			expect(await networksConfigModule.getNetworkConfigByName(maticMumbaiConfig.networkName).networkId).to.be.eql(undefined);
			/*
			TODO: add this method to the module functions list
			expect(await networksConfigModule.networkNameToId(maticMumbaiConfig.networkName)).to.be.eql(undefined);
			maticMumbaiConfig.networkName = genMaticMumbaiConfigName;
			*/
		});
		it("getVaultAddressByNetworkId(uint256 _networkId)", async () => {
			expect(await networksConfigModule.getVaultAddressByNetworkId(maticMumbaiConfig.networkId)).to.eql(
				maticMumbaiConfig.vaultAddress
			);
		});
		it("getVaultAddressByNetworkName(bytes32 _name)", async () => {
			expect(await networksConfigModule.getVaultAddressByNetworkName(maticMumbaiConfig.networkName)).to.eql(
				maticMumbaiConfig.vaultAddress
			);
		});
	});
});
