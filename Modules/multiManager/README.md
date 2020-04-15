# README
## environment settings
One manager (`srcManager`) copies a fund. The fund we want to copy doesn't need to be managed by an Address we have the private keys for. It could be also a multisignaturwallet or in general more likely, a fund we dont even hold.
Here we copy the fund of `destManager`



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

## Available fucntions
makeOrderMSW
takeOrderMSW
cancelOrderMSW
...

Checkout `runPoC.js` or run `node runPoC`
