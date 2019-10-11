import React, { Component } from 'react';
import { View, Text, ScrollView, AsyncStorage, TextInput } from 'react-native';
import Title from '../components/title'
import Button from '../components/button'
import { getPrivateKey, getHubs, getRoutes } from '../wrapper/melon';
import { reset } from '../navigation/navigator';

export default class Mix extends Component {

  state = { isLoading: false }

  async componentDidMount() {
    var privateKey = await AsyncStorage.getItem('privateKey');
    if (privateKey) this.login(privateKey)
  }

  render() {
    return <ScrollView contentContainerStyle={{ flex: 1 }}>
      <Title text='Melon Interface' />
      <View style={{ justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontWeight: 'bold' }}>MNEMONIC 🔐</Text>
        <TextInput
          placeholder={'12-word seed phrase, space seperated'}
          multiline={true}
          style={{ paddingLeft: 16, paddingTop: 16, borderRadius: 10, borderColor: 'grey', borderWidth: 1, height: 100, marginVertical: 16, width: '100%' }}
          autoCapitalize='none'
          onChangeText={value => this.mnemonic = value}
        />
        <Text style={{ fontSize: 20, color: 'grey', margin: 16, textAlign: 'center', marginBottom: 32 }}>OR</Text>
        <Text style={{ fontWeight: 'bold' }}>PRIVATE KEY 🔑</Text>
        <TextInput
          placeholder={'0x.....'}
          multiline={true}
          style={{ paddingLeft: 16, paddingTop: 16, borderRadius: 10, borderColor: 'grey', borderWidth: 1, height: 100, marginVertical: 16, width: '100%' }}
          autoCapitalize='none'
          onChangeText={value => this.privateKey = value}
        />
      </View>
      <Button text={this.state.isLoading ? 'ENTERING...' : 'ENTER'} onPress={this.submit.bind(this)} disabled={this.state.isLoading} />
    </ScrollView>
  }

  submit() {
    try {
      if (this.mnemonic) {
        console.warn('logging with mnemonic');
        var mnemonic = this.mnemonic.split(' ')
        if (mnemonic.length != 12) {
          alert('Invalid mnemonic')
          return;
        }
        this.login(getPrivateKey(this.mnemonic))
      }
      else if (this.privateKey) {
        if (this.privateKey.length < 12) {
          alert('Invalid private key')
          return;
        }
        this.login(this.privateKey)
      }
      else alert('Please enter valid input')
    } catch (e) {
      alert(e.message)
    }
  }

  async login(privateKey) {
    this.setState({ isLoading: true })
    AsyncStorage.setItem('privateKey', privateKey)
    var fund = await AsyncStorage.getItem('fund');
    if (fund) { reset('Mix'); return; }
    try {
      var hubAddress = await getHubs();
      console.warn(hubAddress);
      if (!hubAddress) alert('Unable to login')
      else {
        var routes = await getRoutes();
        console.warn(routes);
        var fund = Object.assign({}, routes, { hubAddress })
        AsyncStorage.setItem('fund', JSON.stringify(fund));
        reset('Mix')
      }
      this.setState({ isLoading: false })
    } catch (e) {
      this.setState({ isLoading: false })
      alert(e.message)
    }
  }
}