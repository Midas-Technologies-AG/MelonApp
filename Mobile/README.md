# Mobile Interface
This is React Native based implementation of a mobile interface for Melon Projects's JavaScript Library.

<img src="https://raw.githubusercontent.com/Midas-Technologies-AG/MelonApp/master/Mobile/docs/main.png" alt="" data-canonical-src="https://gyazo.com/eb5c5741b6a9a16c692170a41a49c858.png" height="520" />

## Installation
 `npm install`
  `npm run patch`*
   `react-native start`
  \
  \
  The next steps are platform specific:
__Android__:  `react-native run-android`
__iOS__: `react-native run-ios`

## Code Structure

The code is derived from standard React Native boilerplate. 
The `assets` folder contains the static content.
`views` and `components` folder contains the dynamic source code. Views are the screens that consume components.

The `views` source is layered to contain different view states. They are:
- A view for setting up a new fund which takes in the name of the fund. Or logging into existing one
- A view for listing all the assets in a fund, called fund/mix view.
- A view for showing the details of a given asset.  
  
These modules are can be easily extended to include more assets.  

Then there are components such as buttons, list view items, titles, etc. that are consumed by views.

The stylings corresponding to each component is inline and may be separated into distinct style sheets for modularity.

Finally, in order to implement various functionalities of Melon Protocol, we made a `wrapper` around existing functions. This wrapper exposes functions to carry out operations that can be clubbed together so that their binding with components become easier.

This wrapper is used to export functions viz. `getHoldings`, `makeOrder`, `takeOrder`, and so on.  
This, too, is extensible and modular. It works independent of the components mentioned above.

## Architecture

![Operations](https://github.com/Midas-Technologies-AG/MelonApp/raw/master/Mobile/docs/architecture.jpg)
-
The dependencies for this project can be found in `package.json`.  But there are some key dependencies from [melonproject](https://github.com/melonproject):
- `"@melonproject/exchange-aggregator"` 
- `"@melonproject/protocol"` 
- `"@melonproject/token-math"`

---
For calculating AUM -- the `getRate` method of `ConversionRates` contract from Kyber is used.

---

For the purposes of caching data about the fund, this project is using `AsyncStorage` as provided by the browser. One may choose to override `getFundData` and storage of JSON at `componentDidMount` of root `App.js` for improved security. Or one may even chose to eliminate this altogether, however this will increase the load time and the number of eth calls.

---
By default, the exchange used for the purposes of listing orders, making order, taking order and cancelling order, is [OasisDEx](https://github.com/OasisDEX).
One may choose to implement a different exchange or more than one exchange. In order to do so, one may: 
1. add the name of the exchange (as per `exchange-aggregator`) in the array called `EXCHANGES`

2. Use the corresponding function the [melon wrapper](https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Le_Melon.jpg/440px-Le_Melon.jpg) for `makeOrder`, `takeOrder` and `cancelOrder`.
---
Implementation of pre-existing `withPrivateKeySigner` is used to get a given fund based on the private-key provided. If logged in with a mnemonic, the corresponding private-key is generated using `react-native-truffle-hdwallet-provider`.


## How to Contribute

In order to add a new module, follow these steps:
1. Write the functionality, as per need, in the wrapper and export it for usage in component
2. Add a new view for the module. Use JSX to write the component and manage its state. Call the function from the wrapper here.
3. Make use of/add new components that are reusable.
4. (Optional) You may make use of existing `helper` functions or add your own.  

You may then continue by __requesting a pull__ on this repo or use a __fork__ of this.  

If you find something incompatible or something isn't working as it should be, __please open an issue__ with detailed explaination, build log and maybe a screenshot.


## Future development

 - [ ] Separate out the functionalities from melon wrapper to independent files
 - [ ] Refresh balance upon making/taking/cancelling order
 - [ ] Refresh AUM upon making/taking/cancelling order
 - [ ] Implement `returnAssetToVault` to return assets from trading contract to vault contract
 - [ ] Implement comparative orderbook graph ranging from lowest volume offer to highest volume offer.
