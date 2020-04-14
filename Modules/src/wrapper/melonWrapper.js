const dotenv = require('dotenv');
dotenv.config();

const Web3 = require('web3')
const getTokenAddress = require('./getTokenAddress')
const ConversionRatesAbi = require('./ConversionRates.abi')
const withPrivateKeySigner = require('./withPrivateKeySigner')

var Protocol = require('@melonproject/protocol')
const DEPLOYMENT = require('@melonproject/protocol/deployments/kovan-kyberPrice.json')
const stringToBytes32 = require("@melonproject/protocol/lib/utils/helpers/stringToBytes32").stringToBytes32
var constructEnvironment = require('@melonproject/protocol/lib/utils/environment/constructEnvironment').constructEnvironment
var takeOasisDexOrder = require('@melonproject/protocol/lib/contracts/fund/trading/transactions/takeOasisDexOrder').takeOasisDexOrder
var setupFund = require('@melonproject/protocol/lib/contracts/fund/hub/transactions/setupFund').setupFund
var withDifferentAccount = require('@melonproject/protocol/lib/utils/environment/withDifferentAccount').withDifferentAccount
const fundFactory = require('@melonproject/protocol/out/FundFactory.abi.json')

const { createQuantity, appendDecimals, toBI } = require('@melonproject/token-math')
var exchangeAggregate = require('@melonproject/exchange-aggregator')

const {
  INFURA_KEY
} = require('../../.env')

const ENDPOINT = 'https://kovan.infura.io/v3/' + INFURA_KEY


var getEnvironment = () => constructEnvironment({endpoint: ENDPOINT, track: 'kyberPrice', deployment: DEPLOYMENT})
var getManager = async () => await withPrivateKeySigner(await getEnvironment(), process.env.PRIVATE_KEY)
var getManagerWP = async (_privateKey) => await withPrivateKeySigner(await getEnvironment(), _privateKey)
var getManagerOf = async (_address) => {
  try {
    var environment = await getEnvironment()
    var manager = await withDifferentAccount(environment, _address)
    return manager
  } catch (e) {
    console.log('Could not load manager ' + _address + ' : ' + e.message)
  }
}

var getRoutesOf = async (fundManagerAddress) => {
  try {
    var manager = await getManagerOf(fundManagerAddress);
    var routes = await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, manager.wallet.address)
    if (routes.accounting == '0x0000000000000000000000000000000000000000') return alert('The given address does not have a fund.')
      return routes
  } catch (e) {
    console.log('Could not get routes of ' + fundManagerAddress + ' : ' + e.message)
  }
}

var getHoldings = async () => {
  try {
    var manager = await getManager();
    var accountingAddress = (await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, manager.wallet.address)).accounting
    var holdings = await Protocol.getFundHoldings(manager, accountingAddress);
    return holdings;
  } catch (e) {
    console.log('Could not load holdings: ' + e.message)
  }
}

var getHoldingsWP = async (_privateKey) => {
  try {
    var manager = await getManagerWP(_privateKey);
    var accountingAddress = (await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, manager.wallet.address)).accounting
    var holdings = await Protocol.getFundHoldings(manager, accountingAddress);
    return holdings;
  } catch (e) {
    console.log('Could not load holdings: ' + e.message)
  }
}


var getHoldingsOf = async (fundManagerAddress) => {
  try {
    var manager = await getManagerOf(fundManagerAddress);
    var accountingAddress = (await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, manager.wallet.address)).accounting
    var holdings = await Protocol.getFundHoldings(manager, accountingAddress);
    return holdings;
  } catch (e) {
    console.log('Could not load holdings: ' + e.message)
  }
}

var getRate = async (holding) => {
  try {
    const endpoint = 'https://mainnet.infura.io/v3/' + process.env.INFURA_KEY;
    var web3 = new Web3(endpoint)
    var contract = new web3.eth.Contract(ConversionRatesAbi, '0x798AbDA6Cc246D0EDbA912092A2a3dBd3d11191B')
    var getBlockNumber = await web3.eth.getBlockNumber()

    var value = ((await contract.methods.getRate(
      getTokenAddress(holding.token.symbol),
      getBlockNumber,
      false,
      1
      ).call()) / Math.pow(10, holding.token.decimals));
    return value
  } catch (e) {
    console.log('Could not get rate for ' + holding.token.symbol + ' : ' + e.message)
  }
}

