import React from 'react';
import './styles/main.css'
import './styles/header.css'
import { getAllAssets, getName, getHubs, getRoutes, getHoldings, getInfo, getOrders, takeOrder, makeOrder } from './wrapper/melon'
import Header from './components/header';
import Fund from './components/fundView';
import AssetView from './components/assetView';
import SetupFund from './components/setupFund';
import "react-toggle/style.css"

class App extends React.Component {

  constructor(props, context) {
    super(props)
    this.state = { assets: new Array(), selectedIndex: null, isLoading: true, hasValidFund: false, error: true, aum: 0 }
  }

  async componentDidMount() {

    if (!window.ethereum) {
      alert('Please ensure you have Metamask');
      return;
    }
    try {
      var hubAddress = await getHubs()
      if (!hubAddress) {
        localStorage.clear();
        this.setState((prevState, props) => Object.assign({}, prevState, { isLoading: false, hasValidFund: false, error: false }))
        return;
      }
      var routes = await getRoutes()
      localStorage.setItem('fund', JSON.stringify(Object.assign({}, routes, { hubAddress })))
      this.setState((prevState, props) => Object.assign({}, prevState, { isLoading: false, hasValidFund: true, error: false }))
    } catch (e) {
      alert('Please ensure you have Metamask logged in with Kovan testnet with a fund setup');
    }
  }

  render() {
    var selectedAsset = this.state.selectedAsset
    if (this.state.error) return <div></div>
    return (
      <div>
        {this.state.hasValidFund ? <Header aum={this.state.aum} /> : null}
        <main style={{ display: this.state.isLoading ? 'flex' : 'none' }}>
          <div className="loading">
            <img src="https://icon-library.net/images/loading-icon-animated-gif/loading-icon-animated-gif-1.jpg" height="33" />
            <h1>Loading</h1>
          </div>
        </main>

        {this.state.hasValidFund ? <main style={{ display: !this.state.isLoading ? 'flex' : 'none' }}>
          <Fund selectAsset={this.selectAsset.bind(this)} setAum={this.setAum.bind(this)} />
          {(!selectedAsset) ? null : <AssetView selectedAsset={this.state.selectedAsset} toggleLoading={this.toggleLoading.bind(this)} />}
        </main> : <main style={{ display: !this.state.isLoading ? 'flex' : 'none' }}>
            <SetupFund toggleLoading={this.toggleLoading.bind(this)} />
          </main>}
      </div>
    );
  }

  async selectAsset(selectedAsset) {
    this.setState((prevState, props) => Object.assign({}, prevState, { selectedAsset }))
  }

  async setAum(aum) {
    this.setState((prevState, props) => Object.assign({}, prevState, { aum }))
  }

  async toggleLoading(isLoading) {
    this.setState((prevState, props) => Object.assign({}, prevState, { isLoading }))
  }
}
export default App;
