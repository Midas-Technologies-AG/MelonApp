import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import assets from '../assets'
import { goTo } from '../navigation/navigator'

export default class Asset extends Component {
  render() {
    var { symbol, name, balance } = this.props;
    return <TouchableOpacity disabled={symbol === 'WETH'} onPress={() => goTo('Asset', { symbol, name, balance })} style={{ borderBottomColor: 'lightgrey', borderBottomWidth: 1, height: 100, flexDirection: 'row', padding: 16 }}>
      <Image source={assets.tokens.white[symbol.toLowerCase()]} style={{ height: 50, width: 50 }} />
      <View style={{ marginLeft: 12, height: 100 - 32, justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{name}</Text>
        <Text style={{ color: 'grey', fontSize: 12, fontWeight: '100' }}>{symbol}</Text>
        <Text>{balance}</Text>
      </View>
    </TouchableOpacity>;
  }
}