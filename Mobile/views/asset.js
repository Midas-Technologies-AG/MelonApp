import React, { Component } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import Title from '../components/title'
import { goBack } from '../navigation/navigator';
import { getOrders, takeOrder } from '../wrapper/melon';
import assets from '../assets'

export default class Asset extends Component {

  state = { orders: { add: [], remove: [] }, isLoading: true, isOrdering: false, value: '' }

  async componentDidMount() {
    var { symbol } = this.props.navigation.state.params;
    if (symbol === 'WETH') return;
    var addOrders = await getOrders('WETH', symbol, 'add')
    var removeOrders = await getOrders(symbol, 'WETH', 'remove')
    this.setState((prevState, props) => Object.assign({}, prevState, { orders: { add: addOrders, remove: removeOrders }, isLoading: false }))
  }

  render() {
    var { symbol, name, balance } = this.props.navigation.state.params;
    return <ScrollView>
      <Modal
        animationType="slide"
        transparent={false}
        visible={this.state.isOrdering}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
          <Text>Attempting</Text>
          <Text style={{ fontWeight: 'bold' }}>Taking Order...</Text>
        </View>
      </Modal>
      <Text
        onPress={() => goBack()}
        style={{ position: 'absolute', right: 0, fontSize: 12, fontWeight: '100', color: 'grey', zIndex: 1, padding: 16, top: -16 }}>
        BACK
      </Text>
      <Title text={symbol} />
      <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
        <Image source={assets.tokens.black.ant} style={{ height: 80, width: 80, marginRight: 8 }} />
        <View>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>{name}</Text>
          <Text style={{ fontSize: 16, fontWeight: '100', color: 'black' }}>{balance}</Text>
        </View>
      </View>
      <TouchableOpacity style={{ marginLeft: 16, marginBottom: 24 }} onPress={() => Linking.openURL('https://coinmarketcap.com/currencies/' + encodeURI(name))}>
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>📈 VIEW ON COINMARKETCAP.COM</Text>
      </TouchableOpacity>
      <TextInput
        underlineColorAndroid='transparent'
        placeholder={'0.00'}
        style={{ paddingLeft: 16, fontSize: 32, fontWeight: '200' }}
        keyboardType={'numeric'}
        onChangeText={value => this.setState((prevState, props) => Object.assign({}, prevState, { value }))}
        value={this.state.value}
      />
      {/* TODO only take numbers input */}
      <View style={{ backgroundColor: 'rgb(230,230,230)', width: '100%', height: 1 }} />
      <Text style={{ fontSize: 16, fontWeight: 'bold', margin: 16 }}>Orderbook</Text>
      {this.state.isLoading ? <Text style={{ margin: 16 }}>Loading...</Text> : null}
      {this.state.orders.add.map(order => this.renderOrders('add', order))}
      {this.state.orders.remove.map(order => this.renderOrders('remove', order))}
    </ScrollView>
  }

  renderOrders(action, order) {
    return <TouchableOpacity onPress={() => this.handleTakeOrder(order)} key={order.id} style={{ height: 30, flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
      <View style={{ height: 30, width: 30, borderRadius: 15, backgroundColor: (action == 'add') ? 'lightgreen' : '#ff2b2b', marginHorizontal: 16 }}>
        <Image source={assets.images.white[action == 'add' ? 'plus' : 'minus']} style={{ height: 16, width: 16, marginLeft: 7, marginTop: 7 }} />
      </View>
      {(action == 'add') ? <Text>{(order.trade.quote.quantity / Math.pow(10, order.trade.quote.token.decimals)).toFixed(2) + ' ' + order.trade.quote.token.symbol} for {(order.trade.base.quantity / Math.pow(10, 18)).toFixed(2)} Ξ total</Text> : <Text>{(order.trade.base.quantity / Math.pow(10, order.trade.base.token.decimals)).toFixed(2) + ' ' + order.trade.base.token.symbol} for {(order.trade.quote.quantity / Math.pow(10, order.trade.quote.token.decimals)).toFixed(2)} Ξ total</Text>}
    </TouchableOpacity>
  }

  async handleTakeOrder(order) {
    this.setState((prevState, props) => Object.assign({}, prevState, { isOrdering: true }))
    try {
      await takeOrder(order.original.id);
      Alert.alert("Success", "Successfully proccessed order " + order.original.id, [
        { text: 'OK', onPress: () => goBack() },
      ]);
    }
    catch (e) {
      Alert.alert("Error", e.message, [
        { text: 'OK', onPress: () => this.setState((prevState, props) => Object.assign({}, prevState, { isOrdering: false })) },
      ]);
    }
  }

  async handleMakeOrder(order) {
    this.setState((prevState, props) => Object.assign({}, prevState, { isOrdering: true }))
    try {
      await takeOrder(order.original.id);
      Alert.alert("Success", "Successfully proccessed order " + order.original.id, [
        { text: 'OK', onPress: () => goBack() },
      ]);
    }
    catch (e) {
      Alert.alert("Error", e.message, [
        { text: 'OK', onPress: () => this.setState((prevState, props) => Object.assign({}, prevState, { isOrdering: false })) },
      ]);
    }
  }
}