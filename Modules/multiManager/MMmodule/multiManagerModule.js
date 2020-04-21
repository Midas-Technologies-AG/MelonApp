// Willie Laubenheimer, blockchain@laubenheimer.eu
// Midas Technologies AG

//dependencies
const Web3 = require('web3')
var Protocol = require('@melonproject/protocol')
const { createQuantity, appendDecimals, toBI } = require('@melonproject/token-math')
const stringToBytes32 = require("@melonproject/protocol/lib/utils/helpers/stringToBytes32").stringToBytes32
const fundFactory = require('@melonproject/protocol/out/FundFactory.abi.json')
const tradingABI = require('@melonproject/protocol/out/Trading.abi.json')
const participationABI = require('@melonproject/protocol/out/Participation.abi.json')

var getManagerWP = require('../../wrapper/melonWrapper').getManagerWP
var getRate = require('../../wrapper/melonWrapper').getRate
var getRoutesOf = require('../../wrapper/melonWrapper').getRoutesOf
const tokenABI = require('../../wrapper/erc20Contract.abi.js')

const multiSig = require('./contracts/multiSig.abi.js')

// environmental variables are:
// _multiSigWalletAddress
// _INFURA_KEY
// _PRIVATE_KEY

const addOwnerMSW = async (_newOwner, _multiSigWalletAddress, _INFURA_KEY, _PRIVATE_KEY) => {
  //creating environment
  var manager = await getManagerWP(_PRIVATE_KEY)
  const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY
  var web3 = new Web3(endpoint)
  var contract = new web3.eth.Contract(multiSig, _multiSigWalletAddress)
  // create function abi
  var inputData = await contract.methods.addOwner(_newOwner).encodeABI()
  // create multisig proposal
  const tx = {
    from: manager.wallet.address, 
    to: _multiSigWalletAddress, 
    gas: 2000000, 
    value: 0,
    data: contract.methods.submitTransaction(_multiSigWalletAddress, 0, inputData).encodeABI() 
  }

  const signPromise = await web3.eth.accounts.signTransaction(tx, _PRIVATE_KEY)
  const signed = signPromise.rawTransaction
  
  const sentTx = await web3.eth.sendSignedTransaction(signed)
  return sentTx
}

const confirmMSW = async (_id, _multiSigWalletAddress, _INFURA_KEY, _PRIVATE_KEY) => {
  var manager = await getManagerWP(_PRIVATE_KEY)
  const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY
  var web3 = new Web3(endpoint)
  var contract = new web3.eth.Contract(multiSig, _multiSigWalletAddress)
  const tx = {
    from: manager.wallet.address, 
    to: _multiSigWalletAddress, 
    gas: 4200000, 
    value: 0,
    data: contract.methods.confirmTransaction(_id).encodeABI() 
  }
  const signPromise = await web3.eth.accounts.signTransaction(tx, _PRIVATE_KEY)
  const signed = signPromise.rawTransaction
  const sentTx = await web3.eth.sendSignedTransaction(signed)
  return sentTx
}

const executeMSW = async (_id, _multiSigWalletAddress, _INFURA_KEY, _PRIVATE_KEY) => {
  var manager = await getManagerWP(_PRIVATE_KEY)
  const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY
  var web3 = new Web3(endpoint)
  var contract = new web3.eth.Contract(multiSig, _multiSigWalletAddress)
  const tx = {
    from: manager.wallet.address, 
    to: _multiSigWalletAddress, 
    gas: 4200000, 
    value: 0,
    data: contract.methods.executeTransaction(_id).encodeABI() 
  }
  const signPromise = await web3.eth.accounts.signTransaction(tx, _PRIVATE_KEY)
  const signed = signPromise.rawTransaction
  const sentTx = await web3.eth.sendSignedTransaction(signed)
  return sentTx
}

