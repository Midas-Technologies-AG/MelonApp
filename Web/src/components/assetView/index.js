import React from 'react';
import renderInput from './input';
import renderButtons from './buttons';
import { makeOrder, getOrders } from '../../wrapper/melon';
import Order from './order';

class AssetView extends React.Component {
  state = { addOrders: [], removeOrders: [], isLoading: true }

  async updateOrders() {
    try {
      document.getElementById('value-WETH').value = ''
      document.getElementById('value-' + this.props.selectedAsset.token.symbol).value = ''
      this.setState((prevState, props) => Object.assign({}, prevState, { addOrders: [], removeOrders: [] }))
      var symbol = this.props.selectedAsset.token.symbol
      var addOrders = await getOrders('WETH', symbol, 'add')
      var removeOrders = await getOrders(symbol, 'WETH', 'remove')
      console.warn(removeOrders);
      
      this.setState((prevState, props) => Object.assign({}, prevState, { addOrders, removeOrders, isLoading: false }))
    }
    catch (e) {
      console.error(e.message)
    }
  }

  componentDidMount() {
    this.updateOrders()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.selectedAsset.token.symbol != this.props.selectedAsset.token.symbol) {
      this.updateOrders()
    }
  }
  render() {
    var { selectedAsset } = this.props;
    console.warn(selectedAsset);
    
    return (
      <div className="asset-view">
        <h1>{selectedAsset.token.name}</h1>
        <h3>BALANCE <span style={{ fontWeight: '100' }}>{selectedAsset.quantity || 0}</span></h3>
        <div className="input-container">
          {renderInput('WETH')}
          {renderInput(selectedAsset.token.symbol)}
        </div>
        {renderButtons(this.handleMakeOrder.bind(this))}
        <h2>ORDERBOOK</h2>
        {this.state.isLoading ? <img src="https://palisadeutc.com/views/site/images/icons/loading.gif" style={{ height: 26, width: 'auto', position: 'relative', top: 10 }} /> : null}
        <div className="orders">
          {this.state.addOrders.map(order => <Order type="add" order={order} toggleLoading={this.props.toggleLoading} updateOrders={this.updateOrders.bind(this)} />)}
          {this.state.removeOrders.map(order => <Order type="remove" order={order} toggleLoading={this.props.toggleLoading} updateOrders={this.updateOrders.bind(this)} />)}
        </div>
      </div>
    );
  }

  async handleMakeOrder(action) {
    var selectedAsset = this.props.selectedAsset.token.symbol
    var wethValue = Number(document.getElementById('value-WETH').value)
    var assetValue = Number(document.getElementById('value-' + selectedAsset).value)
    if (!wethValue || !assetValue) return;
    this.props.toggleLoading(true)
    try {
      await makeOrder(selectedAsset, wethValue, assetValue, action)
      alert('Order made successfully')
    }
    catch (e) {
      // console.error(e);
      alert(e)
    }
    this.props.toggleLoading(false)
    this.updateOrders()
  }
}
export default AssetView;