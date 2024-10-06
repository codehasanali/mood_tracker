import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../context/authContext';

import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Register';
import CreateAppPasswordScreen from '../screens/CreatePassword';
import VerifyAppPasswordScreen from '../screens/VerifyAppPassword';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  CreateAppPassword: undefined;
  VerifyAppPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const { initializeAuth, isAuthenticated, appPasswordSet, appPasswordVerified, checkAppPasswordStatus } = useAuthStore();

  useEffect(() => {
    const initialize = async () => {
      await initializeAuth();
      if (isAuthenticated) {
        await checkAppPasswordStatus();
      }
    };
    initialize();
  }, [initializeAuth, isAuthenticated, checkAppPasswordStatus]);

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#121212' }
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : !appPasswordSet ? (
        <Stack.Screen name="CreateAppPassword" component={CreateAppPasswordScreen} />
      ) : !appPasswordVerified ? (
        <Stack.Screen name="VerifyAppPassword" component={VerifyAppPasswordScreen} />
      ) : null}
    </Stack.Navigator>
  );
};

export default AuthNavigator;