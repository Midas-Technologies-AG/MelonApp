import React from 'react';
import './styles/main.css'
import './styles/header.css'
import { getAllAssets, getName, getHubs, getRoutes, getHoldings, getInfo, getOrders, takeOrder, makeOrder } from './wrapper/melon'
import Header from './components/header';
import Fund from './components/fundView';
import AssetView from './components/assetView';

class App extends React.Component {

  constructor(props, context) {
    super(props)
    this.state = { assets: new Array(), selectedIndex: null, isLoading: true, hasValidFund: false }
  }

  async componentDidMount() {
    if (!window.ethereum) {
      alert('Please ensure you have Metamask');
      return;
    }
    try {
      var hubAddress = await getHubs()
      if (!hubAddress) {
        alert('Please ensure you have a fund setup with Kovan testnet');
        return;
      }
      var routes = await getRoutes()
      localStorage.setItem('fund', JSON.stringify(Object.assign({}, routes, { hubAddress })))
      this.setState((prevState, props) => Object.assign({}, prevState, { isLoading: false, hasValidFund: true }))
    } catch (e) {
      alert('Please ensure you have Metamask logged in with Kovan testnet with a fund setup');
    }
  }

  render() {
    var selectedAsset = this.state.selectedAsset
    console.warn(this.state.hasValidFund);

    if (!this.state.hasValidFund) return <div></div>
    return (
      <div>
        <Header />
        <main style={{ display: this.state.isLoading ? 'flex' : 'none' }}>
          <div className="loading">
            <img src="https://icon-library.net/images/loading-icon-animated-gif/loading-icon-animated-gif-1.jpg" height="33" />
            <h1>Loading</h1>
          </div>
        </main>
        <main style={{ display: !this.state.isLoading ? 'flex' : 'none' }}>
          <Fund selectAsset={this.selectAsset.bind(this)} />
          {(!selectedAsset) ? null : <AssetView selectedAsset={this.state.selectedAsset} toggleLoading={this.toggleLoading.bind(this)} />}
        </main>
      </div>
    );
  }

  async selectAsset(selectedAsset) {
    this.setState((prevState, props) => Object.assign({}, prevState, { selectedAsset }))
  }


  async toggleLoading(isLoading) {
    this.setState((prevState, props) => Object.assign({}, prevState, { isLoading }))
  }
}
export default App;
