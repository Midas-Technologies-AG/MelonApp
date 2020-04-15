const dotenv = require('dotenv');
dotenv.config();

var mlnWrapper = './src/wrapper/melonWrapper'
var getManager = require(mlnWrapper).getManager
var makeOrder = require(mlnWrapper).makeOrder
var takeOrder = require(mlnWrapper).takeOrder
var cancelOrder = require(mlnWrapper).cancelOrder
var getRate = require(mlnWrapper).getRate
var getHoldings = require(mlnWrapper).getHoldings


//########################
const test = async () => {
	try {
	    var holdings = await getHoldings(process.env.PRIVATE_KEYdest)
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
	}catch(e) {
		console.log(e)
	}
}
test()
//########################
//srcFundManager: 0x88D855BdF87b93B956154714109d9a5A22A6AD9B
//destFundManager: 0xB9820Ab5aB6256003124cecE3aFE8140F7e55E15