import React from 'react';
import Mix from '../views/mix';
import Asset from '../views/asset';
import Login from '../views/login';
import Signup from '../views/signup';

export default {
  Mix: { screen: (props) => <Mix {...props} /> },
  Asset: { screen: (props) => <Asset {...props} /> },
  Signup: { screen: (props) => <Signup {...props} /> },
  Login: { screen: (props) => <Login {...props} /> },
}