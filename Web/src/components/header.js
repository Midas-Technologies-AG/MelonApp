import React from 'react';
import { getName, getInfo } from '../wrapper/melon'

class Header extends React.Component {
  state = { name: 'Loading', sharePrice: 0 }

  async componentDidMount() {
    try {
      var name = await getName();
      var sharePrice = (await getInfo()).toFixed(4);
      this.setState((prevState, props) => Object.assign({}, prevState, { name, sharePrice }))
    }
    catch (e) {
      console.error(e.message)
    }
  }

  render() {
    return (<header>
      <span className="fund-name">{this.state.name}</span>
      <span className="share-price"><b>{this.state.sharePrice ? 'SHARE PRICE' : ''}</b> {this.state.sharePrice || '...'}</span>
    </header>);
  }
}
export default Header;