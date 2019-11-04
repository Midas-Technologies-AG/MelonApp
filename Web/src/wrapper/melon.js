import { INFURA_KEY } from '../env'
var Protocol = require('@melonproject/protocol')

var takeOasisDexOrder = require('@melonproject/protocol/lib/contracts/fund/trading/transactions/takeOasisDexOrder').takeOasisDexOrder
// var withPrivateKeySigner = require('@melonproject/protocol/lib/utils/environment/withPrivateKeySigner').withPrivateKeySigner
var withDeployment = require('@melonproject/protocol/lib/utils/environment/withDeployment').withDeployment
var constructEnvironment = require('@melonproject/protocol/lib/utils/environment/constructEnvironment').constructEnvironment
var exchangeAggregate = require('@melonproject/exchange-aggregator')
var createQuantity = require('@melonproject/token-math').createQuantity
var setupInvestedTestFund = require('@melonproject/protocol/lib/tests/utils/setupInvestedTestFund').setupInvestedTestFund//.js
// var HDWalletProvider = require("react-native-truffle-hdwallet-provider");
// import { AsyncStorage } from 'react-native';
var AsyncStorage = window.localStorage
// var hasValidPrice = require('@melonproject/protocol/lib/contracts/prices/calls/hasValidPrice').hasValidPrice


const ENDPOINT = 'https://kovan.infura.io/v3/' + INFURA_KEY;
const EXCHANGES = ['oasisdex']

// var Web3 = require('web3')
// var web3 = new Web3('https://ropsten.infura.io/v3/' + INFURA_KEY)
// const ABI = [{ "constant": true, "inputs": [], "name": "orderId", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "targetExchange", "type": "address" }, { "name": "orderAddresses", "type": "address[6]" }, { "name": "orderValues", "type": "uint256[8]" }, { "name": "identifier", "type": "bytes32" }, { "name": "makerAssetData", "type": "bytes" }, { "name": "takerAssetData", "type": "bytes" }, { "name": "signature", "type": "bytes" }], "name": "cancelOrder", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "targetExchange", "type": "address" }, { "name": "orderAddresses", "type": "address[6]" }, { "name": "orderValues", "type": "uint256[8]" }, { "name": "identifier", "type": "bytes32" }, { "name": "makerAssetData", "type": "bytes" }, { "name": "takerAssetData", "type": "bytes" }, { "name": "signature", "type": "bytes" }], "name": "makeOrder", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "donateEther", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "targetExchange", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "onExchange", "type": "address" }, { "name": "id", "type": "uint256" }, { "name": "makerAsset", "type": "address" }], "name": "getOrder", "outputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "targetExchange", "type": "address" }, { "name": "orderAddresses", "type": "address[6]" }, { "name": "orderValues", "type": "uint256[8]" }, { "name": "identifier", "type": "bytes32" }, { "name": "makerAssetData", "type": "bytes" }, { "name": "takerAssetData", "type": "bytes" }, { "name": "signature", "type": "bytes" }], "name": "takeOrder", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }]
// var contract = new web3.eth.Contract(ABI, '0x3C62F6D8984EAAA0690D99A5BF911D08892E5397')
// contract.methods.donateEther().send({ from: '0x88D855BdF87b93B956154714109d9a5A22A6AD9B' }, function (error, result) {
//     console.warn(error);
//     console.warn(result);
//     console.warn(JSON.stringify(result));
//   });
// contract.methods.makeOrder('0x0000000000000000000000000000000000000000',
//   ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0xc778417E063141139Fce010982780140Aa0cD5Ab', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000'],
//   [10000000000, 0, 0, 0, 0, 0, 0, 0],
//   '0x0',
//   '0x0',
//   '0x0',
//   '0x0').send({ from: '0x88D855BdF87b93B956154714109d9a5A22A6AD9B' }, function (error, result) {
//     console.warn(error);
//     console.warn(result);
//     console.warn(JSON.stringify(result));
//   });

//TODO move to seperate file
const withPrivateKeySigner = (environment) => {
  var Web3Accounts = require("web3-eth-accounts")
  var web3Accounts = new Web3Accounts(window.web3.currentProvider)
  const address = window.web3.currentProvider.selectedAddress


  const signTransaction = unsignedTransaction => web3Accounts
    .signTransaction(unsignedTransaction, (f, d) => console.warn(f))
  // .then(t => t.rawTransaction);
  const signMessage = message => window.web3.eth.sign(address, message, function (err, result) {
    if (err) return console.error(err)
    console.log('SIGNED:' + result)
  })
  const withWallet = Object.assign({}, environment, {
    wallet: {
      address,
      signMessage,
      signTransaction,
    }
  });
  return withWallet;
};


var generateExchangeAggregatorOptions = async (baseSymbol = 'WETH', quoteSymbol = 'MLN', environment, network = exchangeAggregate.Network.KOVAN) => {
  var manager = environment || await getEnvironment()
  return ({
    network,
    base: baseSymbol,
    quote: quoteSymbol,
    environment: manager
  })
}

