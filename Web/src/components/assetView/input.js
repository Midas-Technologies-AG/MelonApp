import React from 'react';

export default (asset, placeholder) => {
  return <input id={"value-" + asset} type="number" placeholder={placeholder} className="input-value" />
}