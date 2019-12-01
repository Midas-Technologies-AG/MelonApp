import React from 'react';
import { takeOrder, cancelOrder } from '../../wrapper/melon';
const URL = 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/svg/'

class Order extends React.Component {
  render() {
    var { type, order } = this.props;
    return (<div>
      <div className={"order " + type} onClick={() => this.handleTakeOrder(order)}>
        <img src={URL + (type == 'add' ? 'plus' : 'minus') + '.svg?sanitize=true'} style={{ backgroundColor: type == 'add' ? 'green' : '#e00000' }} />
        {(type == 'add') ? <span>{(order.trade.quote.quantity / Math.pow(10, order.trade.quote.token.decimals)).toFixed(4) + ' ' + order.trade.quote.token.symbol} for {(order.trade.base.quantity / Math.pow(10, 18)).toFixed(4)} Ξ total</span> : <span>{(order.trade.base.quantity / Math.pow(10, order.trade.base.token.decimals)).toFixed(4) + ' ' + order.trade.base.token.symbol} for {(order.trade.quote.quantity / Math.pow(10, order.trade.quote.token.decimals)).toFixed(4)} Ξ total</span>}
      </div>
      {order.isMine ? <div className="cancel order" onClick={() => this.cancelOrder(order)}>
        <span>Cancel</span>
      </div> : null}
    </div>
    );
  }

  async handleTakeOrder(order) {
    this.props.toggleLoading(true)
    try {
      await takeOrder(order.original.id)
      console.warn('Success')
      alert('Order taken successfully')
    }
    catch (e) {
      alert(e)
    }
    this.props.toggleLoading(false)
    this.props.updateOrders()
  }

  async cancelOrder(order) {
    this.props.toggleLoading(true)
    try {
      await cancelOrder(order.original.id)
      alert('Order cancelled successfully')
    }
    catch (e) {
      alert(e)
    }
    this.props.toggleLoading(false)
    this.props.updateOrders()
  }
}
export default Order;