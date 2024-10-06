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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { Ionicons } from '@expo/vector-icons';
import Alert from '../components/Alert';
import { addMood } from '../service/moodService';
import { getTags, addTag } from '../service/tagService';
import { MoodOption, moodOptions } from '../constants/moodOptions';
import { normalize } from '../utils/normalize';

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
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  useEffect(() => {
    fetchTags();
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
  
    try {
      const newMood = {
        title,
        description,
        emoji: selectedMood.emoji,
        tags: selectedTags.map(id => parseInt(id, 10)),
      };
      await addMood(newMood);
      
      setAlertMessage('Duygu durumu başarıyla kaydedildi.');
      setAlertType('success');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving mood:', error);
      setAlertMessage('Duygu durumu kaydedilirken bir hata oluştu.');
      setAlertType('error');
    }
  }, [selectedMood, title, description, selectedTags, navigation]);

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
    return null;
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
        {alertMessage && <Alert type={alertType} message={alertMessage} />}

        <FlatList
          data={memoizedMoodOptions}
          renderItem={renderMoodOption}
          keyExtractor={item => item.id}
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
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Durum bilgisi kaydet</Text>
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
});

export default React.memo(AddMood);