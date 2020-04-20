// Willie Laubenheimer, hello@laubenheimer.eu
// Midas Technologies AG

//dependencies
const Web3 = require('web3')
var getTokenByAddress = require('@melonproject/protocol/lib/utils/environment/getTokenByAddress').getTokenByAddress
const tradingABI = require('@melonproject/protocol/out/Trading.abi.json')

const melonWrapper = '../../wrapper/melonWrapper'
var getHoldingsOf = require(melonWrapper).getHoldingsOf
var getHoldings = require(melonWrapper).getHoldings
var getRoutesOf = require(melonWrapper).getRoutesOf
var getManagerWP = require(melonWrapper).getManagerWP
var calculateAUMwithoutWETH = require(melonWrapper).calculateAUMwithoutWETH
var calculateAUMof = require(melonWrapper).calculateAUMof
var getRate = require(melonWrapper).getRate
var makeOrderWP = require(melonWrapper).makeOrderWP

const copyFundsLoggerABI = require('./contracts/copyFundsLogger.abi.js')

var logFund = async (_fundAddress, _amount, _assets, _values, _INFURA_KEY, _PRIVATE_KEY) => {
  try {
    var manager = await getManagerWP(_PRIVATE_KEY);
    const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY;
    var web3 = new Web3(endpoint)
    var contract = new web3.eth.Contract(copyFundsLoggerABI, '0xac004a6655c5fa2289bb8a15e4f02baa3afe5905')
    //prepare Input
    if (_amount < 1)
      _amount = _amount * Math.pow(10,18)
    var fund = {
      manager: _fundAddress,
      amount: _amount,
      assets: _assets,
      values: _values
    }
    //prepare Tx
    web3.eth.accounts.wallet.add(_PRIVATE_KEY)
    var estGas = await contract.methods.copiedFund(fund).estimateGas()
    var send = await contract.methods.copiedFund(fund).send({from: manager.wallet.address, gas: estGas, value: 0})
    //  .on('transactionHash', function(hash){console.log(hash)})
    return send
  } catch (e) {
    console.log('logFund failed: ' + e)
  }
}

var logFund = async (_fundAddress, _amount, _INFURA_KEY, _PRIVATE_KEY) => {
  try {
    var manager = await getManagerWP(_PRIVATE_KEY);
    const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY;
    var web3 = new Web3(endpoint)
    var contract = new web3.eth.Contract(copyFundsLoggerABI, '0xac004a6655c5fa2289bb8a15e4f02baa3afe5905')
    //prepare Input
    var holdings = await getHoldingsOf(_fundAddress)
    var values = []
    var assets = []
    for (var holding in holdings) {
      if (holdings[holding].token.symbol != 'WETH' &&
        holdings[holding].token.symbol != 'MLN') {
        assets.push(holdings[holding].token.address)
      values.push(holdings[holding].quantity)
    }
  }
  if (_amount < 1)
    _amount = _amount * Math.pow(10,18)
  var fund = {
    manager: _fundAddress,
    amount: _amount,
    assets: assets,
    values: values
  }
    //prepare Tx
    web3.eth.accounts.wallet.add(_PRIVATE_KEY)
    var estGas = await contract.methods.copiedFund(fund).estimateGas()
    var send = await contract.methods.copiedFund(fund).send({from: manager.wallet.address, gas: estGas, value: 0})
    return send
  } catch (e) {
    console.log('logFund failed: ' + e)
  }
}

var getLoggedFund = async (_fundAddress, _INFURA_KEY, _PRIVATE_KEY) => {
  try {
    var manager = await getManagerWP(_PRIVATE_KEY)
    const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY;
    var web3 = new Web3(endpoint)
    var contract = new web3.eth.Contract(copyFundsLoggerABI, '0xac004a6655c5fa2289bb8a15e4f02baa3afe5905')
    var call = await contract.methods.getCopiedFund(_fundAddress).call({from: manager.wallet.address})
    if(call[1] == 0)
      return false;
    else
      return call
  } catch (e) {
    console.log('getLoggedFund failed: ' + e.message)
  }
}

var unlogFund = async (_fundAddress, _INFURA_KEY, _PRIVATE_KEY) => {
  try {
    var manager = await getManagerWP(_PRIVATE_KEY);
    const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY;
    var web3 = new Web3(endpoint)
    var contract = new web3.eth.Contract(copyFundsLoggerABI, '0xac004a6655c5fa2289bb8a15e4f02baa3afe5905')
    //prepare Input
    var prepare = await getLoggedFund(_fundAddress)
    var fund = {
      manager: prepare[0],
      amount: prepare[1],
      assets: prepare[2],
      values: prepare[3]
    }
    //prepare Tx
    web3.eth.accounts.wallet.add(_PRIVATE_KEY)
    var estGas = 3 * await contract.methods.soldFund(fund).estimateGas()
    var send = await contract.methods.soldFund(fund).send({from: manager.wallet.address, gas: estGas, value: 0})
    return send
  } catch (e) {
    console.log('unlogFund failed: ' + e.message)
  }
}

