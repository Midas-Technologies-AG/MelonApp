# copyFunds module

You will find a Proof of Concept in documentation.

To run a test you would need to have two private keys, which both have an invested fund on the kovan-deployment (https://github.com/melonproject/protocol/blob/v1.0.0-patched-1/deployments/kovan-kyberPrice.json) used in the wrapper.

Furthermore it is currently not possible to copy a whole fund with several assets, since the exchanges are freezing accounts for some time after an opened makeOrder on kovan TESTNET. For further information have a look into the documentation.

If you have setup everything well (PRIVATE_KEYsrc needs BAT or ZRX holdings) simply run `node copyFundsPoC.js`.

## environment settings

One manager (`srcManager`) copies a fund. The fund we want to copy doesn't need to be managed by an Address we have the private keys for. It could be also a multisignaturwallet or in general more likely, a fund we dont even hold.
Here we copy the fund of `destManager`.

To be able to test this module you need to create a file like the following in `Modules/.env.js` set with yours:

```
var INFURA_KEY='...'
var PRIVATE_KEYsrc='0x...'
var PRIVATE_KEYdest='0x...'
var mswAddress='0x...'

module.exports = {
	INFURA_KEY,
	PRIVATE_KEYsrc,
	PRIVATE_KEYdest,
	mswAddress
}
```

## possibile ToDo's

- research/implement/test copyFundsFunction with timer for exchange freeze after makeOrder

