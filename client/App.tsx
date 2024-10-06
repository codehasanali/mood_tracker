import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import RootNavigator from './navigation/RootNavigator';
import NetworkProvider from './context/NetworkProvider';

import {GestureHandlerRootView} from 'react-native-gesture-handler'
const App: React.FC = () => {
  return (
    
   <GestureHandlerRootView style={{flex:1}}>
       <NetworkProvider>     
        <RootNavigator />
     </NetworkProvider>
   </GestureHandlerRootView>


  );
};


export default App;