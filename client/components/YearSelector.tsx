import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;
const normalize = (size: number) => Math.round(size * scale);

const yearEmojis = {
  current: ['🌟', '✨', '💫', '⭐️'],
  past: ['📅', '⏮️', '🕰️', '📆', '📱', '📖', '🎬', '💾', '📻', '🎮'],
  future: ['🚀', '🔮', '💡', '🎯', '✈️', '🎪', '🎨', '🎭', '🎪', '🎡']
};

interface YearEmojiIndicatorProps {
  year: number;
  currentYear: number;
}

const YearEmojiIndicator: React.FC<YearEmojiIndicatorProps> = ({ year, currentYear }) => {
  const getYearEmoji = () => {
    if (year === currentYear) {
      return yearEmojis.current[Math.floor(Math.random() * yearEmojis.current.length)];
    } else if (year < currentYear) {
      return yearEmojis.past[year % yearEmojis.past.length];
    } else {
      return yearEmojis.future[year % yearEmojis.future.length];
    }
  };

  return (
    <Text style={styles.emojiText}>
      {getYearEmoji()}
    </Text>
  );
};

interface YearSelectorProps {
  currentDate: Date;
  onYearSelect: (year: number) => void;
  onClose: () => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({ currentDate, onYearSelect, onClose }) => {
  const [selectedDecade, setSelectedDecade] = useState(() => {
    const currentYear = currentDate.getFullYear();
    return Math.floor(currentYear / 10) * 10;
  });

  const generateYears = useCallback(() => {
    const years: number[] = [];
    const startYear = selectedDecade - 1;
    for (let i = 0; i < 12; i++) {
      years.push(startYear + i);
    }
    return years;
  }, [selectedDecade]);

  const handlePrevDecade = () => {
    setSelectedDecade(prev => prev - 10);
  };

  const handleNextDecade = () => {
    setSelectedDecade(prev => prev + 10);
  };

  return (
    <View style={styles.yearSelectorOverlay}>
      <View style={styles.yearSelectorContainer}>
        <View style={styles.yearSelectorHeader}>
          <TouchableOpacity onPress={handlePrevDecade} style={styles.decadeButton}>
            <Ionicons name="chevron-back" size={normalize(24)} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.decadeHeaderContent}>
            <Text style={styles.decadeText}>
              {`${selectedDecade} - ${selectedDecade + 9}`}
            </Text>
            <Text style={styles.decadeEmoji}>🗓️</Text>
          </View>
          <TouchableOpacity onPress={handleNextDecade} style={styles.decadeButton}>
            <Ionicons name="chevron-forward" size={normalize(24)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Kapat</Text>
          <Text style={styles.closeEmoji}>👋</Text>
        </TouchableOpacity>

        <View style={styles.yearsGrid}>
          {generateYears().map(year => {
            const isCurrentYear = year === currentDate.getFullYear();
            const isOutsideDecade = year < selectedDecade || year > selectedDecade + 9;

            return (
              <TouchableOpacity
                key={year}
                onPress={() => onYearSelect(year)}
                style={[
                  styles.yearButton,
                  isCurrentYear && styles.currentYearButton,
                  isOutsideDecade && styles.outsideDecadeButton
                ]}
              >
                <YearEmojiIndicator 
                  year={year} 
                  currentYear={currentDate.getFullYear()} 
                />
                <Text 
                  style={[
                    styles.yearText,
                    isCurrentYear && styles.currentYearText,
                    isOutsideDecade && styles.outsideDecadeText
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  yearSelectorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  yearSelectorContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: normalize(20),
    width: '80%',
    maxWidth: normalize(320),
    padding: normalize(16),
  },
  yearSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(16),
    paddingHorizontal: normalize(8),
  },
  decadeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  decadeButton: {
    padding: normalize(4),
  },
  decadeText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
  decadeEmoji: {
    fontSize: normalize(20),
  },
  yearsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: normalize(16),
  },
  yearButton: {
    width: '30%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(8),
    backgroundColor: '#2A2A2A',
    borderRadius: normalize(12),
    padding: normalize(8),
    overflow: 'hidden', 
  },
  currentYearButton: {
    backgroundColor: '#6C63FF',
  },
  outsideDecadeButton: {
    opacity: 0.5,
  },
  yearText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    marginTop: normalize(2),
  },
  currentYearText: {
    fontWeight: 'bold',
  },
  outsideDecadeText: {
    color: '#AAAAAA',
  },
  emojiText: {
    fontSize: normalize(18),
    marginBottom: normalize(2),
  },
  closeButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: normalize(12),
    padding: normalize(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(8),
    marginBottom: normalize(16),
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontWeight: 'bold',
  },
  closeEmoji: {
    fontSize: normalize(16),
  },
});

export default YearSelector;