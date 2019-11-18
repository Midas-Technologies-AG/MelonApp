import React, { Component } from 'react';
import { View, Text, ScrollView, AsyncStorage, TextInput, Alert, ActivityIndicator } from 'react-native';
import Title from '../components/title'
import Button from '../components/button'
import { getPrivateKey, getHubs, getRoutes, setupFundInvestedFund } from '../wrapper/melon';
import { reset, goBack } from '../navigation/navigator';

export default class Mix extends Component {

  state = { isLoading: false }

  async componentDidMount() {
    this.privateKey = this.props.navigation.state.params.privateKey
  }

  render() {
    return <ScrollView contentContainerStyle={{ flex: 1 }}>
      <Text
        onPress={() => goBack()}
        style={{ position: 'absolute', right: 0, fontSize: 12, fontWeight: '100', color: 'grey', zIndex: 1, padding: 16, top: -16 }}>
        BACK
      </Text>
      <Title text='Setup Fund' />
      <View style={{ justifyContent: 'center', padding: 32, opacity: this.state.isLoading ? 0.5 : 1 }}>
        <Text style={{ fontWeight: 'bold' }}>PRIVATE KEY 🔑</Text>
        <TextInput
          placeholder={'0x.....'}
          multiline={true}
          style={{ paddingHorizontal: 16, paddingTop: 16, borderRadius: 10, borderColor: 'grey', borderWidth: 1, height: 100, marginVertical: 16, width: '100%' }}
          autoCapitalize='none'
          onChangeText={value => this.privateKey = value}
          defaultValue={this.props.navigation.state.params.privateKey}
          editable={!this.state.isLoading}
        />
        <Text style={{ fontWeight: 'bold', marginTop: 24 }}>FUND NAME</Text>
        <TextInput
          placeholder={'MyMix101'}
          style={{ paddingHorizontal: 16, paddingTop: 16, borderBottomColor: 'grey', borderBottomWidth: 1, height: 48, width: '100%' }}
          autoCapitalize='none'
          editable={!this.state.isLoading}
          onChangeText={value => this.name = value}
        />
      </View>
      {this.state.isLoading && <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 16, color: 'grey', textAlign: 'center' }}>Please keep the app in foreground while the fund is being setup. This may take a few minutes.</Text>
        <Text style={{ marginTop: 16, color: 'grey', textAlign: 'center' }}>You can track it on kovan.etherscan.io</Text>
      </View>}
      <Button text={this.state.isLoading ? 'SETTING UP...' : 'SETUP FUND'} onPress={this.submit.bind(this)} disabled={this.state.isLoading} />
    </ScrollView>
  }

  async submit() {
    try {
      this.setState({ isLoading: true })
      if (this.privateKey) {
        if (this.privateKey.length < 12 || !this.name) {
          this.setState({ isLoading: false })
          alert('Invalid input')
          return;
        }
        else {
          var fund = await setupFundInvestedFund(this.name, this.privateKey)
          AsyncStorage.setItem('privateKey', this.privateKey)
          reset('Login')
        }
      }
      else alert('Please enter valid private key')
    } catch (e) {
      this.setState({ isLoading: false })
      alert(e)
    }
  }
}