export var getOrders = async (baseSymbol, quoteSymbol, action) => {
  try {
    var exchanges = EXCHANGES;
    var manager = await getEnvironment();
    var options = await generateExchangeAggregatorOptions(baseSymbol, quoteSymbol, manager)
    var orders = new Array();
    try {
      orders = orders.concat(await exchangeAggregate.exchanges[exchanges[0]].fetch(options))
    } catch (e) {
      console.warn(e.message);
    }
    orders = removeDuplicateOrders(orders);
    var filteredOrders = orders.filter(o => o.type == 'BID');
    (action == 'add') ? filteredOrders.sort((a, b) => Number(a.trade.base.quantity) - Number(b.trade.base.quantity)) : filteredOrders.sort((a, b) => Number(b.trade.base.quantity) - Number(a.trade.base.quantity))
    return filteredOrders;
  } catch (e) {
    return [];
  }
}

var getFundData = async (spoke) => JSON.parse(await AsyncStorage.getItem('fund'))[spoke];
export var getPrivateKey = (mnemonic) => { }// '0x' + (new HDWalletProvider(mnemonic, ENDPOINT)).wallet._privKey.toString('hex')
export var getManagerFromPrivateKey = async (privateKey) => await withPrivateKeySigner(await getEnvironment())
var getManager = async () => await getManagerFromPrivateKey()//await AsyncStorage.getItem('privateKey'));
export var getManagerFromMnemonic = async (mnemonic) => await getManagerFromPrivateKey(getPrivateKey(mnemonic));
export var getEnvironment = () => withDeployment(constructEnvironment({ endpoint: ENDPOINT, track: 'kyberPrice' }))
export var getAllAssets = async () => (await getEnvironment()).deployment.thirdPartyContracts.tokens.map(asset => ({ token: asset }))

export var getHoldings = async () => {
  try {
    var accountingAddress = await getFundData('accounting')
    var manager = await getEnvironment()
    var holdings = await Protocol.getFundHoldings(manager, accountingAddress);
    return holdings;
  } catch (e) {
    alert('Could not load assets: ' + e.message)
  }
}

export var getInfo = async () => {
  var accountingAddress = await getFundData('accounting')
  var environment = await getEnvironment();
  var { nav, sharePrice } = await Protocol.performCalculations(environment, accountingAddress)
  nav = nav.quantity / Math.pow(10, nav.token.decimals);
  sharePrice = sharePrice.quote.quantity / sharePrice.base.quantity
  return sharePrice;
}

export var getName = async () => {
  var hubAddress = await getFundData('hubAddress')
  var environment = await getEnvironment();
  return await Protocol.getName(environment, hubAddress)
}

export var makeOrder = async (quoteSymbol, quantityInWeth, quantityInQuoteToken, action) => {
  var tradingAddress = await getFundData('trading')
  var manager = await getManager();
  const base = Protocol.getTokenBySymbol(manager, 'WETH');
  const quote = Protocol.getTokenBySymbol(manager, quoteSymbol);
  var makerQuantity = (action == 'BUY') ? createQuantity(base, quantityInWeth) : createQuantity(quote, quantityInQuoteToken);
  var takerQuantity = (action == 'BUY') ? createQuantity(quote, quantityInQuoteToken) : createQuantity(base, quantityInWeth);
  return await Protocol.makeOasisDexOrder(manager, tradingAddress, { makerQuantity, takerQuantity });
}

export var takeOrder = async (orderId) => {
  var tradingAddress = await getFundData('trading')
  var manager = await getManager();
  var enhancedOrder = await Protocol.getOasisDexOrder(manager, manager.deployment.exchangeConfigs.MatchingMarket.exchange, { id: orderId });
  return await takeOasisDexOrder(manager, tradingAddress, {
    id: orderId,
    makerQuantity: enhancedOrder.sell,
    takerQuantity: enhancedOrder.buy,
    maker: enhancedOrder.owner,
  })
}
// makeOrder('MLN', 0.01, 1, 'SELL')
//   .then(console.warn)
//   .catch(console.warn)
// takeOrder('37440')
//   .then(console.warn)
// .catch(console.warn)

export var getHubs = async () => {
  var manager = await getManager();
  console.warn(manager.wallet);
  console.warn(manager);
  
  return await Protocol.managersToHubs(manager, manager.deployment.melonContracts.version, manager.wallet.address)
}

export var getRoutes = async () => {
  var manager = await getManager();
  return await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, manager.wallet.address)
}

var removeDuplicateOrders = (orders) => orders.reduce((collectedOrders, order) => {
  var quantities = collectedOrders.map(o => String(o.trade.base.quantity))
  if (quantities.indexOf(String(order.trade.base.quantity)) < 0) collectedOrders.push(order)
  return collectedOrders;
}, new Array());

// setTimeout(async () => {
//   var x = await window.web3.eth.sign('0x88D855BdF87b93B956154714109d9a5A22A6AD9B', '0x88D855BdF87b93B956154714109d9a5A22A6AD9B', function (err, result) {
//     alert('fds')
//     if (err) return console.warn(err)
//     console.warn('SIGNED:' + result)
//   })
//   console.warn(x);

// }, 1000)

// setup fund using ropsten
// test new functions

