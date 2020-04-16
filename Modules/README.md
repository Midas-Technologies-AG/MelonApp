# README

This Repository contains the modules `copyFunds` and `multiManager` for the `@melonproject/protocol` proposing a Proof of Concept for both modules.

## installation

To install the dependencies run `npm install` or `yarn install`.

If you come through go to one of the modules and checkout, what you need to do to be able to test, or open up an issue in this repository or visit the A$H team telegram channel via https://ash.finance

### known errorhandling

To fix `...Error: Cannot find module './build/Release/scrypt'...` change `node_modules/scrypt/index.js` in line 3 `'./build/Release/scrypt'` to `'scrypt'`.

`...Error: Cannot find module '../out/Accounting.abi.json'...` can be fixed by copying `node_modules/@melonproject/protocol/out/` to `node_modules/@melonproject/exchange-aggregator/node_modules/@melonproject/protocol/`. This is maybe an error from the dependency exchange-aggregator.
