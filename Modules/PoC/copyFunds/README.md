# READMEpoc

To run a test you would need to have two private keys, which both have an invested fund on the kovan-deployment used in the wrapper.

Furthermore it is currently not possible to copy a whole fund with several assets, since the exchanges are freezing accounts for some time after an opened makeOrder on kovan TESTNET. For further information have a look into the documentation.

If you have setup everything well (PRIVATE_KEYsrc needs BAT or ZRX holdings) simply run `node copyFundsPoC.js`.
