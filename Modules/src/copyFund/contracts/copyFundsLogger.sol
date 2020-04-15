pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

/**
 * The copyFundsLogger contract logs copied funds from the melonproject/protocol and is used to sell already copied funds.
 */
contract copyFundsLogger {
  struct Fund {
  	address manager;
  	uint amount;
  	address[] assets;
  	uint[] values;
  }

  mapping (address => mapping (address => Fund)) public fundLogger;
  
  event CopiedAfund(address srcFund, address destFund, uint amount, address[] assets, uint[] values);
  event SoldAfund(address srcFund, address destFund, uint amount, address[] assets, uint[] values);

  constructor() public {
  }

  function copiedFund (Fund memory _fund) public returns(bool) {
  	require (_fund.manager != address(0x0),
      "Address is not a fund");
  	require (_fund.amount > 0,
      "Amount must be greate zero and an integer.");
  	require (_fund.assets.length == _fund.values.length,
      "Asset value list differs.");
  	fundLogger[msg.sender][_fund.manager] = Fund(_fund.manager, _fund.amount, _fund.assets, _fund.values);
    emit CopiedAfund(msg.sender, _fund.manager, _fund.amount, _fund.assets, _fund.values);
    return true;
  }
  
  function soldFund (Fund memory _fund) public returns(bool) {
  	require (_fund.manager != address(0x0));
    address sender = msg.sender;
  	delete fundLogger[sender][_fund.manager];
    emit SoldAfund(sender, _fund.manager, _fund.amount, _fund.assets, _fund.values);
  	return true;
  }

  function getCopiedFund (address _manager) public view returns (address, uint, address[] memory, uint[] memory) {
  	Fund memory retval = fundLogger[msg.sender][_manager];
  	return (retval.manager, retval.amount, retval.assets, retval.values);
  }
}
