import React from 'react';
import Mix from '../views/mix';
import Asset from '../views/asset';

export default {
  Mix: { screen: (props) => <Mix {...props} /> },
  Asset: { screen: (props) => <Asset {...props} /> },
}