var mlnWrapper = '../../src/wrapper/melonWrapper'
var getRate = require(mlnWrapper).getRate
var getManagerWP = require(mlnWrapper).getManagerWP
var getHoldingsWP = require(mlnWrapper).getHoldingsWP
var makeOrderWP = require(mlnWrapper).makeOrderWP
var takeOrderWP = require(mlnWrapper).takeOrderWP

var CFmodule = '../../src/copyFunds/copyFundsModule'
var getLoggedFund = require(mlnWrapper).getLoggedFund
var logFund = require(mlnWrapper).logFund
var unlogFund = require(mlnWrapper).unlogFund

//environment needed!
const {
    INFURA_KEY,
    PRIVATE_KEYsrc,
    PRIVATE_KEYdest
} = require('../../.env.js')

//########################
var copyFundPoC = async (_INFURA_KEY, _PRIVATE_KEYsrc, _PRIVATE_KEYdest) => {
    try {
        var holdingsOf = await getHoldingsWP(_PRIVATE_KEYdest)
        var assets = []
        var values = []
        var investAmount = 0
        for (var holding in holdingsOf) {
            var order
            //(WETH and) MLN arent tradeable on oasisdex for now
            if (holdingsOf[holding].token.symbol == 'ZRX' ||
                holdingsOf[holding].token.symbol == 'BAT') {
                var valueToken = 10
            var valueWETH = valueToken * await getRate(holdingsOf[holding])
            console.log(valueWETH)
                //PoC makeOrder by srcFund
                order = await makeOrderWP(
                    _PRIVATE_KEYsrc,
                    holdingsOf[holding].token.symbol,
                    valueWETH,
                    valueToken,
                    'BUY')
                console.log(order)
                assets.push(holdingsOf[holding].token.address)
                values.push(holdingsOf[holding].quantity / Math.pow(1, holdingsOf[holding].token.decimals))
                investAmount += valueWETH
                //PoC takeOrder by destFund
                console.log(await takeOrderWP(
                    _PRIVATE_KEYdest,
                    order.id)
                )
            }
        }
        //log in smartContract
        var fundAddress = await getManagerWP(_PRIVATE_KEYdest).wallet.address
        var log = await logFund(fundAddress, investAmount, assets, values, _INFURA_KEY, _PRIVATE_KEYsrc)
        return investAmount
    } catch(e) {
        try {
            console.log(e)
            //log in smartContract
            var fundAddress = await getManagerWP(_PRIVATE_KEYdest).wallet.address
            var log = await logFund(fundAddress, investAmount, assets, values, _INFURA_KEY, _PRIVATE_KEYsrc)
        } catch(e2) {
            console.log(e2)
        }
        console.log(e)
    }
}

var sellCopiedFundPoC = async (_fundAddress, _INFURA_KEY, _PRIVATE_KEYsrc, _PRIVATE_KEYdest) => {
    try {
        var manager = await getManagerWP(_PRIVATE_KEYsrc)
        var prepare = await getLoggedFund(_fundAddress, _INFURA_KEY)
        var investmentIncome = 0
        var fund = {
          manager: prepare[0],
          amount: prepare[1],
          assets: prepare[2],
          values: prepare[3]
          }
          for (var asset in fund.assets) {
            //var tokenContract = eth.contract(tokenABI).at(tokenAddress);
            var holding = {token: await getTokenByAddress(manager, fund.assets[asset])}
            var rate = await getRate(holding)
            var valueWETH = rate * (fund.values[asset] / Math.pow(10,18))
            var valueToken = (fund.values[asset] / Math.pow(10,18))
            var order = await makeOrderWP(
                _PRIVATE_KEYsrc,
                holding.token.symbol,
                valueWETH,
                valueToken,
                'SELL'
                )
            console.log(order)
            investmentIncome += valueWETH
            console.log(await takeOrderWP(
                _PRIVATE_KEYdest,
                order.id)
            )
        }
        //unlog in smartContract
        var log = await unlogFund(_fundAddress,_INFURA_KEY, _PRIVATE_KEYsrc)
        return investmentIncome
    } catch(e) {
        console.log(e)
    }
}
//########################
const test = async () => {
    console.log('#####################ENVIRONMENT SETTINGS#########################')
    var srcManager = await getManagerWP(PRIVATE_KEYsrc)
    console.log('Loaded srcManager: ' + srcManager.wallet.address)
    console.log(' Fund Holdings of srcManager: ')
    console.log(await getHoldingsWP(PRIVATE_KEYsrc))
    var destManager = await getManagerWP(PRIVATE_KEYdest)
    console.log('Loaded destManager: ' + destManager.wallet.address)
    console.log(' Fund Holdings of destManager: ')
    console.log(await getHoldingsWP(PRIVATE_KEYdest))
    console.log('########################COPY FUND##################################')
    //console.log(await copyFundPoC(INFURA_KEY, PRIVATE_KEYsrc, PRIVATE_KEYdest))
    console.log('######################GET LOGGED FUND##############################')
    //console.log(await getLoggedFund(destManager.wallet.address, INFURA_KEY))
    console.log('######################SELL COPIED FUND##############################')
    //console.log(await sellCopiedFundPoC('0x88D855BdF87b93B956154714109d9a5A22A6AD9B'))
    console.log('######################GET LOGGED FUND##############################')
    //console.log(await getLoggedFund('0x88D855BdF87b93B956154714109d9a5A22A6AD9B', INFURA_KEY))
}
test()
