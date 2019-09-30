import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput } from 'react-native';
import Web3 from 'web3';

var Protocol = require('@melonproject/protocol')
var web3Accounts = require("web3-eth-accounts")
var createToken = require('@melonproject/token-math').createToken
var createQuantity = require('@melonproject/token-math').createQuantity
var deposit = require('@melonproject/protocol/lib/contracts/dependencies/token/transactions/deposit').deposit;
var withPrivateKeySigner = require('@melonproject/protocol/lib/utils/environment/withPrivateKeySigner').withPrivateKeySigner
var withDeployment = require('@melonproject/protocol/lib/utils/environment/withDeployment').withDeployment
var constructEnvironment = require('@melonproject/protocol/lib/utils/environment/constructEnvironment').constructEnvironment
var setupInvestedTestFund = require('@melonproject/protocol/lib/tests/utils/setupInvestedTestFund').setupInvestedTestFund

export var getEnvironment = () => withDeployment(constructEnvironment({ endpoint: 'https://kovan.infura.io/', track: 'kyberPrice' }))
export var getAllAssets = async () => (await getEnvironment()).deployment.thirdPartyContracts.tokens.map(asset => ({ token: asset }))
var getNewAccount = async () => (new web3Accounts((await getEnvironment()).eth.currentProvider)).create()
var getManager = async (privateKey) => await withPrivateKeySigner(await getEnvironment(), privateKey)
var getRichManager = async () => await getManager(PRIVATE_KEY)// has lots of ETH moneyz
const INITIAL_BALANCE = 1

var depositWeth = async (privateKey, amount = INITIAL_BALANCE) => {
  var manager = await getManager(privateKey);
  const weth = Protocol.getTokenBySymbol(manager, 'WETH');
  const quantity = createQuantity(weth, amount);
  console.warn(manager.wallet.address);

  await deposit(manager, quantity.token.address, undefined, {
    value: quantity.quantity.toString(),
  });
}


export default class App extends Component {
  state = {
    text: ''
  }


 async componentDidMount() {
    var all = await getAllAssets();
    console.warn(all);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <TextInput value={this.state.text}></TextInput>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
