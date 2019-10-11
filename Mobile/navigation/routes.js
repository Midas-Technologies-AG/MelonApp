import React from 'react';
import Mix from '../views/mix';
import Asset from '../views/asset';
import Login from '../views/login';

export default {
  Mix: { screen: (props) => <Mix {...props} /> },
  Asset: { screen: (props) => <Asset {...props} /> },
  Login: { screen: () => <Login /> },
}