import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
import { Tag } from '../types/Tag';
import { addMood } from '../service/moodService';
import TagSelector from './TagSelector';

const MoodForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const handleSaveMood = async () => {
    if (title.trim() === '' || description.trim() === '' || emoji.trim() === '') {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
  
    try {
      const tagIds = selectedTags.map((tag) => parseInt(tag.id));
      await addMood({
        title,
        description,
        emoji,
        tags: tagIds,
      });
      Alert.alert('Başarılı', 'Mood başarıyla kaydedildi.');
  
      setTitle('');
      setDescription('');
      setEmoji('');
      setSelectedTags([]);
    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert('Hata', 'Mood kaydedilirken bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Mood</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Emoji"
        value={emoji}
        onChangeText={setEmoji}
      />
      <TagSelector selectedTags={selectedTags} onChangeSelectedTags={setSelectedTags} />
      <Button title="Save Mood" onPress={handleSaveMood} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
});

export default MoodForm;