var Protocol = require('@melonproject/protocol')
var takeOasisDexOrder = require('@melonproject/protocol/lib/contracts/fund/trading/transactions/takeOasisDexOrder').takeOasisDexOrder
var withPrivateKeySigner = require('@melonproject/protocol/lib/utils/environment/withPrivateKeySigner').withPrivateKeySigner
var withDeployment = require('@melonproject/protocol/lib/utils/environment/withDeployment').withDeployment
var constructEnvironment = require('@melonproject/protocol/lib/utils/environment/constructEnvironment').constructEnvironment
var exchangeAggregate = require('@melonproject/exchange-aggregator')
var createQuantity = require('@melonproject/token-math').createQuantity
import { AsyncStorage } from 'react-native';

import { INFURA_KEY } from '../env'

const ENDPOINT = 'https://kovan.infura.io/v3/' + INFURA_KEY;
const EXCHANGES = ['oasisdex']

//TODO remove these/get them from hub address
//kunal@m1d4s.tech Yupppp kunals
const ACCOUNTING_ADDRESS = '0xc9d528287A37C59259F139480C9f50082B7Bf080';
const TRADING_ADDRESS = '0x34B55262cF8367E4c799Bf3008F05fF0070b918c';
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

export var getPrivateKey = (mnemonic) => { console.warn('0x' + (new HDWalletProvider(mnemonic, ENDPOINT)).wallet._privKey.toString('hex')); return '0x' + (new HDWalletProvider(mnemonic, ENDPOINT)).wallet._privKey.toString('hex') }
export var getManagerFromPrivateKey = async (privateKey) => await withPrivateKeySigner(await getEnvironment(), privateKey)
var getManagerFromAsyncStorage = async () => await getManagerFromPrivateKey(await AsyncStorage.getItem('privateKey'));
export var getManagerFromMnemonic = async (mnemonic) => await getManagerFromPrivateKey(getPrivateKey(mnemonic));
export var getEnvironment = () => withDeployment(constructEnvironment({ endpoint: ENDPOINT, track: 'kyberPrice' }))
export var getAllAssets = async () => (await getEnvironment()).deployment.thirdPartyContracts.tokens.map(asset => ({ token: asset }))

export var getHoldings = async (accountingAddress = ACCOUNTING_ADDRESS) => {
  try {
    var manager = await getEnvironment()
    var holdings = await Protocol.getFundHoldings(manager, accountingAddress);
    return holdings;
  } catch (e) {
    alert('Could not load assets: ' + e.message)
  }
}

export var makeOrder = async (quoteSymbol, quantityInWeth, quantityInQuoteToken, action, tradingAddress = TRADING_ADDRESS) => {
  var manager = await getManagerFromAsyncStorage();
  const base = Protocol.getTokenBySymbol(manager, 'WETH');
  const quote = Protocol.getTokenBySymbol(manager, quoteSymbol);
  var makerQuantity = (action == 'BUY') ? createQuantity(base, quantityInWeth) : createQuantity(quote, quantityInQuoteToken);
  var takerQuantity = (action == 'BUY') ? createQuantity(quote, quantityInQuoteToken) : createQuantity(base, quantityInWeth);
  return await Protocol.makeOasisDexOrder(manager, tradingAddress, { makerQuantity, takerQuantity });
}

export var takeOrder = async (orderId, tradingAddress = TRADING_ADDRESS) => {
  var manager = await getManagerFromAsyncStorage();
  var enhancedOrder = await Protocol.getOasisDexOrder(manager, manager.deployment.exchangeConfigs.MatchingMarket.exchange, { id: orderId });
  return await takeOasisDexOrder(manager, tradingAddress, {
    id: orderId,
    makerQuantity: enhancedOrder.sell,
    takerQuantity: enhancedOrder.buy,
    maker: enhancedOrder.owner,
  })
}

var removeDuplicateOrders = (orders) => orders.reduce((collectedOrders, order) => {
  var quantities = collectedOrders.map(o => String(o.trade.base.quantity))
  if (quantities.indexOf(String(order.trade.base.quantity)) < 0) collectedOrders.push(order)
  return collectedOrders;
}, new Array());