import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default class Button extends Component {

  render() {
    return <View style={{ padding: 16, position: 'absolute', bottom: 16, width: '100%' }}>
      <TouchableOpacity disabled={this.props.disabled} onPress={this.props.onPress} style={{ backgroundColor: this.props.disabled ? 'grey' : 'black', borderRadius: 30, height: 60, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 24, letterSpacing: 2 }}>{this.props.text || ''}</Text>
      </TouchableOpacity>
    </View>
  }

}