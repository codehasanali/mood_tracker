import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomTextInputProps extends TextInputProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  rightIcon?: React.ReactNode;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  iconName,
  rightIcon,
  ...textInputProps
}) => {
  return (
    <View style={styles.inputContainer}>
      <Ionicons name={iconName} size={24} color="#B3B3B3" style={styles.icon} />
      <TextInput style={styles.input} placeholderTextColor="#B3B3B3" {...textInputProps} />
      {rightIcon}
    </View>
  );
};

export default React.memo(CustomTextInput);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
   
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 12,
  },
});