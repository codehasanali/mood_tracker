import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { format } from 'date-fns';

interface DateHeaderProps {
  date: Date;
}

const DateHeader: React.FC<DateHeaderProps> = React.memo(({ date }) => {
  const { colors } = useTheme();

  const formattedDate = format(date, 'PPP'); 

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>{formattedDate}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginVertical: 12,
  },
  text: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DateHeader;