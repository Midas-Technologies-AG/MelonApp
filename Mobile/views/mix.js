import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Title from '../components/title'
import Asset from '../components/asset'
import { getAllAssets } from '../wrapper/melon';

export default class Mix extends Component {
  state = { assets: [] }

  async componentDidMount() {
    var assets = await getAllAssets();
    this.setState((prevState, props) => Object.assign({}, prevState, { assets }))
  }

  render() {
    return <ScrollView>
      <Title text='Fund' />
      {this.state.assets.map(asset => <Asset key={asset.token.symbol} name={asset.token.name} symbol={asset.token.symbol} balance={199999.98437865438} />)}
    </ScrollView>
  }
}