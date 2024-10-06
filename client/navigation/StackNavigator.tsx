import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddMood from '../screens/AddMood';
import MoodDetail from '../screens/MoodDetail';

type NewStackParamList = {
  AddMood: undefined;
  MoodDetail: { moodId: string };
};

const Stack = createNativeStackNavigator<NewStackParamList>();

const NewStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#121212' }
      }}
    >
      <Stack.Screen name="AddMood" component={AddMood} />
      <Stack.Screen
        name="MoodDetail"
        component={MoodDetail}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
export default NewStackNavigator;