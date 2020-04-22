// Willie Laubenheimer, blockchain@laubenheimer.eu
// Midas Technologies AG

//required functions
const multiManagerModule = './src/multiManager/multiManagerModule'
var addOwnerMSW = require(multiManagerModule).multiSigAddOwner
var confirmMSW = require(multiManagerModule).confirmTx
var executeMSW = require(multiManagerModule).executeTx
var beginSetupMSW = require(multiManagerModule).beginSetupMSW
var completeSetupMSW = require(multiManagerModule).completeSetupMSW
var makeOrderMSW = require(multiManagerModule).makeOrderMSW
var takeOrderMSW = require(multiManagerModule).takeOrderMSW
var cancelOrderMSW = require(multiManagerModule).cancelOrderMSW
var returnAssetToVaultMSW = require(multiManagerModule).returnAssetToVaultMSW

module.exports = {
  addOwnerMSW,
  confirmMSW,
  executeMSW,
  beginSetupMSW,
  completeSetupMSW,
  makeOrderMSW,
  takeOrderMSW,
  cancelOrderMSW,
  returnAssetToVaultMSW
}