var getBalance = async (address) => {
  try {
    const endpoint = 'https://kovan.infura.io/v3/' + process.env.INFURA_KEY;
    var web3 = new Web3(endpoint)
    var balance = await web3.eth.getBalance(address) / Math.pow(10, 18)
    return balance
  } catch (e) {
    console.log('Could not getBalance for ' + address + ' : ' + e.message)
  }
}

var calculateAUM = async (holdings) => {
  try {
    var sum = 0.0
    for (holding in holdings) {
      if (holdings[holding].token.symbol != 'WETH')
        sum += await calculateAUMof(holdings[holding])
      else 
        sum += holdings[holding].quantity / Math.pow(10, holdings[holding].token.decimals)
    }
    return sum
  } catch (e) {
    console.log('Could not calculate aum: ' + e.message)
  }
}

var calculateAUMof = async (asset) => {
  try {
    const endpoint = 'https://mainnet.infura.io/v3/' + process.env.INFURA_KEY;
    var web3 = new Web3(endpoint)
    var contract = new web3.eth.Contract(ConversionRatesAbi, '0x798AbDA6Cc246D0EDbA912092A2a3dBd3d11191B')
    var getBlockNumber = await web3.eth.getBlockNumber()

    if (asset.token.symbol == 'WETH') 
      return asset.quantity / Math.pow(10, asset.token.decimals)
    var value = (((await contract.methods.getRate(
      getTokenAddress(asset.token.symbol),
      getBlockNumber,
      false,
      1
      ).call()) * asset.quantity) / Math.pow(10, asset.token.decimals))
    return value / Math.pow(10, 18)
  } catch (e) {
    console.log('Could not calculate aum of ' + asset.token.symbol + ': ' + e.message)
  }
}

var calculateAUMwithoutWETH = async (holdings) => {
  try {
    var sum = 0.0
    for (holding in holdings)
      if (holdings[holding].token.symbol != 'WETH')
        sum += await calculateAUMof(holdings[holding])
      return sum
    } catch (e) {
      console.log('Could not calculate aum: ' + e.message)
    }
  }

  var getOrders = async (baseSymbol, quoteSymbol, action) => {
    try {
      var exchanges = ['oasisdex'];
    var manager = await getManager() //getEnvironment()
    var options = await generateExchangeAggregatorOptions(baseSymbol, quoteSymbol, manager)
    var orders = [];
    orders = orders.concat(await exchangeAggregate.exchanges[exchanges[0]].fetch(options))
    return orders
/*    orders = removeDuplicateOrders(orders);
    console.log('##########################################')
    console.log(orders)

    var filteredOrders = orders.filter(o => o.type == 'BID');
    (action == 'add') ? filteredOrders.sort((a, b) => Number(a.trade.base.quantity) - Number(b.trade.base.quantity)) : filteredOrders.sort((a, b) => Number(b.trade.base.quantity) - Number(a.trade.base.quantity))
    var validOpenOrdersPromises = filteredOrders.map(async order => {
      try {
        var enhancedOrder = await Protocol.getOasisDexOrder(manager, manager.deployment.exchangeConfigs.MatchingMarket.exchange, { id: order.original.id })
        return Object.assign({}, order, { isMine: enhancedOrder.owner.toLowerCase() === 
          (await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, manager.wallet.address)).trading.toLowerCase() });
      } catch (e) { }
    })
    var validOpenOrders = (await Promise.all(validOpenOrdersPromises)).filter(order => !!order);
    return validOpenOrders;*/
  } catch (e) {
    console.warn(e);
  }
}

var generateExchangeAggregatorOptions = async (baseSymbol = 'WETH', quoteSymbol = 'MLN', environment, network = exchangeAggregate.Network.KOVAN) => {
  var baseToken = await Protocol.getTokenBySymbol(environment, baseSymbol)
  var quoteToken = await Protocol.getTokenBySymbol(environment, quoteSymbol)
  return ({
    network,
    pair: {
      base: baseToken,
      quote: quoteToken
    },
    environment: environment
  })
}

/*var removeDuplicateOrders = (orders) => orders.reduce((collectedOrders, order) => {
  var quantities = collectedOrders.map(o => String(o.trade.base.quantity))
  if (quantities.indexOf(String(order.trade.base.quantity)) < 0) collectedOrders.push(order)
    return collectedOrders;
}, new Array());*/

