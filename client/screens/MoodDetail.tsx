import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import useMood from '../hooks/useMood';
import Alert from '../components/Alert';

type RootStackParamList = {
  MoodDetail: { moodId: string };
  Home: undefined;
};

type MoodDetailRouteProp = RouteProp<RootStackParamList, 'MoodDetail'>;
type MoodDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MoodDetail'>;

interface MoodDetailProps {
  route: MoodDetailRouteProp;
}

const MoodDetail: React.FC<MoodDetailProps> = ({ route }) => {
  const { moodId } = route.params;
  const { moods, fetchMoods, deleteMood, isLoading, error: moodError } = useMood();
  const navigation = useNavigation<MoodDetailNavigationProp>();

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  const mood = useMemo(() => moods.find(m => m.id === moodId), [moods, moodId]);

  const handleDelete = useCallback(async () => {
    if (!mood) return;
    try {
      await deleteMood(mood.id);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting mood:', error);
    }
  }, [mood, deleteMood, navigation]);

  const renderTag = useCallback((tag: string | { name: string }, index: number) => (
    <View key={index} style={styles.tag}>
      <Text style={styles.tagText}>
        {typeof tag === 'string' ? tag : tag.name || 'Unknown Tag'}
      </Text>
    </View>
  ), []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!mood) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Mood not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {moodError && <Alert type="error" message={moodError} />}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{mood.title}</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.emoji}>{mood.emoji}</Text>
          <Text style={styles.description}>{mood.description}</Text>
          {mood.tags && mood.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {mood.tags.map(renderTag)}
            </View>
          )}
          <Text style={styles.date}>
            {new Date(mood.createdAt).toLocaleString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  emoji: {
    fontSize: 72,
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 24,
    lineHeight: 26,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  date: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'right',
  },
});

export default React.memo(MoodDetail);