var beginSetupMSW = async (_name, _multiSigWalletAddress, _INFURA_KEY, _PRIVATE_KEY) => {
  try {
    const fundName = _name
    var manager = await getManagerWP(_PRIVATE_KEY)
    const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY
    var web3 = new Web3(endpoint)

    var mSigContract = new web3.eth.Contract(multiSig, _multiSigWalletAddress)
    var factoryContract = new web3.eth.Contract(fundFactory, manager.deployment.melonContracts.version)

    const DAY_IN_SECONDS = 60 * 60 * 24

    // create input data
    const { exchangeConfigs, melonContracts } = manager.deployment
    const weth = Protocol.getTokenBySymbol(manager, 'WETH')
    const mln = Protocol.getTokenBySymbol(manager, 'MLN')
    const fees = [
    {
      feeAddress: melonContracts.fees.managementFee.toLowerCase(),
      feePeriod: toBI(DAY_IN_SECONDS * 45),
      feeRate: appendDecimals(weth, 0.05),
    },
    {
      feeAddress: melonContracts.fees.performanceFee.toLowerCase(),
      feePeriod: toBI(DAY_IN_SECONDS * 90),
      feeRate: appendDecimals(weth, 0.2),
    },
    ]

    const fundInput = {
      defaultTokens: [weth, mln],
      exchangeConfigs,
      fees,
      fundName,
      manager: manager.wallet.address,
      quoteToken: weth,
    }

    const values = Object.values(fundInput.exchangeConfigs)
    const exchangeAddresses = values.map(e => e.exchange.toString())
    const adapterAddresses = values.map(e => e.adapter.toString())
    const takesCustody = values.map(e => e.takesCustody)

    const defaultTokenAddresses = fundInput.defaultTokens.map(t => t.address)
    const quoteTokenAddress = fundInput.quoteToken.address
    const feeAddresses = fundInput.fees.map(f => f.feeAddress)
    // TODO: Hacky fix. Could be some problem with BN.js
    const feeRates = fundInput.fees.map(f => `${f.feeRate}`)
    const feePeriods = fundInput.fees.map(f => `${f.feePeriod}`)

    //#####################first beginSetup()#################################
    var inputData = []
    // create function abi
    inputData[0] = await factoryContract.methods.beginSetup(
      stringToBytes32(fundName),
      feeAddresses,
      feeRates,
      feePeriods,
      exchangeAddresses,
      adapterAddresses,
      quoteTokenAddress,
      defaultTokenAddresses,
      takesCustody
      ).encodeABI()

    const tx = {
      from: manager.wallet.address, 
      to: _multiSigWalletAddress,
      gas: 8000000, 
      value: 0,
      data: await mSigContract.methods.submitTransaction(manager.deployment.melonContracts.version, 0, inputData[0]).encodeABI()
    }

    //sign and send TX
    const signPromise = await web3.eth.accounts.signTransaction(tx, _PRIVATE_KEY)
    const signed = signPromise.rawTransaction
    const sentTx = await web3.eth.sendSignedTransaction(signed)
    return true
  }
  catch (e) {
    console.log('beginSetupMSW failed: ' + e)
  }
}

var completeSetupMSW = async (_multiSigWalletAddress, _INFURA_KEY, _PRIVATE_KEY) => {
  try {
    var manager = await getManagerWP(_PRIVATE_KEY)
    const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY
    var web3 = new Web3(endpoint)

    var mSigContract = new web3.eth.Contract(multiSig, _multiSigWalletAddress)
    var factoryContract = new web3.eth.Contract(fundFactory, manager.deployment.melonContracts.version)

    //send funds for the submiting transactions
    const val = 0.00015 * Math.pow(10, 18)
    const tx = {
      from: manager.wallet.address, 
      to: _multiSigWalletAddress,
      gas: 8000000, 
      value: val * 8,
      data: 0x0
    }
    const signPromise = await web3.eth.accounts.signTransaction(tx, _PRIVATE_KEY)
    const signed = signPromise.rawTransaction
    const sentTx = await web3.eth.sendSignedTransaction(signed)
    //generate abi data
    var inputData = []
    inputData[1] = await factoryContract.methods.createAccounting().encodeABI()
    inputData[2] = await factoryContract.methods.createFeeManager().encodeABI()
    inputData[3] = await factoryContract.methods.createParticipation().encodeABI()
    inputData[4] = await factoryContract.methods.createPolicyManager().encodeABI()
    inputData[5] = await factoryContract.methods.createShares().encodeABI()
    inputData[6] = await factoryContract.methods.createTrading().encodeABI()
    inputData[7] = await factoryContract.methods.createVault().encodeABI()
    inputData[8] = await factoryContract.methods.completeSetup().encodeABI()
    for (var i = 1; i <= 8; i++) {
      // create submitting tx for MSW
      const tx = {
        from: manager.wallet.address, 
        to: _multiSigWalletAddress,
        gas: 8000000, 
        value: 0,
        data: await mSigContract.methods.submitTransaction(manager.deployment.melonContracts.version, val, inputData[i]).encodeABI()
      }
      //sign and send TX
      const signPromise = await web3.eth.accounts.signTransaction(tx, _PRIVATE_KEY)
      const signed = signPromise.rawTransaction
      const sentTx = await web3.eth.sendSignedTransaction(signed)
    }
    return true
  }
  catch (e) {
    console.log('completeSetupMSW failed: ' + e)
  }
}

