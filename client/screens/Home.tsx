import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, PixelRatio, Platform, TouchableOpacity, RefreshControl } from 'react-native';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useMood from '../hooks/useMood';
import useUser from '../hooks/useUser';
import { GroupedMoods, Mood } from '../types/Mood';
import CardMood from '../components/CardModel/CardModel';
import Alert from '../components/Alert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;

const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(Platform.OS === 'ios' ? PixelRatio.roundToNearestPixel(newSize) : PixelRatio.roundToNearestPixel(newSize) - 2);
};

const TAB_BAR_HEIGHT = 60;

type HomeScreenNavigationProp = NativeStackNavigationProp<any, 'Stack'>;

const getGreeting = (username: string): string => {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) return `Günaydın, ${username}!`;
  if (currentHour >= 12 && currentHour < 18) return `İyi Günler, ${username}!`;
  if (currentHour >= 18 && currentHour < 22) return `İyi Akşamlar, ${username}!`;
  return `İyi Geceler, ${username}!`;
};

const getSubtitle = (): string => {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) return 'Güne güzel başla, gününü güzelleştir!';
  if (currentHour >= 12 && currentHour < 18) return 'Öğleden sonra enerjini yükselt!';
  if (currentHour >= 18 && currentHour < 22) return 'Akşamın huzurunu hisset!';
  return 'Gecenin sessizliğinde kendini dinle!';
};

const HomeScreen: React.FC = () => {
  const { fetchMoods, moods, error, isLoading } = useMood();
  const { user, fetchUserProfile } = useUser();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });
  const [groupedMoods, setGroupedMoods] = useState<GroupedMoods[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);
  const isInitialMount = useRef(true);
  const lastFetchTime = useRef<number>(0);
  const FETCH_COOLDOWN = 5000; // 5 seconds cooldown

  useEffect(() => {
    if (moods && Array.isArray(moods)) {
      const grouped: { [key: string]: Mood[] } = {};
      moods.forEach((mood: Mood) => {
        const key = format(parseISO(mood.createdAt), 'yyyy-MM');
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(mood);
      });

      const newGroupedMoods = Object.entries(grouped)
        .map(([date, moods]) => ({ date, moods }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setGroupedMoods(newGroupedMoods);
    }
  }, [moods]);

  const shouldFetch = useCallback(() => {
    const now = Date.now();
    if (now - lastFetchTime.current >= FETCH_COOLDOWN) {
      lastFetchTime.current = now;
      return true;
    }
    return false;
  }, []);

  const loadMoods = useCallback(async () => {
    if (!shouldFetch()) return;
    
    try {
      if (isMounted.current) {
        await fetchMoods();
      }
    } catch (error) {
      console.error('Error loading moods:', error);
    }
  }, [fetchMoods, shouldFetch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      lastFetchTime.current = 0; // Reset cooldown for manual refresh
      await Promise.all([fetchUserProfile(), loadMoods()]);
    } finally {
      if (isMounted.current) {
        setRefreshing(false);
      }
    }
  }, [fetchUserProfile, loadMoods]);

  useEffect(() => {
    isMounted.current = true;
    loadMoods(); // Initial load
    return () => {
      isMounted.current = false;
    };
  }, [loadMoods]);

  useFocusEffect(
    useCallback(() => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      let isActive = true;
      const loadData = async () => {
        if (!shouldFetch()) return;
        
        try {
          if (isActive) {
            await Promise.all([fetchUserProfile(), loadMoods()]);
          }
        } catch (error) {
          console.error('Error loading data:', error);
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [fetchUserProfile, loadMoods, shouldFetch])
  );

  const navigateToMoodDetail = useCallback((moodId: string) => {
    navigation.navigate('MoodDetail', { moodId });
  }, [navigation]);

  const renderMoodItem = useCallback(({ item }: { item: Mood }) => (
    <TouchableOpacity onPress={() => navigateToMoodDetail(item.id)}>
      <CardMood
        date={item.createdAt}
        title={item.title}
        description={item.description}
        emoji={item.emoji}
        memoryCount={0}
      />
    </TouchableOpacity>
  ), [navigateToMoodDetail]);

  const renderMonthItem = useCallback(({ item }: { item: GroupedMoods }) => (
    <View style={styles.monthContainer}>
      <View style={styles.monthHeader}>
        <Text style={styles.monthDate}>
          {format(new Date(item.date), 'MMMM yyyy', { locale: tr })}
        </Text>
        <View style={styles.itemCountContainer}>
          <Text style={styles.itemCountText}>
            {item.moods.length} anı
          </Text>
        </View>
      </View>
      <FlatList
        data={item.moods}
        renderItem={renderMoodItem}
        keyExtractor={(mood) => mood.id.toString()}
        scrollEnabled={false}
      />
    </View>
  ), [renderMoodItem]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {error && <Alert type="error" message={error} />}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{getGreeting(user?.username || '')}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
      </View>

      <FlatList
        data={groupedMoods}
        keyExtractor={(item) => item.date}
        renderItem={renderMonthItem}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: TAB_BAR_HEIGHT + normalize(20) }]}
        ListEmptyComponent={
          <Text style={styles.noDataText}>
            {isLoading ? 'Yükleniyor...' : 'Şu anlık durum bilgisi yok.'}
          </Text>
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: normalize(15),
    paddingTop: normalize(30),
  },
  headerContainer: {
    marginBottom: normalize(15),
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  monthDate: {
    fontFamily: 'Roboto_700Bold',
    fontSize: normalize(20),
    color: '#FFFFFF',
  },
  itemCountContainer: {
    backgroundColor: '#2C2C2C',
    justifyContent: "flex-start",
    borderRadius: normalize(12),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    alignSelf: 'flex-end',
  },
  itemCountText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: normalize(14),
    color: '#B3B3B3',
  },
  title: {
    fontFamily: 'Roboto_700Bold',
    fontSize: normalize(24),
    fontWeight: 'bold',
    marginBottom: normalize(6),
    color: '#FFFFFF',
    marginTop: 25,
  },
  subtitle: {
    fontFamily: 'Roboto_400Regular',
    fontSize: normalize(16),
    color: '#B3B3B3',
  },
  contentContainer: {
    flexGrow: 1,
  },
  monthContainer: {
    marginBottom: normalize(15),
  },
  noDataText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: normalize(14),
    color: '#888888',
    textAlign: 'center',
    marginTop: normalize(15),
  },
});

export default React.memo(HomeScreen);