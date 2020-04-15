var mlnWrapper = '../wrapper/melonWrapper'
var getManager = require(mlnWrapper).getManager
var getRoutesOf = require(mlnWrapper).getRoutesOf
var getFundOpenOrder = require('@melonproject/protocol').getFundOpenOrder


//########################
const test = async () => {
	try {
		const manager = await getManager()
		var routes = await getRoutesOf(manager.wallet.address)
		console.log(await getFundOpenOrder(manager, routes.trading, 30))
	}catch(e) {
		console.log(e)
	}
}
test()
//########################
//srcFundManager: 0x88D855BdF87b93B956154714109d9a5A22A6AD9B
//destFundManager: 0xB9820Ab5aB6256003124cecE3aFE8140F7e55E15

/*	    var holdings = await getHoldings(process.env.PRIVATE_KEYdest)
	    for (var hold in holdings) {
	    	if (holdings[hold].token.symbol == 'BAT') {
	    		var rate = await getRate(holdings[hold])
	    		  = 10 * rate
	    		var order = await makeOrder(
	    			process.env.PRIVATE_KEYsrc,
	    			holdings[hold].token.symbol,
	    			valueWETH,
	    			10,
	    			'SELL'
	    		)
	    		console.log(order)
	    		await getRate(holdings[hold]) //Wait a lil amount of time :)
	    		console.log(await takeOrder(
	    			process.env.PRIVATE_KEYdest,
	    			order.id)
	    		)
	    	}
	    }
*/
