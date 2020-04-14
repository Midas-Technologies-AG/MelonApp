# README

This Repository contains the modules `copyFunds` and `multiManager` for the `@melonproject/protocol`.

For the specific module specification checkout the `README.md` in `.PoC/copyFunds` or `.PoC/multiManager`.

Current status of both modules is Proof of Concept, described in `.PoC/*/README.md`.

## installation

To install this repo run `npm i`. 

### known errorhandling

To fix `...Error: Cannot find module './build/Release/scrypt'...` change `node_modules/scrypt/index.js` in line 3 `'./build/Release/scrypt'` to `'scrypt'`.

`...Error: Cannot find module '../out/Accounting.abi.json'...` can be fixed by copying `node_modules/@melonproject/protocol/out/` to `node_modules/@melonproject/exchange-aggregator/node_modules/@melonproject/protocol/`. This is an error from the dependency exchange-aggregator.


