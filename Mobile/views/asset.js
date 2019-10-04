import React, { Component } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import Title from '../components/title'
import assets from '../assets';
import { goBack } from '../navigation/navigator';

export default class Asset extends Component {

  render() {
    var token = this.props.navigation.state.params;
    return <ScrollView>
      <Text
        onPress={() => goBack()}
        style={{ position: 'absolute', right: 0, fontSize: 12, fontWeight: '100', color: 'grey', zIndex: 1, padding: 16, top: -16 }}>
        BACK
      </Text>
      <Title text={token.symbol} />
      <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
        <Image source={assets.tokens.black.ant} style={{ height: 80, width: 80, marginRight: 8 }} />
        <View>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>{token.name}</Text>
          <Text style={{ fontSize: 16, fontWeight: '100', color: 'black' }}>{token.balance}</Text>
        </View>
      </View>
      <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => Linking.openURL('https://coinmarketcap.com/currencies/' + encodeURI(token.name))}>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>📈 VIEW ON COINMARKETCAP.COM</Text>
      </TouchableOpacity>
    </ScrollView>
  }
}