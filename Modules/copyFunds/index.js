// Willie Laubenheimer, blockchain@laubenheimer.eu
// Midas Technologies AG

//required functions
var CFmodule = './CFmodule/copyFundModule'
var copyFund = require(CFmodule).copyFund
var sellCopiedFund = require(CFmodule).sellCopiedFund
var logFund = require(CFmodule).logFund
var getLoggedFund = require(CFmodule).getLoggedFund
var unlogFund = require(CFmodule).unlogFund
//var removeOpenMake = require(CFmodule).removeOpenMake

module.exports = {
  copyFund,
  sellCopiedFund,
  logFund,
  getLoggedFund,
  unlogFund,
  //removeOpenMake
}
