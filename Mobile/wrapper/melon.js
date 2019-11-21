var Protocol = require('@melonproject/protocol')
var takeOasisDexOrder = require('@melonproject/protocol/lib/contracts/fund/trading/transactions/takeOasisDexOrder').takeOasisDexOrder
var withPrivateKeySigner = require('@melonproject/protocol/lib/utils/environment/withPrivateKeySigner').withPrivateKeySigner
var withDeployment = require('@melonproject/protocol/lib/utils/environment/withDeployment').withDeployment
var constructEnvironment = require('@melonproject/protocol/lib/utils/environment/constructEnvironment').constructEnvironment
var exchangeAggregate = require('@melonproject/exchange-aggregator')
var createQuantity = require('@melonproject/token-math').createQuantity
var HDWalletProvider = require("react-native-truffle-hdwallet-provider");
var setupFund = require('@melonproject/protocol/lib/contracts/fund/hub/transactions/setupFund').setupFund
const approve = require("@melonproject/protocol/lib/contracts/dependencies/token/transactions/approve").approve
import { AsyncStorage } from 'react-native';

import { INFURA_KEY } from '../env'

const ENDPOINT = 'https://kovan.infura.io/v3/' + INFURA_KEY;
const EXCHANGES = ['oasisdex']

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
export var getPrivateKey = (mnemonic) => '0x' + (new HDWalletProvider(mnemonic, ENDPOINT)).wallet._privKey.toString('hex')
export var getManagerFromPrivateKey = async (privateKey) => await withPrivateKeySigner(await getEnvironment(), privateKey)
var getManagerFromAsyncStorage = async () => await getManagerFromPrivateKey(await AsyncStorage.getItem('privateKey'));
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
  return await Protocol.performCalculations(environment, accountingAddress)
}

export var makeOrder = async (quoteSymbol, quantityInWeth, quantityInQuoteToken, action) => {
  var tradingAddress = await getFundData('trading')
  var manager = await getManagerFromAsyncStorage();
  const base = Protocol.getTokenBySymbol(manager, 'WETH');
  const quote = Protocol.getTokenBySymbol(manager, quoteSymbol);
  var makerQuantity = (action == 'BUY') ? createQuantity(base, quantityInWeth) : createQuantity(quote, quantityInQuoteToken);
  var takerQuantity = (action == 'BUY') ? createQuantity(quote, quantityInQuoteToken) : createQuantity(base, quantityInWeth);
  return await Protocol.makeOasisDexOrder(manager, tradingAddress, { makerQuantity, takerQuantity });
}

export var takeOrder = async (orderId) => {
  var tradingAddress = await getFundData('trading')
  var manager = await getManagerFromAsyncStorage();
  var enhancedOrder = await Protocol.getOasisDexOrder(manager, manager.deployment.exchangeConfigs.MatchingMarket.exchange, { id: orderId });
  return await takeOasisDexOrder(manager, tradingAddress, {
    id: orderId,
    makerQuantity: enhancedOrder.sell,
    takerQuantity: enhancedOrder.buy,
    maker: enhancedOrder.owner,
  })
}

export var getHubs = async () => {
  var manager = await getManagerFromAsyncStorage();
  return await Protocol.managersToHubs(manager, manager.deployment.melonContracts.version, manager.wallet.address)
}

export var getRoutes = async () => {
  var manager = await getManagerFromAsyncStorage();
  return await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, manager.wallet.address)
}

var removeDuplicateOrders = (orders) => orders.reduce((collectedOrders, order) => {
  var quantities = collectedOrders.map(o => String(o.trade.base.quantity))
  if (quantities.indexOf(String(order.trade.base.quantity)) < 0) collectedOrders.push(order)
  return collectedOrders;
}, new Array());

var getBalance = async (address) => {
  var environment = await getEnvironment();
  return new Promise((resolve, reject) => {
    environment.eth.getBalance(address, (e, d) => {
      if (e) reject(e)
      else resolve(d / Math.pow(10, 18))
    })
  })
}

export const setupFundInvestedFund = async (fundName, privateKey) => {
  var environment = await getManagerFromPrivateKey(privateKey);
  var balance = await getBalance(environment.wallet.address);
  console.warn(balance);
  if (balance < 1.3) {
    throw new Error('Ensure a minimum balance of 1.3 ETH');
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