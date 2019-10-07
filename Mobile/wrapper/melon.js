var Protocol = require('@melonproject/protocol')
var withDeployment = require('@melonproject/protocol/lib/utils/environment/withDeployment').withDeployment
var constructEnvironment = require('@melonproject/protocol/lib/utils/environment/constructEnvironment').constructEnvironment
var exchangeAggregate = require('@melonproject/exchange-aggregator')

import { INFURA_KEY } from '../env'

const ENDPOINT = 'https://kovan.infura.io/'
const EXCHANGES = ['oasisdex']

const ACCOUNTING_ADDRESS = '0xf66a89bb46889ab7afe285463f019a352eedf1d4';
// 0x81f153cea0e7a3a8b5a11ff61feafb42111d0d96
// 0x4f181e8845a344ca4d1f0add926565d841b6b0a7 hub
// 0x5c538b790973842527fd65f7aa4257519ac3a6c8
// 0x91bae33f90f9adae859e4cd947a491f816e98822
// 0x385a59e848f6456adf19c367c8cf03fd39c23fab
// 0xb8acdbe95e9980fae93716eba27709bcf1765a12
// 0xc66b1095a45584b94c75552f6b828c86893e68e6
// 0x9443d02c764e0daeb4c63b6c5c2f9549bd320036 trading
// 0xe25c5bb381a97b14ad87c25302ae69b9d90e8538 vault
// 0x160386e65c129c43ada6496ed0ec2ec63040f0bc

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

export var makeOrder = async (tradingAddress, quoteSymbol, quantityInWeth, quantityInQuoteToken, action) => {
  var manager = await getManagerFromAsyncStorage();
  const base = Protocol.getTokenBySymbol(manager, 'WETH');
  const quote = Protocol.getTokenBySymbol(manager, quoteSymbol);
  var makerQuantity = (action == 'add') ? createQuantity(base, quantityInWeth) : createQuantity(quote, quantityInQuoteToken);
  var takerQuantity = (action == 'add') ? createQuantity(quote, quantityInQuoteToken) : createQuantity(base, quantityInWeth);
  return await Protocol.makeOasisDexOrder(manager, tradingAddress, { makerQuantity, takerQuantity });
}

export var takeOrder = async (tradingAddress, orderId) => {
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