var makeOrder = async (quoteSymbol, quantityInWeth, quantityInQuoteToken, action) => {
  try {
    var manager = await getManager();
    var tradingAddress = (await Protocol.managersToRoutes(
      manager,
      manager.deployment.melonContracts.version,
      manager.wallet.address
      )).trading
    const base = Protocol.getTokenBySymbol(manager, 'WETH');
    const quote = Protocol.getTokenBySymbol(manager, quoteSymbol);
    var makerQuantity = (action == 'BUY') ? createQuantity(base, quantityInWeth) : createQuantity(quote, quantityInQuoteToken);
    var takerQuantity = (action == 'BUY') ? createQuantity(quote, quantityInQuoteToken) : createQuantity(base, quantityInWeth);
    return await Protocol.makeOasisDexOrder(manager, tradingAddress, { makerQuantity, takerQuantity });
  } catch (e) {
    console.log('Could not makeOrder ' + e.message)
  }
}

var makeOrderWP = async (_privateKey, quoteSymbol, quantityInWeth, quantityInQuoteToken, action) => {
  try {
    var manager = await getManagerWP(_privateKey);
    var tradingAddress = (await Protocol.managersToRoutes(
      manager,
      manager.deployment.melonContracts.version,
      manager.wallet.address
      )).trading
    const base = Protocol.getTokenBySymbol(manager, 'WETH');
    const quote =  Protocol.getTokenBySymbol(manager, quoteSymbol);
    var makerQuantity = (action == 'BUY') ? createQuantity(base, quantityInWeth) : createQuantity(quote, quantityInQuoteToken);
    var takerQuantity = (action == 'BUY') ? createQuantity(quote, quantityInQuoteToken) : createQuantity(base, quantityInWeth);
    return await Protocol.makeOasisDexOrder(manager, tradingAddress, { makerQuantity, takerQuantity });
  } catch (e) {
    console.log('Could not makeOrderPoC ' + e.message)
  }
}

var takeOrder = async (orderId) => {
  var manager = await getManager()
  var tradingAddress =  (await Protocol.managersToRoutes(
    manager,
    manager.deployment.melonContracts.version,
    manager.wallet.address
    )).trading
  var enhancedOrder = await Protocol.getOasisDexOrder(manager, manager.deployment.exchangeConfigs.MatchingMarket.exchange, { id: orderId });
  return await takeOasisDexOrder(manager, tradingAddress, {
    id: orderId,
    makerQuantity: enhancedOrder.sell,
    takerQuantity: enhancedOrder.buy,
    maker: enhancedOrder.owner,
  })
}

var takeOrderWP = async (_privateKey, orderId) => {
  var manager = await getManagerWP(_privateKey)
  var tradingAddress =  (await Protocol.managersToRoutes(
    manager,
    manager.deployment.melonContracts.version,
    manager.wallet.address
    )).trading
  var enhancedOrder = await Protocol.getOasisDexOrder(manager, manager.deployment.exchangeConfigs.MatchingMarket.exchange, { id: orderId });
  return await takeOasisDexOrder(manager, tradingAddress, {
    id: orderId,
    makerQuantity: enhancedOrder.sell,
    takerQuantity: enhancedOrder.buy,
    maker: enhancedOrder.owner,
  })
}

var cancelOrder = async (id) => {
  try {
    var manager = await getManager();
    var tradingAddress =  (await Protocol.managersToRoutes(
      manager,
      manager.deployment.melonContracts.version,
      manager.wallet.address
      )).trading
    var order = await Protocol.getOasisDexOrder(manager, manager.deployment.exchangeConfigs.MatchingMarket.exchange, { id })
    return await Protocol.cancelOasisDexOrder(manager, tradingAddress, {
      id: order.id,
      maker: manager.wallet.address,
      makerAsset: order.sell.token.address,
      takerAsset: order.buy.token.address,
    });
  } catch (e) {
    console.log('Could not cancelOrder ' + e.message)
  }
}