var getExchangeIndex = require('@melonproject/protocol/lib/contracts/fund/trading/calls/getExchangeIndex').getExchangeIndex
var { Exchanges, Contracts } = require('@melonproject/protocol/lib/Contracts')
var { FunctionSignatures } = require('@melonproject/protocol/lib/contracts/fund/trading/utils/FunctionSignatures')
var { emptyAddress } = require('@melonproject/protocol/lib/utils/constants/emptyAddress')

var makeOrderMSW = async (_assetSymbol, _amount, _action,  _multiSigWalletAddress, _INFURA_KEY, _PRIVATE_KEY) => {
  try {
    var manager = await getManagerWP(_PRIVATE_KEY)
    const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY
    var web3 = new Web3(endpoint)

    var routes = await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, _multiSigWalletAddress)
    var mSigContract = new web3.eth.Contract(multiSig, _multiSigWalletAddress)
    var tradingContract = new web3.eth.Contract(tradingABI, routes.trading)

    const exchangeIndex = await getExchangeIndex(manager, routes.trading, { exchange: Exchanges.MatchingMarket })
    const weth = Protocol.getTokenBySymbol(manager, 'WETH')
    const taker = await Protocol.getTokenBySymbol(manager, _assetSymbol)
    const rate = await getRate({token: taker})
    const makerAmount = appendDecimals(weth, rate * _amount)
    const takerAmount = appendDecimals(taker, _amount)

    var makerQuantity = (_action == 'BUY') ? createQuantity(weth, makerAmount) : createQuantity(taker, takerAmount);
    var takerQuantity = (_action == 'BUY') ? createQuantity(taker, takerAmount) : createQuantity(weth, makerAmount);

    var inputData = await tradingContract.methods.callOnExchange(
      exchangeIndex,
      FunctionSignatures.makeOrder,
      [
      routes.trading.toString(),
      emptyAddress,
      makerQuantity.token.address.toString(),
      takerQuantity.token.address.toString(),
      emptyAddress,
      emptyAddress,
      ],
      [
      makerQuantity.quantity.toString(),
      takerQuantity.quantity.toString(),
      '0',
      '0',
      '0',
      '0',
      '0',
      '0',
      ],
      '0x0',
      '0x0',
      '0x0',
      '0x0'
      ).encodeABI()

      // create submitting tx for MSW
      const tx = {
        from: manager.wallet.address, 
        to: _multiSigWalletAddress,
        gas: 8000000, 
        value: 0,
        data: await mSigContract.methods.submitTransaction(routes.trading, 0, inputData).encodeABI()
      }
      //sign and send TX
      const signPromise = await web3.eth.accounts.signTransaction(tx, _PRIVATE_KEY)
      const signed = signPromise.rawTransaction
      const sentTx = await web3.eth.sendSignedTransaction(signed)
      return true
    }
    catch (e) {
      console.log('makeOrderMSW failed: ' + e)
    }
  }

  var takeOrderMSW = async (_orderID, _multiSigWalletAddress, _INFURA_KEY, _PRIVATE_KEY) => {
    try {
      var manager = await getManagerWP(_PRIVATE_KEY)
      const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY
      var web3 = new Web3(endpoint)

      var routes = await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, _multiSigWalletAddress)
      var mSigContract = new web3.eth.Contract(multiSig, _multiSigWalletAddress)
      var tradingContract = new web3.eth.Contract(tradingABI, routes.trading)

      const order = await Protocol.getOasisDexOrder(manager, manager.deployment.thirdPartyContracts.exchanges.matchingMarket , {id: _orderID})
      const exchangeIndex = await getExchangeIndex(manager, routes.trading, { exchange: Exchanges.MatchingMarket })

      var inputData = await tradingContract.methods.callOnExchange(
        exchangeIndex,
        FunctionSignatures.takeOrder,
        [
        order.owner.toString(),
        routes.trading.toString(),
        order.sell.token.address.toString(),
        order.buy.token.address.toString(),
        emptyAddress,
        emptyAddress,
        ],
        [
        order.sell.quantity.toString(),
        order.buy.quantity.toString(),
        '0',
        '0',
        '0',
        '0',
        order.buy.quantity.toString(),
        0,
        ],
        `0x${Number(order.id).toString(16).padStart(64, '0')}`,
        '0x0',
        '0x0',
        '0x0'
        ).encodeABI()

    // create submitting tx for MSW
    const tx = {
      from: manager.wallet.address, 
      to: _multiSigWalletAddress,
      gas: 5500000,
      value: 0,
      data: await mSigContract.methods.submitTransaction(routes.trading, 0, inputData).encodeABI()
    }
    //sign and send TX
    const signPromise = await web3.eth.accounts.signTransaction(tx, _PRIVATE_KEY)
    const signed = signPromise.rawTransaction
    const sentTx = await web3.eth.sendSignedTransaction(signed)
    return true
  }
  catch (e) {
    console.log('takeOrderMSW failed: ' + e)
  }
}

  var cancelOrderMSW = async (_orderID, _multiSigWalletAddress, _INFURA_KEY, _PRIVATE_KEY) => {
    try {
      var manager = await getManagerWP(_PRIVATE_KEY)
      const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY
      var web3 = new Web3(endpoint)

      var routes = await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, _multiSigWalletAddress)
      var mSigContract = new web3.eth.Contract(multiSig, _multiSigWalletAddress)
      var tradingContract = new web3.eth.Contract(tradingABI, routes.trading)

      const order = await Protocol.getOasisDexOrder(manager, manager.deployment.thirdPartyContracts.exchanges.matchingMarket , {id: _orderID})
      const exchangeIndex = await getExchangeIndex(manager, routes.trading, { exchange: Exchanges.MatchingMarket })

      var inputData = await tradingContract.methods.callOnExchange(
        exchangeIndex,
        FunctionSignatures.cancelOrder,
        [
        order.owner.toString(),
        emptyAddress,
        order.sell.token.address.toString(),
        order.buy.token.address.toString(),
        emptyAddress,
        emptyAddress,
        ],
        ['0','0','0','0','0','0','0','0'],
        `0x${Number(order.id).toString(16).padStart(64, '0')}`,
        '0x0',
        '0x0',
        '0x0'
        ).encodeABI()

    // create submitting tx for MSW
    const tx = {
      from: manager.wallet.address, 
      to: _multiSigWalletAddress,
      gas: 1500000,
      value: 0,
      data: await mSigContract.methods.submitTransaction(routes.trading, 0, inputData).encodeABI()
    }
    //sign and send TX
    const signPromise = await web3.eth.accounts.signTransaction(tx, _PRIVATE_KEY)
    const signed = signPromise.rawTransaction
    const sentTx = await web3.eth.sendSignedTransaction(signed)
    return true
  }
  catch (e) {
    console.log('cancelOrderMSW failed: ' + e)
  }
}

