const Web3Accounts = require('web3-eth-accounts');

const withPrivateKeySigner = async (environment, privateKey) => {
  const web3Accounts = new Web3Accounts(environment.eth.currentProvider);

  const { address } = web3Accounts.privateKeyToAccount(privateKey);

  const signTransaction = unsignedTransaction => 
    web3Accounts
      .signTransaction(unsignedTransaction, privateKey)
      .then(t => t.rawTransaction);

  const signMessage = message => web3Accounts.sign(message, privateKey);

  const withWallet = {
    ...environment,
    wallet: {
      address,
      signMessage,
      signTransaction,
    },
  };

  return withWallet;
};

module.exports = withPrivateKeySigner;
