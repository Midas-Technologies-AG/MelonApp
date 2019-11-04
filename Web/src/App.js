import React from 'react';
import './styles/main.css'
import './styles/header.css'
import PropTypes from 'prop-types';
import { getAllAssets, getName, getHubs, getRoutes, getHoldings, getInfo, getOrders } from './wrapper/melon'
import Web3 from 'web3';

var getImageUrl = (symbol) => {
  if (symbol == 'DGX') symbol = 'DGD';
  if (symbol == 'WETH') symbol = 'ETH';
  return 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/svg/black/' + symbol.toLowerCase() + '.svg?sanitize=true'
};

class App extends React.Component {

  constructor(props, context) {
    super(props)
    this.state = { assets: new Array(), selectedIndex: null, sharePrice: 0, addOrders: [], removeOrders: [], name: 'Loading' }
    // const web3Context = context.web3;
    // console.warn(web3Context);
  }

  async componentDidMount() {
    try {
      var hubAddress = await getHubs()
      console.warn(hubAddress);
      var routes = await getRoutes()
      console.warn(routes);
      localStorage.setItem('fund', JSON.stringify(Object.assign({}, routes, { hubAddress })))
      var holdings = await getHoldings();
      var name = await getName();
      holdings = holdings.reduce((assets, asset) => {
        asset.quantity = (asset.quantity / Math.pow(10, asset.token.decimals)).toFixed(2)
        assets[asset.token.address] = asset;
        return assets;
      }, {})
      var assets = await getAllAssets();
      // var assets = [{ "token": { "address": "0xB14c0f4a8150c028806bE46Afb5214daea870CB7", "name": "Basic Attention Token", "symbol": "BAT", "decimals": 18 } }, { "token": { "address": "0x16886a2B35BF40C59087500dEC9Bbc24765382C2", "name": "Digix Gold Token", "symbol": "DGX", "decimals": 9 } }, { "token": { "address": "0xa80C98433E2a82DF3636ED934083E3285163Fad8", "name": "Rep Token", "symbol": "REP", "decimals": 18 } }, { "token": { "address": "0x0A3610a0E87cEDDEE6b81b62b462c7a0fD450E2a", "name": "ZeroX Protocol Token", "symbol": "ZRX", "decimals": 18 } }, { "token": { "address": "0xd0a1e359811322d97991e03f863a0c30c2cf029c", "name": "Eth Token", "symbol": "WETH", "decimals": 18 } }, { "token": { "address": "0x2C2edf394638931eb672BD9261d2AA1934874d45", "name": "Melon Token", "symbol": "MLN", "decimals": 18 } }, { "token": { "address": "0xbdaD7a926A7E70C6B0AF367d97D992b904BBAFcf", "name": "MakerDao", "symbol": "MKR", "decimals": 18 } }, { "token": { "address": "0x1D3bC44DD6C3F00640A6825B48F1C78770fd21d8", "name": "Dai", "symbol": "DAI", "decimals": 18 } }, { "token": { "address": "0xB5098BAFbF90F278374EcFA973A703fD0eb87A12", "name": "Kyber Network", "symbol": "KNC", "decimals": 18 } }]
      assets = assets.map(asset => {
        if (holdings[asset.token.address]) return Object.assign({}, holdings[asset.token.address], asset);
        else return asset
      })
      console.warn(assets);
      var sharePrice = (await getInfo()).toFixed(4);
      this.setState((prevState, props) => Object.assign({}, prevState, { assets, sharePrice, name }))
    } catch (e) {
      alert('Please ensure you have Metamask logged in with Kovan testnet');
    }
  }

  render() {
    var selectedAsset = this.state.assets[this.state.selectedIndex]
    // var web3 = new Web3(window.web3.currentProvider);
    // var x = web3.eth.getAccounts((e, d) => {
    //   console.warn(e);
    //   console.warn(d);
    // })
    // console.warn(Object.keys(x));
    return (
      <div>
        <header>
          <span className="fund-name">{this.state.name}</span>
          <span className="share-price"><b>{this.state.sharePrice ? 'SHARE PRICE' : ''}</b> {this.state.sharePrice || '...'}</span>
        </header>
        <main>
          <div className="fund-view">
            {this.state.assets.map((asset, i) => (<div className={i == this.state.selectedIndex ? "asset selected" : "asset"} onClick={_ => this.selectAsset(i)}>
              <img src={getImageUrl(asset.token.symbol)} height="40" width="40" />
              <span className="title">{asset.token.symbol}</span>
              <br />
              <div className="subtitle">{asset.token.name}</div>
              <div className="balance">{asset.quantity || 0}</div>
            </div>))}
          </div>
          {(!selectedAsset) ? null : <div className="asset-view">
            <h1>{selectedAsset.token.name}</h1>
            <h3>BALANCE <span style={{ fontWeight: '100' }}>{selectedAsset.quantity || 0}</span></h3>
            <div className="input-container">
              {this.renderInput('WETH')}
              {this.renderInput(selectedAsset.token.symbol)}
            </div>
            {this.renderBuySellButton()}
            <h2>ORDERBOOK</h2>
            <div className="orders">
              {this.state.addOrders.map(order => this.renderOrder('add', order))}
              {this.state.removeOrders.map(order => this.renderOrder('remove', order))}
            </div>
          </div>}
        </main>
      </div>
    );
  }

  async selectAsset(selectedIndex) {
    this.setState((prevState, props) => Object.assign({}, prevState, { selectedIndex, addOrders: [], removeOrders: [] }))
    var symbol = this.state.assets[selectedIndex].token.symbol;
    var addOrders = await getOrders('WETH', symbol, 'add')
    var removeOrders = await getOrders(symbol, 'WETH', 'remove')
    this.setState((prevState, props) => Object.assign({}, prevState, { addOrders, removeOrders }))
  }

  renderInput(asset) {
    return <input type="number" placeholder={asset} className="input-value" />
  }
  renderBuySellButton() {
    return <div style={{ display: 'flex', justifyContent: 'center' }}>
      {this.renderButton('SELL')}
      {this.renderButton('BUY')}
    </div>
  }
  renderButton(text) {
    return <button style={{ backgroundColor: text == 'SELL' ? 'white' : 'black', color: text == 'SELL' ? 'black' : 'white' }}>{text}</button>
  }
  renderOrder(type, order) {
    return <div className={"order " + type}>
      <img src={'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/svg/' + (type == 'add' ? 'plus' : 'minus') + '.svg?sanitize=true'} style={{ backgroundColor: type == 'add' ? 'green' : '#e00000' }} />
      {(type == 'add') ? <span>{(order.trade.quote.quantity / Math.pow(10, order.trade.quote.token.decimals)).toFixed(4) + ' ' + order.trade.quote.token.symbol} for {(order.trade.base.quantity / Math.pow(10, 18)).toFixed(4)} Ξ total</span> : <span>{(order.trade.base.quantity / Math.pow(10, order.trade.base.token.decimals)).toFixed(4) + ' ' + order.trade.base.token.symbol} for {(order.trade.quote.quantity / Math.pow(10, order.trade.quote.token.decimals)).toFixed(4)} Ξ total</span>}
    </div>
  }
}

// App.contextTypes = {
//   web3: PropTypes.object
// };

export default App;
