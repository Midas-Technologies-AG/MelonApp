# README

This Repository contains the modules `copyFunds` and `multiManager` for the `@melonproject/protocol` proposing a Proof of Concept for both modules.

The `copyFund` modules aims to enable fundmanagers to buy all assets of a given fund with a given amount of `WETH` (wrapped Ether) proportional to the compisition of the copied fund.

The `multiManager` module enables fundmanagement for multiple accounts as fund-manager.

## installation

To install the dependencies run `npm install` or `yarn install`.

If you come through go to one of the modules and checkout, what you need to do to be able to test, or open up an issue in this repository or visit the A$H team telegram channel via https://ash.finance


### known errorhandling

To fix `...Error: Cannot find module './build/Release/scrypt'...` change `node_modules/scrypt/index.js` in line 3 `'./build/Release/scrypt'` to `'scrypt'`.

`...Error: Cannot find module '../out/Accounting.abi.json'...` can be fixed by copying `node_modules/@melonproject/protocol/out/` to `node_modules/@melonproject/exchange-aggregator/node_modules/@melonproject/protocol/`. This is an error from the dependency exchange-aggregator.


## possible ToDo's

The following tasks have their approximated project-size in the brackets at the end.

### general

- define functions for `Modules/index.js` (medium)
- define and implement tests in `test.js` (medium)


### copyFunds

- research/implement/test copyFundsFunction with timer for exchange freeze after makeOrder (big)


### multiManager

- implement function to create gnosis MSW (multisignaturewallet) (small)

### wrapper

- remove environmental variables from script and implement env var as inputs (small)

