import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../components/Alert';
import { addMood } from '../service/moodService';
import { getTags, addTag } from '../service/tagService';
import { MoodOption, moodOptions } from '../constants/moodOptions';
import { normalize } from '../utils/normalize';
import { Category } from '../types/Category';
import { getCategories } from '../service/categoryService';
import { Food, FoodInput } from '../service/foodService';
import { useFood } from '../hooks/useFood';

interface SelectedFood extends Food {
  quantity: number;
}

const MoodOptionComponent: React.FC<{ 
  item: MoodOption; 
  isSelected: boolean; 
  onSelect: (mood: MoodOption) => void 
}> = React.memo(({ item, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[
      styles.moodOption,
      isSelected && { backgroundColor: item.color, elevation: 6 }
    ]}
    onPress={() => onSelect(item)}
  >
    <Text style={styles.moodEmoji}>{item.emoji}</Text>
    <Text style={styles.moodText} numberOfLines={2} ellipsizeMode="tail">{item.mood}</Text>
  </TouchableOpacity>
));

const AddMood: React.FC = () => {
  const navigation = useNavigation();
  const { foods, isLoading, error, fetchFoods, addUserFoods } = useFood();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  useEffect(() => {
    fetchFoods();
    loadCategories();
    fetchTags();
  }, []);

  const loadCategories = async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      Alert.alert('Hata', 'Kategoriler yüklenemedi');
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFoods();
    await loadCategories();
    setRefreshing(false);
  }, [fetchFoods]);

  const filteredFoods = useMemo(() => {
    return selectedCategory
      ? foods.filter((food) => food.categoryId === selectedCategory)
      : foods;
  }, [foods, selectedCategory]);

  const handleCategoryPress = useCallback((categoryId: number) => {
    setSelectedCategory((prevCategory) => {
      const newCategory = categoryId === prevCategory ? null : categoryId;
      fetchFoods();
      return newCategory;
    });
  }, [fetchFoods]);

  const handleFoodSelect = useCallback((food: Food) => {
    setSelectedFoods(prev => {
      const existingIndex = prev.findIndex(item => item.id === food.id);
      if (existingIndex !== -1) {
        return prev.filter((_, index) => index !== existingIndex);
      }
      return [...prev, { ...food, quantity: 1 }];
    });
  }, []);

  const handleQuantityChange = useCallback((foodId: number, quantity: string) => {
    const numQuantity = parseInt(quantity) || 0;
    setSelectedFoods(prev => 
      prev.map(item => 
        item.id === foodId 
          ? { ...item, quantity: numQuantity } 
          : item
      )
    );
  }, []);

  const fetchTags = async () => {
    try {
      const fetchedTags = await getTags();
      setTags(fetchedTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setAlertMessage('Etiketler yüklenirken bir hata oluştu.');
      setAlertType('error');
    }
  };

  const handleMoodSelect = useCallback((mood: MoodOption) => {
    setSelectedMood(mood);
  }, []);

  const handleTagCreation = useCallback(async () => {
    if (!newTagName.trim()) {
      setAlertMessage('Lütfen bir etiket adı girin.');
      setAlertType('warning');
      return;
    }
    try {
      const newTag = await addTag({ name: newTagName.trim(), isPublic: true });
      setAlertMessage('Etiket başarıyla oluşturuldu.');
      setAlertType('success');
      setNewTagName('');
      await fetchTags();
      setSelectedTags(prev => [...prev, newTag.id]);
    } catch (error) {
      console.error('Error adding tag:', error);
      setAlertMessage('Etiket oluşturulurken bir hata oluştu.');
      setAlertType('error');
    }
  }, [newTagName]);

  const handleTagSelect = useCallback((tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedMood) {
      setAlertMessage('Lütfen bir duygu durumu seçin.');
      setAlertType('warning');
      return;
    }
  
    if (!title) {
      setAlertMessage('Lütfen bir başlık girin.');
      setAlertType('warning');
      return;
    }
  
    if (selectedFoods.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir yiyecek seçin.');
      return;
    }
  
    try {
      const newMood = {
        title,
        description,
        emoji: selectedMood.emoji,
        tags: selectedTags.map(id => parseInt(id, 10)),
      };
      await addMood(newMood);
      const foodInputs: FoodInput[] = selectedFoods.map(({ id, name, calories, categoryId, quantity }) => ({
        id,
        name,
        calories,
        categoryId,
        quantity
      }));
      await addUserFoods(foodInputs);
      
      setAlertMessage('Duygu durumu ve yiyecekler başarıyla kaydedildi.');
      setAlertType('success');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving mood and foods:', error);
      setAlertMessage('Duygu durumu ve yiyecekler kaydedilirken bir hata oluştu.');
      setAlertType('error');
    }
  }, [selectedMood, title, description, selectedTags, selectedFoods, navigation, addUserFoods]);

  const renderMoodOption = useCallback(({ item }: { item: MoodOption }) => (
    <MoodOptionComponent
      item={item}
      isSelected={selectedMood?.emoji === item.emoji}
      onSelect={handleMoodSelect}
    />
  ), [selectedMood, handleMoodSelect]);

  const renderTag = useCallback(({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[styles.tag, selectedTags.includes(item.id) && styles.selectedTag]}
      onPress={() => handleTagSelect(item.id)}
    >
      <Text style={styles.tagText}>{item.name}</Text>
    </TouchableOpacity>
  ), [selectedTags, handleTagSelect]);

  const memoizedMoodOptions = useMemo(() => moodOptions, []);

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Hata: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Duygu Durumu Ekle</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        {alertMessage && <CustomAlert type={alertType} message={alertMessage} />}

        <FlatList
          data={memoizedMoodOptions}
          renderItem={renderMoodOption}
          keyExtractor={item => item.id.toString()}
          numColumns={4}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.moodList}
          ListHeaderComponent={
            <>
              <Text style={styles.sectionTitle}>Duygu Durumu Seçin</Text>
              <Text style={styles.sectionSubtitle}>Şu anki hissinizi en iyi tanımlayan duyguyu seçin</Text>
            </>
          }
          ListFooterComponent={
            <>
              <Text style={styles.sectionTitle}>Detaylar</Text>
              <TextInput
                style={styles.input}
                placeholder="Başlık"
                placeholderTextColor="#B0B0B0"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Açıklama (isteğe bağlı)"
                placeholderTextColor="#B0B0B0"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <Text style={styles.sectionTitle}>Etiketler</Text>
              <FlatList
                data={tags}
                renderItem={renderTag}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagList}
              />
              <View style={styles.tagContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Yeni etiket oluştur"
                  placeholderTextColor="#B0B0B0"
                  value={newTagName}
                  onChangeText={setNewTagName}
                />
                <TouchableOpacity style={styles.addTagButton} onPress={handleTagCreation}>
                  <Text style={styles.addTagButtonText}>Ekle</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionTitle}>Yiyecekler</Text>
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      selectedCategory === item.id && styles.selectedCategory,
                    ]}
                    onPress={() => handleCategoryPress(item.id)}
                  >
                    <Text style={styles.categoryButtonText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                style={styles.categoryList}
              />
              <FlatList
                data={filteredFoods}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.foodItem,
                      selectedFoods.some(f => f.id === item.id) && styles.selectedFoodItem
                    ]}
                    onPress={() => handleFoodSelect(item)}
                  >
                    <Text style={styles.foodItemText}>{item.name}</Text>
                    {selectedFoods.some(f => f.id === item.id) && (
                      <TextInput
                        style={styles.quantityInput}
                        keyboardType="numeric"
                        value={selectedFoods.find(f => f.id === item.id)?.quantity.toString() || ''}
                        onChangeText={(text) => handleQuantityChange(item.id, text)}
                      />
                    )}
                  </TouchableOpacity>
                )}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Durum bilgisi ve yiyecekleri kaydet</Text>
              </TouchableOpacity>
            </>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  backButton: {
    marginRight: normalize(16),
  },
  headerTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Roboto_700Bold',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: normalize(8),
    fontFamily: 'Roboto_700Bold',
    marginTop: normalize(20),
  },
  sectionSubtitle: {
    fontSize: normalize(14),
    color: '#B0B0B0',
    marginBottom: normalize(16),
    fontFamily: 'Roboto_400Regular',
  },
  moodList: {
    paddingHorizontal: normalize(16),
  },
  moodOption: {
    padding: normalize(8),
    borderRadius: normalize(16),
    backgroundColor: '#1E1E1E',
    margin: normalize(4),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    aspectRatio: 1,
  },
  moodEmoji: {
    fontSize: normalize(28),
    marginBottom: normalize(4),
  },
  moodText: {
    fontSize: normalize(10),
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Roboto_400Regular',
    height: normalize(24),
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: normalize(8),
    padding: normalize(12),
    marginBottom: normalize(12),
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    fontSize: normalize(16),
  },
  textArea: {
    height: normalize(120),
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: normalize(8),
    padding: normalize(16),
    alignItems: 'center',
    marginTop: normalize(16),
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(18),
    fontWeight: 'bold',
    fontFamily: 'Roboto_700Bold',
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: normalize(8),
    padding: normalize(12),
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    fontSize: normalize(16),
    marginRight: normalize(8),
  },
  addTagButton: {
    backgroundColor: '#4CAF50',
    borderRadius: normalize(8),
    padding: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: 'bold',
    fontFamily: 'Roboto_700Bold',
  },
  tagList: {
    paddingVertical: normalize(8),
  },
  tag: {
    backgroundColor: '#1E1E1E',
    borderRadius: normalize(16),
    padding: normalize(8),
    marginRight: normalize(8),
  },
  selectedTag: {
    backgroundColor: '#4CAF50',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontFamily: 'Roboto_400Regular',
  },
  categoryList: {
    paddingVertical: normalize(10),
    backgroundColor: '#1E1E1E',
  },
  categoryButton: {
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(10),
    marginHorizontal: normalize(5),
    borderRadius: normalize(20),
    backgroundColor: '#2C2C2C',
  },
  selectedCategory: {
    backgroundColor: '#4a90e2',
  },
  categoryButtonText: {
    fontFamily: 'Roboto_400Regular',
    color: '#FFFFFF',
  },
  foodItem: {
    backgroundColor: '#1E1E1E',
    padding: normalize(12),
    marginBottom: normalize(8),
    borderRadius: normalize(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedFoodItem: {
    backgroundColor: '#2C2C2C',
  },
  foodItemText: {
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    fontSize: normalize(16),
  },
  quantityInput: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    padding: normalize(4),
    borderRadius: normalize(4),
    width: normalize(40),
    textAlign: 'center',
  },
});

export default React.memo(AddMood);