import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../context/authContext';

import MainTabNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';
import CreateAppPasswordScreen from '../screens/CreatePassword';
import VerifyAppPasswordScreen from '../screens/VerifyAppPassword';
import NewStackNavigator from './StackNavigator';
import MoodDetail from '../screens/MoodDetail';

type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  CreateAppPassword: undefined;
  VerifyAppPassword: undefined;
  AddMoodStack: undefined;
  MoodDetail: { moodId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, appPasswordSet, appPasswordVerified } = useAuthStore();
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#121212' }
        }}
      >
        {isAuthenticated ? (
          appPasswordSet ? (
            appPasswordVerified ? (
              <>
                <Stack.Screen name="Main" component={MainTabNavigator} />
                <Stack.Screen name="AddMoodStack" component={NewStackNavigator} />
                <Stack.Screen name="MoodDetail" component={MoodDetail} />
             
              </>
            ) : (
              <Stack.Screen name="VerifyAppPassword" component={VerifyAppPasswordScreen} />
            )
          ) : (
            <Stack.Screen name="CreateAppPassword" component={CreateAppPasswordScreen} />
          )
        ) : (
          <>
            <Stack.Screen name="Auth" component={AuthNavigator} />
           
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;