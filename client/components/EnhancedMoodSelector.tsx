import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 320;

const normalize = (size: number): number => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

const moodOptions = [
  { id: '1', mood: 'Coşkulu 🤩', color: '#FFD700' },
  { id: '2', mood: 'Mutlu 😊', color: '#FF69B4' },
  { id: '3', mood: 'Heyecanlı 🥳', color: '#98FB98' },
  { id: '4', mood: 'Neşeli 😄', color: '#FFA07A' },
  { id: '5', mood: 'Sevgi dolu 🥰', color: '#FF69B4' },
  { id: '6', mood: 'Minnettar 🙏', color: '#DDA0DD' },
  { id: '7', mood: 'Huzurlu 😌', color: '#87CEEB' },
  { id: '8', mood: 'Enerjik ⚡️', color: '#FFD700' },
  { id: '9', mood: 'Sakin 😐', color: '#D3D3D3' },
  { id: '10', mood: 'Düşünceli 🤔', color: '#B8B8B8' },
  { id: '11', mood: 'Uykulu 😴', color: '#C0C0C0' },
  { id: '12', mood: 'Meşgul 💭', color: '#A9A9A9' },
  { id: '13', mood: 'Kafası karışık 😕', color: '#A9A9A9' },
  { id: '14', mood: 'Yorgun 😮‍💨', color: '#A9A9A9' },
  { id: '15', mood: 'Üzgün 😢', color: '#4169E1' },
  { id: '16', mood: 'Stresli 😰', color: '#FF6347' },
  { id: '17', mood: 'Sinirli 😤', color: '#FF4500' },
  { id: '18', mood: 'Endişeli 😟', color: '#8B0000' },
  { id: '19', mood: 'Hayal kırıklığı 😞', color: '#4B0082' },
  { id: '20', mood: 'Öfkeli 😠', color: '#DC143C' },
  { id: '21', mood: 'Kırgın 💔', color: '#8B0000' },
  { id: '22', mood: 'Hasta 🤒', color: '#DEB887' },
  { id: '23', mood: 'Enerjik 💪', color: '#FFD700' },
  { id: '24', mood: 'Uykusuz 🥱', color: '#8B4513' },
  { id: '25', mood: 'Dinlenmiş ✨', color: '#98FB98' },
  { id: '26', mood: 'Ağrılı 🤕', color: '#8B0000' },
  { id: '27', mood: 'İlhamlı 💫', color: '#9370DB' },
  { id: '28', mood: 'Yaratıcı 🎨', color: '#BA55D3' },
  { id: '29', mood: 'Odaklanmış 🎯', color: '#4B0082' },
  { id: '30', mood: 'Hayalperest 🌟', color: '#9932CC' },
];

interface MoodOptionProps {
  item: {
    id: string;
    mood: string;
    color: string;
  };
  isSelected: boolean;
  onSelect: (item: MoodOptionProps['item']) => void;
}

const MoodOption: React.FC<MoodOptionProps> = React.memo(({ item, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[
      styles.moodOption,
      isSelected && { backgroundColor: item.color, elevation: 6 }
    ]}
    onPress={() => onSelect(item)}
  >
    <Text style={styles.moodText}>{item.mood}</Text>
  </TouchableOpacity>
));

interface EnhancedMoodSelectorProps {
  selectedMood: MoodOptionProps['item'] | null;
  onMoodSelect: MoodOptionProps['onSelect'];
}

const EnhancedMoodSelector: React.FC<EnhancedMoodSelectorProps> = ({ selectedMood, onMoodSelect }) => {
  const renderItem = useMemo(() => ({ item }: { item: MoodOptionProps['item'] }) => (
    <MoodOption
      item={item}
      isSelected={selectedMood?.id === item.id}
      onSelect={onMoodSelect}
    />
  ), [selectedMood, onMoodSelect]);

  const keyExtractor = useMemo(() => (item: MoodOptionProps['item']) => item.id, []);

  return (
    <FlatList
      data={moodOptions}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      getItemLayout={(data, index) => ({
        length: normalize(60),
        offset: normalize(60) * index,
        index,
      })}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: normalize(8),
  },
  moodOption: {
    flex: 1,
    aspectRatio: 2.5,
    margin: normalize(4),
    padding: normalize(8),
    borderRadius: normalize(12),
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodText: {
    fontSize: normalize(14),
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default EnhancedMoodSelector;