import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Title from '../components/title'
import Asset from '../components/asset'
import { getAllAssets } from '../wrapper/melon';

export default class Mix extends Component {
  state = { assets: [] }
 
  async componentDidMount() {
    var assets = await getAllAssets();
    console.warn(assets);
  }

  render() {
    return <ScrollView>
      <Title text='Fund' />
      <Asset name={'ANT'} symbol={'ANT'} balance={199999.98437865438}/>
      <Asset name={'ANT'} symbol={'ANT'} balance={199999.98437865438}/>
    </ScrollView>
  }
}