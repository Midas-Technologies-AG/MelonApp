import Web3 from "web3";
import { INFURA_KEY } from '../env'
import withPrivateKeySigner from './withPrivateKeySigner'
var Protocol = require('@melonproject/protocol')
var takeOasisDexOrder = require('@melonproject/protocol/lib/contracts/fund/trading/transactions/takeOasisDexOrder').takeOasisDexOrder
var withDeployment = require('@melonproject/protocol/lib/utils/environment/withDeployment').withDeployment
var constructEnvironment = require('@melonproject/protocol/lib/utils/environment/constructEnvironment').constructEnvironment
var exchangeAggregate = require('@melonproject/exchange-aggregator')
var createQuantity = require('@melonproject/token-math').createQuantity
var setupFund = require('@melonproject/protocol/lib/contracts/fund/hub/transactions/setupFund').setupFund
const ENDPOINT = 'https://kovan.infura.io/v3/' + INFURA_KEY;
const EXCHANGES = ['oasisdex']
const approve = require("@melonproject/protocol/lib/contracts/dependencies/token/transactions/approve").approve

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
    var validOpenOrdersPromises = filteredOrders.map(async order => {
      try {
        var enhancedOrder = await Protocol.getOasisDexOrder(manager, manager.deployment.exchangeConfigs.MatchingMarket.exchange, { id: order.original.id })
        return Object.assign({}, order, { isMine: enhancedOrder.owner.toLowerCase() === getFundData('trading').toLowerCase() });
      } catch (e) { }
    })
    var validOpenOrders = (await Promise.all(validOpenOrdersPromises)).filter(order => !!order);
    return validOpenOrders;
  } catch (e) {
    console.warn(e);

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

var getBalance = async (address) => {
  var manager = await getManager();
  return new Promise((resolve, reject) => {
    window.web3.eth.getBalance(address || manager.wallet.address, (e, d) => {
      if (e) reject(e)
      else resolve(d / Math.pow(10, 18))
    })
  })
}

export const setupFundInvestedFund = async (fundName) => {
  var environment = await getManager();
  var balance = await getBalance();
  console.warn(balance);
  if (balance < 1.3) {
    alert('Ensure a minimum balance of 1.3 ETH')
    return;
  }
  const weth = Protocol.getTokenBySymbol(environment, 'WETH');
  const investmentAmount = createQuantity(weth, 1);
  var fund = await setupFund(environment, fundName)
  console.warn(fund);
  const fundToken = await Protocol.getToken(environment, fund.sharesAddress);
  await Protocol.deposit(environment, investmentAmount.token.address, undefined, {
    value: investmentAmount.quantity.toString()
  })
  await approve(environment, {
    howMuch: investmentAmount,
    spender: fund.participationAddress,
  });
  await Protocol.requestInvestment(environment, fund.participationAddress, {
    investmentAmount,
    requestedShares: createQuantity(fundToken, 1),
  });
  await Protocol.executeRequest(environment, fund.participationAddress);
  return fund;
}

export const cancelOrder = async (id) => {
  var manager = await getManager();
  var tradingAddress = getFundData('trading')
  var web3 = new Web3(window.web3.currentProvider)
  var order = await Protocol.getOasisDexOrder(manager, manager.deployment.exchangeConfigs.MatchingMarket.exchange, { id })
  return await Protocol.cancelOasisDexOrder(manager, tradingAddress, {
    id: order.id,
    maker: '0x88D855BdF87b93B956154714109d9a5A22A6AD9B',
    makerAsset: order.sell.token.address,
    takerAsset: order.buy.token.address,
  });
}