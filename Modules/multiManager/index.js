const tokenABI = require('./src/wrapper/erc20Contract.abi.js')
const multiManagerModule = './src/multiManager/multiManagerModule'

var addOwnerMSW = require(multiManagerModule).multiSigAddOwner
var confirmMSW = require(multiManagerModule).confirmTx
var executeMSW = require(multiManagerModule).executeTx
var beginSetupMSW = require(multiManagerModule).beginSetupMSW
var completeSetupMSW = require(multiManagerModule).completeSetupMSW
var makeOrderMSW = require(multiManagerModule).makeOrderMSW
var takeOrderMSW = require(multiManagerModule).takeOrderMSW
var cancelOrderMSW = require(multiManagerModule).cancelOrderMSW

module.exports = {
  addOwnerMSW
  confirmMSW
  executeMSW
  beginSetupMSW
  completeSetupMSW
  makeOrderMSW
  takeOrderMSW
  cancelOrderMSW
}
