import React from 'react';

const renderButton = (text, action) => {
  return <button onClick={() => action(text)} style={{ backgroundColor: text == 'SELL' ? 'white' : 'black', color: text == 'SELL' ? 'black' : 'white' }}>{text}</button>
}
export default (action) => {
  return <div style={{ display: 'flex', justifyContent: 'center' }}>
    {renderButton('SELL', action)}
    {renderButton('BUY', action)}
  </div>
}