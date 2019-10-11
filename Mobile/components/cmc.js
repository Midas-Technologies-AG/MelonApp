import React, { Component } from 'react';
import { Text, TouchableOpacity, Linking} from 'react-native';

const CMC_NAMES = {
  'ZRX': '0x',
  'WETH': 'weth',
  'MLN': 'melon',
  'KNC': 'kyber-network',
  'BAT': 'basic-attention-token',
  'DGX': 'digix-gold-token',
  'REP': 'augur',
  'MKR': 'maker',
  'DAI': 'dai'
}

const symbolToCMC = (symbol) => {
  var cmcName = CMC_NAMES[symbol]
  return (!cmcName) ? '' : cmcName
}

export default class CMCButton extends Component {

  render() {
    var cmcName = symbolToCMC(this.props.symbol)
    return <TouchableOpacity style={{ marginLeft: 16, marginBottom: 24 }} onPress={() => Linking.openURL('https://coinmarketcap.com/currencies/' + encodeURI(cmcName))}>
      <Text style={{ fontSize: 12, fontWeight: 'bold' }}>📈 VIEW ON COINMARKETCAP.COM</Text>
    </TouchableOpacity>
  }
}