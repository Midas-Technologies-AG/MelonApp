import React from 'react';
import renderInput from './input';
import renderButtons from './buttons';
import { makeOrder, getOrders } from '../../wrapper/melon';
import Order from './order';
import Toggle from 'react-toggle';

class AssetView extends React.Component {
  state = { addOrders: [], removeOrders: [], isLoading: true, isSell: true }

  async updateOrders() {
    var { selectedAsset } = this.props;
    if (selectedAsset.token.symbol == "WETH") return;
    try {
      document.getElementById('value-WETH').value = ''
      document.getElementById('value-' + this.props.selectedAsset.token.symbol).value = ''
      this.setState((prevState, props) => Object.assign({}, prevState, { addOrders: [], removeOrders: [] }))
      var symbol = this.props.selectedAsset.token.symbol
      var addOrders = await getOrders('WETH', symbol, 'add')
      var removeOrders = await getOrders(symbol, 'WETH', 'remove')
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
    var { isSell } = this.state;

    if (selectedAsset.token.symbol == "WETH") return <div className="asset-view"></div>
    return (
      <div className="asset-view">
        <h1>{selectedAsset.token.name}</h1>
        <h3><span style={{ color: 'grey' }}>BALANCE</span> <span style={{ fontWeight: '100' }}>{selectedAsset.quantity || 0}</span></h3>
        <span style={{ marginLeft: 48, fontSize: 22, fontWeight:300 }}>Create Order</span>
        <div className="input-container">
          {renderInput('WETH', isSell ? 'Get WETH' : 'Pay WETH')}
          {renderInput(selectedAsset.token.symbol, isSell ? 'Sell '+selectedAsset.token.symbol : 'Buy '+selectedAsset.token.symbol)}
        </div>
        <div className="toggle-container">
          {this.renderToggle()}
          <button onClick={this.handleMakeOrder.bind(this)}>Place order</button>
        </div>
        <h2 style={{fontWeight:300}}>Order Book</h2>
        {this.state.isLoading ? <img src="https://palisadeutc.com/views/site/images/icons/loading.gif" style={{ height: 26, width: 'auto', position: 'relative', top: 10 }} /> : null}
        <div className="orders">
          {this.state.addOrders.map(order => <Order type="add" order={order} toggleLoading={this.props.toggleLoading} updateOrders={this.updateOrders.bind(this)} />)}
          {this.state.removeOrders.map(order => <Order type="remove" order={order} toggleLoading={this.props.toggleLoading} updateOrders={this.updateOrders.bind(this)} />)}
        </div>
      </div>
    );
  }
  renderToggle() {
    return <div className="toggle" onClick={this.toggle.bind(this)}>
      <span className={this.state.isSell ? "selected" : ""}>SELL</span>
      <span className={this.state.isSell ? "" : "selected"}>BUY</span>
    </div>
  }
  toggle() {
    this.setState((prevState, props) => Object.assign({}, prevState, { isSell: !prevState.isSell }))
  }

  async handleMakeOrder() {
    var selectedAsset = this.props.selectedAsset.token.symbol
    var wethValue = Number(document.getElementById('value-WETH').value)
    var assetValue = Number(document.getElementById('value-' + selectedAsset).value)
    if (!wethValue || !assetValue) return;
    this.props.toggleLoading(true)
    try {
      await makeOrder(selectedAsset, wethValue, assetValue, this.state.isSell ? 'SELL' : 'BUY')
      alert('Order made successfully')
    }
    catch (e) {
      console.error(e);
      alert(e)
    }
    this.props.toggleLoading(false)
    this.updateOrders()
  }
}
export default AssetView;