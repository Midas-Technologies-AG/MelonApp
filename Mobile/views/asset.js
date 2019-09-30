import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Title from '../components/title'

export default class Asset extends Component {

  render() {
    console.warn(this.props);
    return <ScrollView>
      <Title text={this.props.name} />
    </ScrollView>
  }
}