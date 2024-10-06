import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import Alert from '../components/Alert';

interface NetworkContextType {
  isConnected: boolean | null;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const handleConnectivityChange = (state: NetInfoState) => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    };

    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    NetInfo.fetch().then(handleConnectivityChange);

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      <View style={styles.container}>
        {isConnected === false && (
          <Alert 
            type="error" 
            message="İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin." 
          />
        )}
        {children}
      </View>
    </NetworkContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default NetworkProvider;