import React from 'react';
import './styles/main.css'
import './styles/header.css'
import PropTypes from 'prop-types';
import { getAllAssets, getEnvironment } from './wrapper/melon'

var getImageUrl = (symbol) => {
  if (symbol == 'DGX') symbol = 'DGD';
  if (symbol == 'WETH') symbol = 'ETH';
  return 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/svg/black/' + symbol.toLowerCase() + '.svg?sanitize=true'
};

class App extends React.Component {

  constructor(props, context) {
    super(props)
    this.state = { assets: new Array(), selectedIndex: 0 }
    const web3Context = context.web3;
    console.warn(web3Context);
  }

  async componentDidMount() {
    // var assets = await getAllAssets();
    var env = await getEnvironment();
    console.warn(env);
    
    var assets = [{ "token": { "address": "0xB14c0f4a8150c028806bE46Afb5214daea870CB7", "name": "Basic Attention Token", "symbol": "BAT", "decimals": 18 } }, { "token": { "address": "0x16886a2B35BF40C59087500dEC9Bbc24765382C2", "name": "Digix Gold Token", "symbol": "DGX", "decimals": 9 } }, { "token": { "address": "0xa80C98433E2a82DF3636ED934083E3285163Fad8", "name": "Rep Token", "symbol": "REP", "decimals": 18 } }, { "token": { "address": "0x0A3610a0E87cEDDEE6b81b62b462c7a0fD450E2a", "name": "ZeroX Protocol Token", "symbol": "ZRX", "decimals": 18 } }, { "token": { "address": "0xd0a1e359811322d97991e03f863a0c30c2cf029c", "name": "Eth Token", "symbol": "WETH", "decimals": 18 } }, { "token": { "address": "0x2C2edf394638931eb672BD9261d2AA1934874d45", "name": "Melon Token", "symbol": "MLN", "decimals": 18 } }, { "token": { "address": "0xbdaD7a926A7E70C6B0AF367d97D992b904BBAFcf", "name": "MakerDao", "symbol": "MKR", "decimals": 18 } }, { "token": { "address": "0x1D3bC44DD6C3F00640A6825B48F1C78770fd21d8", "name": "Dai", "symbol": "DAI", "decimals": 18 } }, { "token": { "address": "0xB5098BAFbF90F278374EcFA973A703fD0eb87A12", "name": "Kyber Network", "symbol": "KNC", "decimals": 18 } }]
    this.setState((prevState, props) => Object.assign({}, prevState, { assets }))
  }

  render() {
    var selectedAsset = this.state.assets[this.state.selectedIndex]
    console.warn(window.web3);
    return (
      <div>
        <header>
          <span className="fund-name">KUNIMIX</span>
          <span className="share-price"><b>SHARE PRICE</b> 0.91123</span>
        </header>
        <main>
          <div className="fund-view">
            {this.state.assets.map((asset, i) => (<div className={i == this.state.selectedIndex ? "asset selected" : "asset"} onClick={_ => this.selectAsset(i)}>
              <img src={getImageUrl(asset.token.symbol)} height="40" width="40" />
              <span className="title">{asset.token.symbol}</span>
              <br />
              <div className="subtitle">{asset.token.name}</div>
              <div className="balance">123.34</div>
            </div>))}
          </div>
          {(!selectedAsset) ? null : <div className="asset-view">
            <h1>{selectedAsset.token.name}</h1>
            <h3>BALANCE <span style={{ fontWeight: '100' }}>{123.339893423}</span></h3>
            <div className="input-container">
              {this.renderInput('WETH')}
              {this.renderInput(selectedAsset.token.symbol)}
            </div>
            {this.renderBuySellButton()}
            <h2>ORDERBOOK</h2>
            <div className="orders">
              {this.renderOrder('add')}
              {this.renderOrder('remove')}
            </div>
          </div>}
        </main>
      </div>
    );
  }

  selectAsset(selectedIndex) {
    this.setState((prevState, props) => Object.assign({}, prevState, { selectedIndex }))
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
  renderOrder(type) {
    return <div className={"order " + type}>
      <img src={'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/svg/' + (type == 'add' ? 'plus' : 'minus') + '.svg?sanitize=true'} style={{ backgroundColor: type == 'add' ? 'green' : '#e00000' }} />
      <span>12.4323 MLN for 90.87432 Ξ total</span>
    </div>
  }
}

App.contextTypes = {
  web3: PropTypes.object
};

export default App;
