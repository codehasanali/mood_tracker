import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface CardMoodProps {
  date: string;
  title: string;
  description: string;
  emoji: string;
  memoryCount: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const moodColors: { [key: string]: string } = {
  '😇': '#00224D', 
  '😍': '#5D0E41', 
  '😊': '#A0153E', 
  '😐': '#FF204E', 
  '😕': '#430A5D', 
  '😤': '#FF6B6B', 
  '😠': '#FF8C42', 
  '😡': '#FF4136',
  '😢': '#4A90E2',
  '😭': '#3498DB', 
  '😰': '#7FDBFF',
  '😱': '#B10DC9', 
  '😳': '#FF69B4',
};

const CardMood: React.FC<CardMoodProps> = React.memo(({ date, title, description, emoji }) => {
  const day = format(parseISO(date), 'd');
  const month = format(parseISO(date), 'MMM', { locale: tr });
  const monthYear = format(parseISO(date), 'MMM yyyy', { locale: tr });
  const cardColor = moodColors[emoji] || '#2C3E50';

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, { backgroundColor: cardColor }]}>
        <View style={styles.dateContainer}>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.month}>{month}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {title.length > 20 ? `${title.slice(0, 20)}...` : title}
            </Text>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    width: SCREEN_WIDTH * 0.9,
    alignSelf: 'center',
    marginVertical: 10,
  },
  monthYear: {
    fontFamily: "Roboto_700Bold",
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  memoryCountContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  memoryCount: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  day: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
  },
  month: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: '#FFFFFF',
    opacity: 0.2,
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
    fontFamily:'Roboto_700Bold'
  },
  emoji: {
    fontSize: 24,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
  },
});

export default CardMood;