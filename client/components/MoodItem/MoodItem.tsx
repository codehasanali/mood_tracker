import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Mood } from '../../types/Mood';

interface MoodItemProps {
  mood: Mood;
  date: string;
}

const MoodItem: React.FC<MoodItemProps> = ({ mood, date }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.date}>{date}</Text>
      <View style={styles.contentContainer}>
        <Text style={styles.emoji}>{mood.emoji}</Text>
        <Text style={styles.title}>{mood.title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  date: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 10,
  },
  title: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});

export default MoodItem;