const setupInvestedFund = async (fundName) => {
  var environment = await getManager();
  var balance = await getBalance(environment.wallet.address);
  if (balance < 1.3) {
    console.warn('Ensure a minimum balance of 1.3 ETH')
    return;
  }
  const weth = Protocol.getTokenBySymbol(environment, 'WETH');
  const investmentAmount = createQuantity(weth, 1);
  //TODO
  var fund = await setupFund(environment, fundName)
  console.log(fund);
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

var setupInvestedFund2 = async(_fundname) => {
  try {
    const fundName = _fundname
    var manager = await getManager();
    const endpoint = 'https://kovan.infura.io/v3/' + process.env.INFURA_KEY;
    var web3 = new Web3(endpoint)
    var balance = await getBalance(manager.wallet.address);
    if (balance < 1.3) {
      console.warn('Ensure a minimum balance of 1.3 ETH')
      return;
    }
    
    var factoryContract = new web3.eth.Contract(fundFactory, manager.deployment.melonContracts.version)
    const DAY_IN_SECONDS = 60 * 60 * 24;

    // create input data
    const { exchangeConfigs, melonContracts } = manager.deployment;
    const weth = Protocol.getTokenBySymbol(manager, 'WETH');
    const mln = Protocol.getTokenBySymbol(manager, 'MLN');
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

    const values = Object.values(fundInput.exchangeConfigs);
    const exchangeAddresses = values.map(e => e.exchange.toString());
    const adapterAddresses = values.map(e => e.adapter.toString());
    const takesCustody = values.map(e => e.takesCustody);

    const defaultTokenAddresses = fundInput.defaultTokens.map(t => t.address);
    const quoteTokenAddress = fundInput.quoteToken.address;
    const feeAddresses = fundInput.fees.map(f => f.feeAddress);
    // TODO: Hacky fix. Could be some problem with BN.js
    const feeRates = fundInput.fees.map(f => `${f.feeRate}`);
    const feePeriods = fundInput.fees.map(f => `${f.feePeriod}`);

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
      to: manager.deployment.melonContracts.version,
      gas: 8000000, 
      value: 0,
      data: inputData[0]
    }

    //sign and send TX
    const signPromise = await web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY)
    const signed = signPromise.rawTransaction
    const sentTx = await web3.eth.sendSignedTransaction(signed)
    //#########################################################################

    inputData[1] = await factoryContract.methods.createAccounting().encodeABI()
    inputData[2] = await factoryContract.methods.createFeeManager().encodeABI()
    inputData[3] = await factoryContract.methods.createParticipation().encodeABI()
    inputData[4] = await factoryContract.methods.createPolicyManager().encodeABI()
    inputData[5] = await factoryContract.methods.createShares().encodeABI()
    inputData[6] = await factoryContract.methods.createTrading().encodeABI()
    inputData[7] = await factoryContract.methods.createVault().encodeABI()
    inputData[8] = await factoryContract.methods.completeSetup().encodeABI()
    for (var i = 1; i <= 8; i++) {
      // create tx
      const tx = {
        from: manager.wallet.address, 
        to: manager.deployment.melonContracts.version,
        gas: 8000000, 
        value: 0.00015 * Math.pow(10, 18),
        data: inputData[i]
      }

      //sign and send TX
      const signPromise = await web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY)
      const signed = signPromise.rawTransaction
      const sentTx = await web3.eth.sendSignedTransaction(signed)
    }
    
    const routes = await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, manager.wallet.address)
    console.log(routes)
    const fundToken = await Protocol.getToken(manager, routes.shares);
    const investmentAmount = await createQuantity(weth, 1);
    await Protocol.deposit(manager, investmentAmount.token.address, undefined, {
      value: investmentAmount.quantity.toString()
    })
    await Protocol.approve(manager, {
        howMuch: investmentAmount,
        spender: routes.participation,
      });
    await Protocol.requestInvestment(manager, routes.participation, {
        investmentAmount,
        requestedShares: await createQuantity(fundToken, 1),
      });

    const exec = await Protocol.executeRequest(manager, routes.participation);
    return routes, exec
  } catch(e) {
    console.log(e)
  }
}

var investInFund = async(_managerAddress) => {
  try {
    const manager = await getManager()
    const weth = Protocol.getTokenBySymbol(manager, 'WETH')
    const routes = await Protocol.managersToRoutes(manager, manager.deployment.melonContracts.version, _managerAddress)
    const fundToken = await Protocol.getToken(manager, routes.shares)
    const investmentAmount = await createQuantity(weth, 1)

    await Protocol.approve(manager, {
        howMuch: investmentAmount,
        spender: routes.participation,
      })

    await Protocol.requestInvestment(manager, routes.participation, {
        investmentAmount,
        requestedShares: await createQuantity(fundToken, 1),
      })

    const exec = await Protocol.executeRequest(manager, routes.participation)
      
    return true
  } catch (e) {
    console.log('investInMSWfund failed: ' + e)
  }
}

module.exports = {
  getEnvironment,
  getManager,
  getManagerOf,
  getRoutesOf,
  getHoldings,
  getHoldingsOf,
  getRate,
  getBalance,
  calculateAUM,
  calculateAUMof,
  calculateAUMwithoutWETH,
  getOrders,
  generateExchangeAggregatorOptions,
  makeOrder,
  takeOrder,
  cancelOrder,
  setupInvestedFund,
  setupInvestedFund2,
  getManagerWP,
  getHoldingsWP,
  makeOrderWP,
  takeOrderWP,
  investInFund
}