var returnAssetToVaultMSW = async (_assetAddress, _multiSigWalletAddress, _INFURA_KEY, _PRIVATE_KEY) => {
  try {
    var manager = await getManagerWP(_PRIVATE_KEY)
    const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY
    var web3 = new Web3(endpoint)

    var routes = await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, _multiSigWalletAddress)
    var mSigContract = new web3.eth.Contract(multiSig, _multiSigWalletAddress)
    var tradingContract = new web3.eth.Contract(tradingABI, routes.trading)
    const inputData = await tradingContract.methods.returnAssetToVault(_assetAddress.toString()).encodeABI()
    
    const tx = {
      from: manager.wallet.address, 
      to: _multiSigWalletAddress,
      gas: 5500000,
      value: 0,
      data: await mSigContract.methods.submitTransaction(routes.trading, 0, inputData).encodeABI()
    }
    //sign and send TX
    const signPromise = await web3.eth.accounts.signTransaction(tx, _PRIVATE_KEY)
    const signed = signPromise.rawTransaction
    const sentTx = await web3.eth.sendSignedTransaction(signed)
    return true
  }
  catch (e) {
    console.log('returnAssetToVaultMSW failed: ' + e)
  }
}

var redeemMSW = async(_multiSigWalletAddress, _INFURA_KEY, _PRIVATE_KEY) => {
  try {
    var manager = await getManagerWP(_PRIVATE_KEY)
    const endpoint = 'https://kovan.infura.io/v3/' + _INFURA_KEY
    var web3 = new Web3(endpoint)

    var routes = await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, _multiSigWalletAddress)
    var mSigContract = new web3.eth.Contract(multiSig, _multiSigWalletAddress)
    var participationContract = new web3.eth.Contract(participationABI, routes.participation)
    const inputData = await participationContract.methods.redeem().encodeABI()
    
    const tx = {
      from: manager.wallet.address, 
      to: _multiSigWalletAddress,
      gas: 5500000,
      value: 0,
      data: await mSigContract.methods.submitTransaction(routes.participation, 0, inputData).encodeABI()
    }
    //sign and send TX
    const signPromise = await web3.eth.accounts.signTransaction(tx, _PRIVATE_KEY)
    const signed = signPromise.rawTransaction
    const sentTx = await web3.eth.sendSignedTransaction(signed)
    return true
  }
  catch (e) {
    console.log('redeemMSW failed: ' + e)
  }
}

module.exports = {
  addOwnerMSW,
  confirmMSW,
  executeMSW,
  beginSetupMSW,
  completeSetupMSW,
  makeOrderMSW,
  takeOrderMSW,
  cancelOrderMSW,
  returnAssetToVaultMSW,
  redeemMSW
}
