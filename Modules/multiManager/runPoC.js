// 1. TakeOrder Fundmanager address: 0x88d855bdf87b93b956154714109d9a5a22a6ad9b
// 2. MakeOrder Fundmanager address: 0xa16067833E3466Fa9f9a617C1Df24a5b6a0b25DE
// MWS Owner: 0x699E1818e9e83Fa31549911695D965F2fca8c461 and 0xa07AF3302B17F42F63a8111b33E390D80f3E67c8 
// required conf: 2
// MSWaddress: 0xd0b4ad9EaD5918ed4CDe1D175ccD04F2eFd37ddD
// Willie Laubenheimer, hello@laubenheimer.eu
// Midas Technologies AG

//dependencies
const dotenv = require('dotenv')
dotenv.config()
const Web3 = require('web3')

var Protocol = require('@melonproject/protocol')
const { appendDecimals } = require('@melonproject/token-math')

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

//########################
const runPoC = async () => {
	try {
		var manager = await getManager()
		const MSWaddress = '0xd0b4ad9EaD5918ed4CDe1D175ccD04F2eFd37ddD'
		const MSWaddress2 = '0x481Cd58e3067c1A4b9314972a7C2d3e06120359D'
		//console.log(await getHoldingsOf(MSWaddress))

		//############## CREATE MSW FUND SETUP ###########################
		//console.log(await beginSetupMSW('FirstMultiSigFund', MSWaddress))
		//TODO confirm and execute via MSW! NEEDS 3 000 000 GAS !!!!
		//console.log(await completeSetupMSW(MSWaddress))
		//TODO confirm and execute via MSW! NEEDS 4 100 000 GAS !!!!
		//console.log(await getRoutesOf(MSWaddress))
		//console.log(await investInFund(MSWaddress))
		//console.log(await getHoldingsOf(MSWaddress))

		//############## CREATE MSW MAKEORDER ############################
		//console.log(await makeOrderMSW('BAT', 5 * Math.pow(10, 18), MSWaddress))
		//console.log(await getOrders())
		//console.log(await getHoldings())
		//console.log(await Protocol.getOasisDexOrder(manager,manager.deployment.thirdPartyContracts.exchanges.matchingMarket , {id: 37497}))
		//console.log(await takeOrder(37497))
		//console.log(await getHoldings())
		//console.log(await getHoldingsOf(MSWaddress))

		//############## CREATE MSW TAKEORDER ############################
		//console.log(await getHoldings()) 
	    const buyAsset = await Protocol.getTokenBySymbol(manager, 'BAT')
    	//console.log(buyAsset)
    	const rate = await getRate({token: buyAsset})
    	//console.log(rate)
    	const buyWETHamount = rate * 2.5
		//console.log(buyWETHamount)
		//console.log(await makeOrder('BAT', buyWETHamount, 7.5, 'SELL'))
		
		//console.log(await takeOrderMSW(37503, MSWaddress))
		//console.log(await getHoldingsOf(MSWaddress)) 

		//############## CREATE MSW CANCELORDER ##########################
		//console.log(await makeOrderMSW('BAT', 7.5 * Math.pow(10, 18), MSWaddress))
		//console.log(await cancelOrderMSW(37502, MSWaddress))
		//console.log(await executeTx(26, MSWaddress))
	} catch(e) {
		console.log(e)
	}
}
//########################
runPoC()

/*
first MSW with fund 0xd0b4ad9EaD5918ed4CDe1D175ccD04F2eFd37ddD
*/		
