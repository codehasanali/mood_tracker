import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions, NavigationProp } from '@react-navigation/native';
import Icon from './Icon';
import AddDefault from '../assets/icons/AddDefault';

const { width: screenWidth } = Dimensions.get('window');

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: NavigationProp<ReactNavigation.RootParamList>;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const handleAddMoodPress = () => {
    navigation.navigate('AddMoodStack' as never);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => {
                const event = navigation.dispatch(
                  CommonActions.navigate({
                    name: route.name,
                    params: {},
                  })
                );

                if (!isFocused) {
                  navigation.dispatch({
                    ...CommonActions.navigate(route.name),
                    target: state.key,
                  });
                }
              }}
              style={styles.tabItemContainer}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
            >
              <View style={[
                styles.tabItem,
                isFocused && styles.focusedTabItem
              ]}>
                <Icon name={route.name} focused={isFocused} size={24} />
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity 
          style={styles.tabItemContainer}
          onPress={handleAddMoodPress}
          accessibilityRole="button"
          accessibilityLabel="Add Mood"
        >
          <View style={[styles.tabItem, styles.addButton]}>
            <AddDefault width={24} height={24} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: 60,
    width: '100%',
    paddingHorizontal: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tabItemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  focusedTabItem: {
    backgroundColor: '#1C1C1E',
  },
  addButton: {
    backgroundColor: '#1C1C1E',
  },
});

export default CustomTabBar;