var copyFund = async (_fundAddress, _investAmount, _INFURA_KEY, _PRIVATE_KEY) => {
  try {
    var holdingsOf = await getHoldingsOf(_fundAddress)
    var holdings = await getHoldings()

    //Check if there is enough WETH
    for (var holding in holdings) {
      if (holdings[holding].token.symbol == 'WETH') {
        if ((holdings[holding].quantity / Math.pow(10,18)) < _investAmount) {
          console.log('You do not have enough WETH. your missing: ' + String(_investAmount - (holdings[holding].quantity / Math.pow(10,18))))
          return false;
        }
      }
    }

    //makeOrderWPs to copy the given fund and the calculations needed before.
    const aum = await calculateAUMwithoutWETH(holdingsOf)    
    var assets = []
    var values = []
    for (var holding in holdingsOf) {
      //(WETH and) MLN arent tradeable on oasisdex for now
      if (holdings[holding].token.symbol != 'WETH' &&
        holdings[holding].token.symbol != 'MLN') {
        //get Numbers
        var aumOf = await calculateAUMof(holdings[holding]);
        var rate = await getRate(holdings[holding]);

        //do calculations
        var valueWETH = (aumOf / aum) * _investAmount;
        var valueToken = valueWETH / rate ;

        //Check if the _investAmount of the given tradingPair is big enough to suceed.
        if (valueWETH > Math.pow(10,-15)) {
          console.log(await makeOrderWP(
            _PRIVATE_KEY,
            holdings[holding].token.symbol,
            valueWETH,
            valueToken,
            'BUY')
          )
          assets.push(holdings[holding].token.address)
          values.push(holdings[holding].quantity / Math.pow(1, holdings[holding].token.decimals))
          //TimeCatcher till order executed and freezeTime over. TODO
        }
      }
    }
    //log in smartContract
    await logFund(_fundAddress, _investAmount, assets, values, _INFURA_KEY, _PRIVATE_KEY)
    return {
      action: 'BUY',
      actionFund: await getManagerWP(_PRIVATE_KEY).address,
      sourceFund: _fundAddress,
      assets: assets,
      values: values
    }  }
  catch (e) {
    console.log('Error during copyFunds:' + e)
  }
}

var sellCopiedFund = async (_fundAddress, _INFURA_KEY, _PRIVATE_KEY) => {
  var manager = await getManagerWP(_PRIVATE_KEY)
  var prepare = await getLoggedFund(_fundAddress, _INFURA_KEY)
    var fund = {
      manager: prepare[0],
      amount: prepare[1],
      assets: prepare[2],
      values: prepare[3]
    }
    for (var asset in fund.assets) {
      var holding = {token: await getTokenByAddress(manager, fund.assets[asset])}
      var rate = await getRate(holding)
      var valueWETH = rate * (fund.values[asset] / Math.pow(10,18))
      var valueToken = (fund.values[asset] / Math.pow(10,18))
      console.log(await makeOrderWP(
        _PRIVATE_KEY,
            holding.token.symbol,
            valueWETH,
            valueToken,
            'SELL')
      )
      //TimeCatcher till order executed and freezeTime over. TODO
    }
    //unlog in smartContract
    await unlogFund(_fundAddress, _INFURA_KEY, _PRIVATE_KEY)
    return {
      action: 'SELL',
      actionFund: manager.address,
      sourceFund: _fundAddress,
      assets: fund.assets,
      values: fund.values
    }
}

var returnAssetToVault = async (_assetAddress, _INFURA_KEY, _PRIVATE_KEY) => {
  try {
    var manager = await getManagerWP(_PRIVATE_KEY)
    const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY
    var web3 = new Web3(endpoint)

    var routes = await getRoutesOf(manager.wallet.address)
    var tradingContract = new web3.eth.Contract(tradingABI, routes.trading)
    const inputData = await tradingContract.methods.returnAssetToVault(_assetAddress.toString()).encodeABI()
    
    const tx = {
      from: manager.wallet.address, 
      to: routes.trading,
      gas: 1000000,
      value: 0,
      data: inputData
    }
    //sign and send TX
    const signPromise = await web3.eth.accounts.signTransaction(tx, _PRIVATE_KEY)
    const signed = signPromise.rawTransaction
    const sentTx = await web3.eth.sendSignedTransaction(signed)
    return sentTx
  }
  catch (e) {
    console.log('returnAssetToVault failed: ' + e)
  }
}

/*
TODO: Needs to be called by callFactory? (wrong: via Trading.callonExchange)....

var removeOpenMake = async (_exchangeAddress, _assetAddress, _INFURA_KEY, _PRIVATE_KEY) => {
  try {
    var manager = await getManagerWP(_PRIVATE_KEY)
    const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY
    var web3 = new Web3(endpoint)

    var routes = await getRoutesOf(manager.wallet.address)
    var tradingContract = new web3.eth.Contract(tradingABI, routes.trading)
    
    const inputData = await tradingContract.methods.removeOpenMakeOrder(
      _exchangeAddress.toString(),
      _assetAddress.toString()
    ).encodeABI()
    
    const tx = {
      from: manager.wallet.address, 
      to: routes.trading,
      gas: 1000000,
      value: 0,
      data: inputData
    }
    //sign and send TX
    const signPromise = await web3.eth.accounts.signTransaction(tx, _PRIVATE_KEY)
    const signed = signPromise.rawTransaction
    const sentTx = await web3.eth.sendSignedTransaction(signed)
    return sentTx
  }
  catch (e) {
    console.log('removeOpenMake failed: ' + e)
  }
}*/


module.exports = {
  logFund,
  getLoggedFund,
  unlogFund,
  copyFund,
  sellCopiedFund,
  returnAssetToVault,
  //removeOpenMake
}
