export default (environment) => {
  const address = window.web3.currentProvider.selectedAddress
  const signTransaction = unsignedTransaction => unsignedTransaction;
  const signMessage = message => window.web3.eth.sign(address, message, function (err, result) {
    if (err) return console.error(err)
    console.log('SIGNED:' + result)
  })
  environment.eth.signTransaction = window.web3.eth.signTransaction;
  environment.eth.sendTransaction = window.web3.eth.sendTransaction;
  const withWallet = Object.assign({}, environment, {
    wallet: {
      address,
      signMessage,
      signTransaction,
    }
  });
  return withWallet;
};