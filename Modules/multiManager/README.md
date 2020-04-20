# multiManager Module

This module uses MultiSignatureWallet from https://wallet.gnosis.pm/

index.js should be fine but not reviewed nor bigger testing scale.


## available fucntions

  addOwnerMSW,
  confirmMSW,
  executeMSW,
  beginSetupMSW,
  completeSetupMSW,
  makeOrderMSW,
  takeOrderMSW,
  cancelOrderMSW,
  returnAssetToVaultMSW
  
Check the inputs at `multiManager/MMmodule/multiManagerModule.js`.

Checkout `runPoC.js` or run `node runPoC` for testing if everything is set up well.

## environment settings

To be able to test this module you need to create a file like the following in `Modules/.env.js` set with yours:

```
var INFURA_KEY='...'
var PRIVATE_KEYsrc='0x...'
var mswAddress='0x...'

module.exports = {
	INFURA_KEY,
	PRIVATE_KEYsrc,
	mswAddress
}
```

`PRIVATE_KEYsrc` needs to be one owner of the multiSig Wallet and needs to have an invested testfund so it can take the orders created by multiManager.
 
