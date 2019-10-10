import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Title from '../components/title'
import Asset from '../components/asset'
import { getAllAssets, getHoldings, getInfo } from '../wrapper/melon';

export default class Mix extends Component {
  state = { assets: [], isLoading: true, nav: 0, sharePrice: 0 }

  async componentDidMount() {
    var assets = await getAllAssets();
    var holdings = await getHoldings()
    holdings.forEach(holding => {
      var assetIndex = assets.findIndex(asset => asset.token.address.toLowerCase() === holding.token.address.toLowerCase());
      assets[assetIndex] = Object.assign({}, assets[assetIndex], { quantity: holding.quantity / Math.pow(10, holding.token.decimals) })
    });
    this.setState((prevState, props) => Object.assign({}, prevState, { assets, isLoading: false }))
    var { nav, sharePrice } = await getInfo();
    this.setState((prevState, props) => Object.assign({}, prevState, { assets, nav: nav.quantity / Math.pow(10, nav.token.decimals), sharePrice: sharePrice.quote.quantity / sharePrice.base.quantity }))
  }

  componentDidUpdate() {
    //TODO update balances on coming back from asset screen
  }

  render() {
    return <ScrollView>
      <Title text='Fund' />
      {!this.state.nav ? null : <View style={{ position: 'absolute', right: 16, alignItems: 'flex-end' }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ fontWeight: 'bold' }}>SHARE PRICE: </Text>
          <Text>{this.state.sharePrice.toFixed(4)}</Text>
        </View>
      </View>}
      {(this.state.isLoading) ? <Text style={{ margin: 16 }}>Loading...</Text> : this.renderAssets()}
    </ScrollView>
  }

  renderAssets() {
    return <View>
      {this.renderAssetsWithBalance()}
      {this.renderAssetsWithoutBalance()}
    </View>
  }

  renderAssetsWithBalance() {
    return this.state.assets.filter(asset => asset.quantity).map(this.renderAsset)
  }

  renderAssetsWithoutBalance() {
    return this.state.assets.filter(asset => !asset.quantity).map(this.renderAsset)
  }

  renderAsset(asset) {
    return <Asset key={asset.token.symbol} name={asset.token.name} symbol={asset.token.symbol} balance={asset.quantity || 0} />
  }
}