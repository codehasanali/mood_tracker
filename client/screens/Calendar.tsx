import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useIsFocused } from '@react-navigation/native';
import BottomSheet from '@gorhom/bottom-sheet';
import useMood from '../hooks/useMood';
import { tr } from 'date-fns/locale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;

const normalize = (size: number) => Math.round(size * scale);

const DAY_SIZE = SCREEN_WIDTH / 7 - normalize(10);

const CalendarWithPicker: React.FC = () => {
  const navigation = useNavigation();
  const { moods, fetchMoods } = useMood();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dailyMood, setDailyMood] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [yearSelectorVisible, setYearSelectorVisible] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  useFocusEffect(
    useCallback(() => {
      fetchMoods();
      return () => {
        bottomSheetRef.current?.close();
        setIsBottomSheetOpen(false);
        setDailyMood([]);
        setSelectedDate(null);
      };
    }, [fetchMoods])
  );

  useEffect(() => {
    if (isBottomSheetOpen) {
      navigation.setOptions({
        tabBarStyle: { display: 'none' },
      });
    } else {
      navigation.setOptions({
        tabBarStyle: { 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
        },
      });
    }
  }, [isBottomSheetOpen, navigation]);

  useEffect(() => {
    if (!isFocused) {
      bottomSheetRef.current?.close();
      setIsBottomSheetOpen(false);
      setDailyMood([]);
      setSelectedDate(null);
    }
  }, [isFocused]);

  const handleDatePress = useCallback((date: string) => {
    const moodForDate = moods.filter(mood => mood.createdAt.startsWith(date));
    if (moodForDate.length > 0) {
      setDailyMood(moodForDate);
      setSelectedDate(date);
      bottomSheetRef.current?.expand();
      setIsBottomSheetOpen(true);
    }
  }, [moods]);

  const changeMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      return viewMode === 'month'
        ? direction === 'next' ? addMonths(prevDate, 1) : subMonths(prevDate, 1)
        : direction === 'next' ? addWeeks(prevDate, 1) : subWeeks(prevDate, 1);
    });
  }, [viewMode]);

  const changeYear = useCallback((year: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(year);
      return newDate;
    });
    setYearSelectorVisible(false);
  }, []);

  const renderCalendar = useCallback(() => {
    const start = viewMode === 'month' ? startOfMonth(currentDate) : startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = viewMode === 'month' ? endOfMonth(currentDate) : endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    return (
      <>
        <View style={styles.weekDaysContainer}>
          {weekDays.map(day => <Text key={day} style={styles.weekDayText}>{day}</Text>)}
        </View>
        <View style={styles.calendarGrid}>
          {viewMode === 'month' && Array.from({ length: start.getDay() - 1 }, (_, i) => (
            <View key={`empty-${i}`} style={styles.dayContainer} />
          ))}
          {days.map(day => {
            const dateString = format(day, 'yyyy-MM-dd');
            const moodForDate = moods.find(mood => mood.createdAt.startsWith(dateString));
            const emoji = moodForDate ? moodForDate.emoji : '';
            const isOutsideMonth = viewMode === 'month' && format(day, 'MM') !== format(currentDate, 'MM');

            return (
              <TouchableOpacity 
                key={dateString} 
                onPress={() => handleDatePress(dateString)} 
                style={[styles.dayContainer, viewMode === 'week' && styles.weekDayContainer]}
              >
                <View style={[styles.emojiContainer, isOutsideMonth && styles.outsideMonthDay]}>
                  {emoji ? <Text style={styles.emoji}>{emoji}</Text> : <Text style={[styles.dayText, isOutsideMonth && styles.outsideMonthDayText]}>{format(day, 'd')}</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </>
    );
  }, [currentDate, viewMode, moods, handleDatePress]);

  const renderYearSelector = useCallback(() => {
    const currentYear = currentDate.getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    return (
      <View style={styles.yearSelectorOverlay}>
        <View style={styles.yearSelectorContainer}>
          {years.map(year => (
            <TouchableOpacity key={year} onPress={() => changeYear(year)} style={styles.yearButton}>
              <Text style={[styles.yearButtonText, year === currentYear && styles.currentYearText]}>{year}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.closeYearSelectorButton} onPress={() => setYearSelectorVisible(false)}>
            <Ionicons name="chevron-up" size={normalize(24)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [currentDate, changeYear]);

  const renderMoodDetail = useCallback((mood: any) => {
    const getRandomPastelColor = () => `rgb(${Math.floor(Math.random() * 55 + 200)},${Math.floor(Math.random() * 55 + 200)},${Math.floor(Math.random() * 55 + 200)})`;
    const backgroundColor = getRandomPastelColor();

    return (
      <View key={mood.id} style={[styles.moodDetail, { backgroundColor }]}>
        <View style={styles.moodHeader}>
          <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          <View style={styles.moodTags}>
            {mood.tags && mood.tags.map((tag: any) => (
              <View key={tag.id} style={styles.tag}>
                <Text style={styles.tagText}>{tag.name}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.moodTitle}>{mood.title}</Text>
        <Text style={styles.moodDescription} numberOfLines={2} ellipsizeMode="tail">{mood.description}</Text>
        {mood.image && (
          <Image source={{ uri: mood.image }} style={styles.moodImage} />
        )}
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Takvimim</Text>
        <View style={styles.viewModeContainer}>
          <TouchableOpacity style={[styles.viewModeButton, viewMode === 'month' && styles.activeViewMode]} onPress={() => setViewMode('month')}>
            <Text style={[styles.viewModeText, viewMode === 'month' && styles.activeViewModeText]}>Ay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.viewModeButton, viewMode === 'week' && styles.activeViewMode]} onPress={() => setViewMode('week')}>
            <Text style={[styles.viewModeText, viewMode === 'week' && styles.activeViewModeText]}>Hafta</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.monthYearSelector}>
          <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.arrowButton}>
            <Ionicons name="chevron-back" size={normalize(24)} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setYearSelectorVisible(true)} style={styles.yearSelector}>
            <Text style={styles.monthYearText}>{format(currentDate, 'MMMM yyyy', { locale: tr })}</Text>
            <Ionicons name="chevron-down" size={normalize(24)} color="#FFFFFF" style={styles.yearSelectorIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeMonth('next')} style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={normalize(24)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
        {renderCalendar()}
      </ScrollView>

      {yearSelectorVisible && renderYearSelector()}

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['70%']}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        style={styles.bottomSheet}
        onChange={(index) => {
          setIsBottomSheetOpen(index !== -1);
          if (index === -1) {
            setDailyMood([]);
            setSelectedDate(null);
          }
        }}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>
            {selectedDate ? format(new Date(selectedDate), 'd MMMM yyyy', { locale: tr }) : ''}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.bottomSheetScrollContent}>
            {dailyMood.map(renderMoodDetail)}
          </ScrollView>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: normalize(20),
    backgroundColor: '#1A1A1A',
  },
  headerContainer: {
    flexDirection: 'column',
    marginBottom: normalize(20),
    marginTop: normalize(20),
  },
  title: {
    fontSize: normalize(28),
    color: '#FFFFFF',
    marginBottom: normalize(10),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: normalize(20),
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: normalize(10),
  },
  viewModeButton: {
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(10),
  },
  activeViewMode: {
    backgroundColor: '#FFFFFF',
  },
  viewModeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: normalize(14),
  },
  activeViewModeText: {
    color: '#000000',
  },
  monthYearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2A2A2A',
    borderRadius: normalize(20),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5),
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  monthYearText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: normalize(16),
  },
  yearSelectorIcon: {
    marginLeft: normalize(5),
  },
  arrowButton: {
    padding: normalize(5),
  },
  calendarContainer: {
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayContainer: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(10),
  },
  weekDayContainer: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
  },
  emojiContainer: {
    backgroundColor: 'rgba(42, 42, 42, 0.7)',
    width: '80%',
    height: '80%',
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#808080',
  },
  emoji: {
    fontSize: normalize(20),
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
  outsideMonthDay: {
    opacity: 0.3,
  },
  outsideMonthDayText: {
    color: '#888888',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: normalize(10),
  },
  weekDayText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontWeight: 'bold',
    width: `${100 / 7}%`,
    textAlign: 'center',
  },
  yearSelectorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearSelectorContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: normalize(20),
    padding: normalize(20),
    width: '60%',
    maxHeight: '80%',
  },
  yearButton: {
    paddingVertical: normalize(10),
    alignItems: 'center',
  },
  yearButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(18),
  },
  currentYearText: {
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  closeYearSelectorButton: {
    alignItems: 'center',
    paddingTop: normalize(15),
    borderTopWidth: 1,
    borderTopColor: '#333333',
    marginTop: normalize(10),
  },
  bottomSheet: {
    zIndex: 1000,
  },
  bottomSheetBackground: {
    backgroundColor: '#1E1E1E',
  },
  bottomSheetIndicator: {
    backgroundColor: '#FFFFFF',
  },
  bottomSheetContent: {
    flex: 1,
    padding: normalize(15),
  },
  bottomSheetScrollContent: {
    paddingBottom: normalize(30),
  },
  bottomSheetTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: normalize(15),
    textAlign: 'center',
  },
  moodDetail: {
    marginBottom: normalize(12),
    padding: normalize(15),
    borderRadius: normalize(12),
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  moodEmoji: {
    fontSize: normalize(24),
    marginRight: normalize(12),
  },
  moodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  tag: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    marginRight: normalize(6),
    marginBottom: normalize(6),
  },
  tagText: {
    color: '#000000',
    fontSize: normalize(10),
    fontWeight: '600',
  },
  moodTitle: {
    fontWeight: 'bold',
    color: '#000000',
    fontSize: normalize(16),
    marginBottom: normalize(6),
  },
  moodDescription: {
    color: '#000000',
    fontSize: normalize(12),
    lineHeight: normalize(18),
    marginBottom: normalize(8),
  },
  moodImage: {
    width: '100%',
    height: normalize(120),
    borderRadius: normalize(8),
    marginTop: normalize(8),
  },
});

export default CalendarWithPicker;