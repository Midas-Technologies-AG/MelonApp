import React from 'react';
import { takeOrder } from '../../wrapper/melon';
const URL = 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/svg/'

class Order extends React.Component {
  render() {
    var { type, order } = this.props;
    return (<div className={"order " + type} onClick={() => this.handleTakeOrder(order)}>
      <img src={URL + (type == 'add' ? 'plus' : 'minus') + '.svg?sanitize=true'} style={{ backgroundColor: type == 'add' ? 'green' : '#e00000' }} />
      {(type == 'add') ? <span>{(order.trade.quote.quantity / Math.pow(10, order.trade.quote.token.decimals)).toFixed(4) + ' ' + order.trade.quote.token.symbol} for {(order.trade.base.quantity / Math.pow(10, 18)).toFixed(4)} Ξ total</span> : <span>{(order.trade.base.quantity / Math.pow(10, order.trade.base.token.decimals)).toFixed(4) + ' ' + order.trade.base.token.symbol} for {(order.trade.quote.quantity / Math.pow(10, order.trade.quote.token.decimals)).toFixed(4)} Ξ total</span>}
    </div>
    );
  }

  async handleTakeOrder(order) {
    this.props.toggleLoading(true)
    try {
      await takeOrder(order.original.id)
      console.warn('Cussess')
      alert('Order taken successfully')
      //TODO reload holdings
    }
    catch (e) {
      // console.error(e);
      alert(e)
    }
    this.props.toggleLoading(false)
    this.props.updateOrders()
  }
}
export default Order;