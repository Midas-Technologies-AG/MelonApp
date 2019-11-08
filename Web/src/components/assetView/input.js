import React from 'react';

export default (asset) => {
  return <input id={"value-" + asset} type="number" placeholder={asset} className="input-value" />
}