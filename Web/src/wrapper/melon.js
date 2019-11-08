import { INFURA_KEY } from '../env'
import withPrivateKeySigner from './withPrivateKeySigner'
var Protocol = require('@melonproject/protocol')
var takeOasisDexOrder = require('@melonproject/protocol/lib/contracts/fund/trading/transactions/takeOasisDexOrder').takeOasisDexOrder
var withDeployment = require('@melonproject/protocol/lib/utils/environment/withDeployment').withDeployment
var constructEnvironment = require('@melonproject/protocol/lib/utils/environment/constructEnvironment').constructEnvironment
var exchangeAggregate = require('@melonproject/exchange-aggregator')
var createQuantity = require('@melonproject/token-math').createQuantity

const ENDPOINT = 'https://kovan.infura.io/v3/' + INFURA_KEY;
const EXCHANGES = ['oasisdex']

var getFundData = spoke => JSON.parse(window.localStorage.getItem('fund'))[spoke];
var getEnvironment = () => withDeployment(constructEnvironment({ endpoint: ENDPOINT, track: 'kyberPrice' }))
var getManager = async () => await withPrivateKeySigner(await getEnvironment())
export var getAllAssets = async () => (await getEnvironment()).deployment.thirdPartyContracts.tokens.map(asset => ({ token: asset }))

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

export var getHoldings = async () => {
  try {
    var accountingAddress = getFundData('accounting')
    var manager = await getEnvironment()
    var holdings = await Protocol.getFundHoldings(manager, accountingAddress);
    return holdings;
  } catch (e) {
    alert('Could not load assets: ' + e.message)
  }
}

export var getInfo = async () => {
  var accountingAddress = getFundData('accounting')
  var environment = await getEnvironment();
  var { nav, sharePrice } = await Protocol.performCalculations(environment, accountingAddress)
  nav = nav.quantity / Math.pow(10, nav.token.decimals);
  sharePrice = sharePrice.quote.quantity / sharePrice.base.quantity
  return sharePrice;
}

export var getName = async () => {
  var hubAddress = getFundData('hubAddress')
  var environment = await getEnvironment();
  return await Protocol.getName(environment, hubAddress)
}

export var makeOrder = async (quoteSymbol, quantityInWeth, quantityInQuoteToken, action) => {
  var tradingAddress = getFundData('trading')
  var manager = await getManager();
  const base = Protocol.getTokenBySymbol(manager, 'WETH');
  const quote = Protocol.getTokenBySymbol(manager, quoteSymbol);
  var makerQuantity = (action == 'BUY') ? createQuantity(base, quantityInWeth) : createQuantity(quote, quantityInQuoteToken);
  var takerQuantity = (action == 'BUY') ? createQuantity(quote, quantityInQuoteToken) : createQuantity(base, quantityInWeth);
  return await Protocol.makeOasisDexOrder(manager, tradingAddress, { makerQuantity, takerQuantity });
}

export var takeOrder = async (orderId) => {
  var tradingAddress = getFundData('trading')
  var manager = await getManager();
  var enhancedOrder = await Protocol.getOasisDexOrder(manager, manager.deployment.exchangeConfigs.MatchingMarket.exchange, { id: orderId });
  return await takeOasisDexOrder(manager, tradingAddress, {
    id: orderId,
    makerQuantity: enhancedOrder.sell,
    takerQuantity: enhancedOrder.buy,
    maker: enhancedOrder.owner,
  })
}

export var getHubs = async () => {
  var manager = await getManager();
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