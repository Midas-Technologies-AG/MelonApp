import React from 'react';
import { View, Platform } from 'react-native';
import Navigation from './navigation';
import { setNavigator } from './navigation/navigator';

const App = () => {
  return (<View style={{ flex: 1, paddingTop: 46 }}>
    <Navigation />
  </View>
  );
};

export default App;