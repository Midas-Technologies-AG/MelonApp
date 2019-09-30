import React, { Component } from 'react';
import { Text } from 'react-native';

export default class Title extends Component {
  render() {
    return <Text style={{ fontSize: 24, color: 'black', marginBottom: 16, marginLeft: 16 }}>{this.props.text || 'Title'}</Text>
  }
}