
export default (symbol) => {
  if (symbol == 'DGX') symbol = 'DGD';
  if (symbol == 'WETH') symbol = 'ETH';
  return 'https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/svg/black/' + symbol.toLowerCase() + '.svg?sanitize=true'
};