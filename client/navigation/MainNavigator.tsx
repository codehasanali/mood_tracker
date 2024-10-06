import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home';
import CalendarScreen from '../screens/Calendar';
import CustomTabBar from '../components/CustomTab';
import SettingsScreen from '../screens/Settings';

type MainTabParamList = {
  Home: undefined;
  Settings: undefined;
  Calendar: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const [hideTabBar, setHideTabBar] = useState(false);

  return (
    <Tab.Navigator
      tabBar={(props) => (hideTabBar ? null : <CustomTabBar {...props as any} />)}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#121212', display: hideTabBar ? 'none' : 'flex' },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        listeners={{
          focus: () => setHideTabBar(false),
        }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        listeners={{
          focus: () => setHideTabBar(false),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        listeners={{
          focus: () => setHideTabBar(false),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;