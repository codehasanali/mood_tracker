import React, { useState } from 'react';
import { View, Text, Button, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTagContext } from '../context/tagContext';
import { Tag } from '../types/Tag';


interface TagSelectorProps {
  selectedTags: Tag[];
  onChangeSelectedTags: (tags: Tag[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onChangeSelectedTags }) => {
  const { tags, createTag } = useTagContext();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('');

  const toggleTagSelection = (tag: Tag) => {
    if (selectedTags.find((t) => t.id === tag.id)) {
      onChangeSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      onChangeSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddTag = async () => {
    if (newTagName.trim() === '') return;
    try {
      const newTag = await createTag({ name: newTagName, color: newTagColor });
      onChangeSelectedTags([...selectedTags, newTag]);
      setNewTagName('');
      setNewTagColor('');
    } catch (error) {
      console.error('Error adding new tag:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Tags</Text>
      <FlatList
        data={tags}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedTags.some((tag) => tag.id === item.id);
          return (
            <TouchableOpacity
              style={[styles.tagItem, isSelected && styles.selectedTag]}
              onPress={() => toggleTagSelection(item)}
            >
              <Text style={{ color: item.color || '#000' }}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagList}
      />
      <View style={styles.addTagContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Tag Name"
          value={newTagName}
          onChangeText={setNewTagName}
        />
        <TextInput
          style={styles.input}
          placeholder="Color (e.g., #FF0000)"
          value={newTagColor}
          onChangeText={setNewTagColor}
        />
        <Button title="Add Tag" onPress={handleAddTag} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  tagList: {
    marginBottom: 16,
  },
  tagItem: {
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  selectedTag: {
    backgroundColor: '#e0e0e0',
  },
  addTagContainer: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
});

export default TagSelector;