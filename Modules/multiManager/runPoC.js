// MWS Owner: 0x84099795457A4aAe655762c0070f196cf253e421 and 0x96981ebd57a99bDcaA4c86466058CD72C7459eb2 
// required conf: 2
// MSWaddress: 0xC0c824cF518ED980c3782B8FB2112768A84F9fD0
// 1. TakeOrder Fundmanager address: 0xB9820Ab5aB6256003124cecE3aFE8140F7e55E15
// 2. MakeOrder Fundmanager address: 0xB9820Ab5aB6256003124cecE3aFE8140F7e55E15
// Willie Laubenheimer, blockchain@laubenheimer.eu
// Midas Technologies AG

//dependencies
const Web3 = require('web3')

var Protocol = require('@melonproject/protocol')

var mlnWrapper = '../wrapper/melonWrapper'
var getManager = require(mlnWrapper).getManager
var getHoldings = require(mlnWrapper).getHoldings
var getHoldingsOf = require(mlnWrapper).getHoldingsOf
var setupInvestedFund = require(mlnWrapper).setupInvestedFund
var setupInvestedFund2 = require(mlnWrapper).setupInvestedFund2
var getRoutesOf = require(mlnWrapper).getRoutesOf
var investInFund = require(mlnWrapper).investInFund
var getOrders = require(mlnWrapper).getOrders
var makeOrder = require(mlnWrapper).makeOrder
var takeOrder = require(mlnWrapper).takeOrder
var getBalance = require(mlnWrapper).getBalance
var getRate = require(mlnWrapper).getRate
var redeem = require(mlnWrapper).redeem
var freeze = require(mlnWrapper).freeze

const tokenABI = require('../wrapper/erc20Contract.abi.js')

const multiManagerModule = '../multiManager/MMmodule/multiManagerModule'
var multiSigAddOwner = require(multiManagerModule).multiSigAddOwner
var confirmTx = require(multiManagerModule).confirmTx
var executeTx = require(multiManagerModule).executeTx

var beginSetupMSW = require(multiManagerModule).beginSetupMSW
var completeSetupMSW = require(multiManagerModule).completeSetupMSW

var makeOrderMSW = require(multiManagerModule).makeOrderMSW
var takeOrderMSW = require(multiManagerModule).takeOrderMSW
var cancelOrderMSW = require(multiManagerModule).cancelOrderMSW
var returnAssetToVaultMSW = require(multiManagerModule).returnAssetToVaultMSW
var redeemMSW = require(multiManagerModule).redeemMSW

const {
	PRIVATE_KEYsrc,
	INFURA_KEY,
	mswAddress	
} = require('../.env.js')

//########################
const runPoC = async () => {
	try {
		////############## create enviroment############################
		//var manager = await getManager()
		//var fund = await setupInvestedFund2('MMbase')
		//console.log(fund)
		//now you need to create a msw on https://wallet.gnosis.pm/

		//############## CREATE MSW FUND SETUP ###########################
		//console.log(await beginSetupMSW('multiManager', mswAddress, INFURA_KEY, PRIVATE_KEYsrc))
		//TODO confirm and execute via MSW! NEEDS 3 000 000 GAS !!!!
		//console.log(await completeSetupMSW(mswAddress, INFURA_KEY, PRIVATE_KEYsrc))
		//TODO confirm and execute via MSW! NEEDS 4 100 000 GAS !!!!

		//console.log(await getRoutesOf(mswAddress))
		//console.log(await investInFund(mswAddress))
		//console.log(await getHoldingsOf(mswAddress))

		//############## CREATE MSW MAKEORDER ############################
		//console.log(await makeOrderMSW('BAT', 5, 'SELL', mswAddress, INFURA_KEY, PRIVATE_KEYsrc))
		//console.log(await getOrders())
		//console.log(await getHoldings())
		//console.log(await Protocol.getOasisDexOrder(manager,manager.deployment.thirdPartyContracts.exchanges.matchingMarket , {id: 37497}))
		//console.log(await takeOrder(37515))
		//console.log(await getHoldings())
		//console.log(await getHoldingsOf(mswAddress))

		//console.log(await returnAssetToVaultMSW('0xd0a1e359811322d97991e03f863a0c30c2cf029c', mswAddress, INFURA_KEY, PRIVATE_KEYsrc))
		//console.log(await freeze(15))

		//############## CREATE MSW TAKEORDER ############################
		//console.log(await getHoldings())
	    //const buyAsset = await Protocol.getTokenBySymbol(manager, 'BAT')
    	//console.log(buyAsset)
    	//const rate = await getRate({token: buyAsset})
    	//console.log(rate)
    	//const buyWETHamount = rate * 5
		//console.log(buyWETHamount)
		//console.log(await makeOrder('BAT', buyWETHamount, 5, 'BUY'))
		
		//console.log(await takeOrderMSW(37512, mswAddress, INFURA_KEY, PRIVATE_KEYsrc))
		//console.log(await getHoldingsOf(mswAddress)) 

		//############## CREATE MSW CANCELORDER ##########################
		//console.log(await makeOrderMSW('BAT', 75, 'BUY', mswAddress, INFURA_KEY, PRIVATE_KEYsrc))
		//console.log(await cancelOrderMSW(37514, mswAddress, INFURA_KEY, PRIVATE_KEYsrc))
		//console.log(await executeTx(26, mswAddress, INFURA_KEY, PRIVATE_KEYsrc))
	} catch(e) {
		console.log(e)
	}
}
//########################
runPoC()
	
const test = async () => {
	try {
		var manager = await getManager()
		console.log(await returnAssetToVaultMSW('0xd0a1e359811322d97991e03f863a0c30c2cf029c', mswAddress, INFURA_KEY, PRIVATE_KEYsrc))
		console.log(await makeOrderMSW('BAT', 5, 'SELL', mswAddress, INFURA_KEY, PRIVATE_KEYsrc))
		//console.log(await redeemMSW(mswAddress, INFURA_KEY, PRIVATE_KEYsrc))
		//console.log(await redeem(INFURA_KEY, PRIVATE_KEYsrc))
	} catch(e) {
		console.log(e)
	}
}
//########################
//test()
