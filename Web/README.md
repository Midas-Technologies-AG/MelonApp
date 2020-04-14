
# Web Interface
This is React.js based implementation of a web interface for Melon Projects's JavaScript Library.

![Screenshot](https://github.com/Midas-Technologies-AG/MelonApp/raw/master/Web/docs/screenshot.png)

## Installation

### Mobile
- `npm install`
- `npm run start`

### Web
- `npm install`
- create a `env.js` file in `.src/Web/`
- `npm run start`

The `env.js` should look like this:
```
var INFURA_KEY='<your-api-key>'

module.exports.INFURA_KEY = INFURA_KEY
```

## Code Structure

The code is derived from standard React.js boilerplate. The `public` folder contains the static content while the `src` folder contains the dynamic source code.    

Within the source code, there is Javascript code and Cascading Style Sheets code.    

The `components` are layered to contain different view states. The are:
- A view for setting up a new fund which takes in the name of the fund.
- A view for listing all the assets in a fund, called fund view.
- A view for showing the details of a give asset.  
  
These modules are can be easily extended to include more assets.  

We also have a `header` to contain the fund-specific information such as its name, the share price and AUM.  

The stylings corresponding to each component can be found in `styles` folder in source. They are named in accordance the component that they support and imported as such.  

Finally, in order to implement various functionalities of Melon Protocol, we made a `wrapper` around existing functions. This wrapper exposes functions to carry out operations that can be clubbed together so that their binding with components become easier.

This wrapper is used to export functions viz. `getHoldings`, `makeOrder`, `takeOrder`, and so on.  
This, too, is extensible and modular. It works independent of the components mentioned above.

## Design System

### Global
The font family (in order of preference) used are: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`

Color Scheme: A few shades of Grey, Black and White. Its easy to modify theme by using the context hook for React.js

The entire content is framed in a flexbox layout with a margin and box-shadow. 

__Loading__
For _(almost)_ all the loadings, a div with class name `loading` pops up.
![Loading](https://github.com/Midas-Technologies-AG/MelonApp/raw/master/Web/docs/loading.png)
```
.loading {
	height: calc(100vh - 80px);
	overflow-y: hidden;
	border-bottom: 1px  solid  lightgrey;
	color: grey;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}
```

The design for this project is divided in 3 regions:
1. __Header__ - Name, share price and AUM
2. __Fund View__ - Fund-wide holdings and balances
3. __Asset View__ - Asset specific data and actions


![Operations](https://github.com/Midas-Technologies-AG/MelonApp/raw/master/Web/docs/overlay.jpg)

The styling provided in the `styles` folder is modular. 
However these can be further separated into clearer sheets.

__Header__

Display fundamental information like fund name, share price and assets under management. 
Should be fixed in position, always visible and independent from other components.

![Header](https://github.com/Midas-Technologies-AG/MelonApp/blob/master/Web/docs/header.png?raw=true)


```
header {
	display: flex;
	margin: 16px;
	justify-content: space-between;
}
```

__Asset List (Fund View)__

Display all available assets in the deployment in decreasing order of balance.
Should be fixed in position, always visible and independent from other components.
Highlights selected asset.

![asset list](https://github.com/Midas-Technologies-AG/MelonApp/blob/master/Web/docs/asset%20list.png?raw=true)

Contains of building blocks with two possible states ie. _selected_ and _not selected_.
```
.asset {
  height: 90px;
  width: 200px;
  border: 1px solid lightgrey;
  border-bottom: none;
  padding: 16px;
}
.asset.selected {
  color: black;
  background-color: rgb(240, 240, 240);
}
```

It contains: `title`, `subtitle` and `balance`

__Asset View__

Displays actions and information that user may want to do to a specific asset.
  
The first part is the name and the balance.

Then, there is the form to create a new order in the exchange for the selected asset with _WETH_ in OasisDex.

![make order](https://github.com/Midas-Technologies-AG/MelonApp/blob/master/Web/docs/make%20order.png?raw=true)

There are two input fields. They use explicit placeholder messages to indicate intended use.
```
.input-value {
	height: 45px;
	width: calc(50% - 40px);
	font-size: 21px;
	background: none;
	border: none;
	border-bottom: 1px  dashed  darkgray;
}
```

Buttons & Toggles are used to opt one of _SELL_ or _BUY_ option.
Using black elements for execution of action. 
To keep in line with the button color doctrine use black for active state, white to indicate inactive state.
```
button {
	background: white;
	border-radius: 0;
	box-shadow: none;
	outline: none;
	border: 1px  solid  black;
	padding: 16px;
	width: calc(20% - 40px);
	font-size: 18px;
	font-weight: bolder;
	cursor: pointer;
	min-width: 100px;
}
.toggle {
	height: 50px;
	width: 120px;
	border-radius: 10px;
	border-color: black;
	border-width: 1px;
	border-style: solid;
	background-color: white;
	cursor: pointer;
}
```

Then on, orderbook is used to list orders that already exist on the exchange. One can just click on them to take given order.

![take order](https://github.com/Midas-Technologies-AG/MelonApp/blob/master/Web/docs/orderbook.png?raw=true)

In the list of buy/sell orders, use traditional green and red differentiation with corresponding plus and minus icons.

Further reading on the design system: docs/Ash-Open-interface-design-system.pdf

## Architecture

![Operations](https://github.com/Midas-Technologies-AG/MelonApp/raw/master/Web/docs/architecture.jpg)
-
The dependencies for this project can be found in `package.json`.  But there are some key dependencies from [melonproject](https://github.com/melonproject):
- `"@melonproject/exchange-aggregator"` 
- `"@melonproject/protocol"` 
- `"@melonproject/token-math"`

---
For calculating AUM -- the `getRate` method of `ConversionRates` contract from Kyber is used.

---

For the purposes of caching data about the fund, this project is using `window.localStorage` as provided by the browser. One may choose to override `getFundData` and storage of JSON at `componentDidMount` of root `App.js` for improved security. Or one may even chose to eliminate this altogether, however this will increase the load time and the number of eth calls.

---
By default, the exchange used for the purposes of listing orders, making order, taking order and cancelling order, is [OasisDEx](https://github.com/OasisDEX).
One may choose to implement a different exchange or more than one exchange. In order to do so, one may: 
1. add the name of the exchange (as per `exchange-aggregator`) in the array called `EXCHANGES`

2. Use the corresponding function the [melon wrapper](https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Le_Melon.jpg/440px-Le_Melon.jpg) for `makeOrder`, `takeOrder` and `cancelOrder`.
---
In the `wrapper` folder, there is another implementation of pre-existing `withPrivateKeySigner`. This is done in order to allow the transaction signing process work in accordance to MetaMask on Kovan Infura chain.
Hence this modified function re-implements the core functions of `Wallet` interface.
- `signTransaction` simply returns the transactions as it is, so that a raw version is sent when it is detected to not be signed by the melon protocol.
- `signMessage` uses the signing method provided by `web3.eth`
- `sendTransaction` is linked to the web3 as given by current provider. This opens up the MetaMask for signing whenever a transaction is to be sent.

## How to Contribute

In order to add a new module, follow these steps:
1. Write the functionality, as per need, in the wrapper and export it for usage in component
2. Add a new view for the module. Use JSX to write the component and manage its state. Call the function from the wrapper here.
3. Store the corresponding CSS in the styles folder and import in the aforementioned component.
4. (Optional) You may make use of existing `helper` functions or add your own.  

You may then continue by __requesting a pull__ on this repo or use a __fork__ of this.  

If you find something incompatible or something isn't working as it should be, __please open an issue__ with detailed explaination, build log and maybe a screenshot.


## Future development

 - [ ] Separate out the functionalities from melon wrapper to independent files
 - [ ] Refresh balance upon making/taking/cancelling order
 - [ ] Refresh AUM upon making/taking/cancelling order
 - [ ] Implement `returnAssetToVault` to return assets from trading contract to vault contract
 - [ ] Implement comparative orderbook graph ranging from lowest volume offer to highest volume offer.
