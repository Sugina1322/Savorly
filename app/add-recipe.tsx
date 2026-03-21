import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

export default function AddRecipeScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 420;
  const [title, setTitle] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [description, setDescription] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrap}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios-new" size={18} color="#251712" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.eyebrow}>Your recipe</Text>
            <Text style={styles.title}>Add something worth saving.</Text>
            <Text style={styles.subtitle}>
              Start building your own cookbook inside Savorly. You can wire this up to storage later.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Recipe title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Creamy garlic shrimp pasta"
                placeholderTextColor="#9C8B82"
                style={styles.input}
              />
            </View>

            <View style={[styles.row, isCompact && styles.rowCompact]}>
              <View style={[styles.fieldGroup, styles.rowField]}>
                <Text style={styles.label}>Cuisine</Text>
                <TextInput
                  value={cuisine}
                  onChangeText={setCuisine}
                  placeholder="Italian"
                  placeholderTextColor="#9C8B82"
                  style={styles.input}
                />
              </View>

              <View style={[styles.fieldGroup, styles.rowField]}>
                <Text style={styles.label}>Cook time</Text>
                <TextInput
                  value={cookTime}
                  onChangeText={setCookTime}
                  placeholder="30 min"
                  placeholderTextColor="#9C8B82"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Tell people why this recipe deserves a spot in their kitchen."
                placeholderTextColor="#9C8B82"
                multiline
                textAlignVertical="top"
                style={styles.textArea}
              />
            </View>

            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Save recipe</Text>
            </Pressable>

            <Text style={styles.helperText}>This screen is ready for your future recipe-save logic.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCF5EE',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 40,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  backText: {
    color: '#251712',
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    marginTop: 16,
    marginBottom: 20,
  },
  eyebrow: {
    color: '#A16244',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    marginTop: 8,
    color: '#251712',
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 8,
    color: '#6D5D55',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0DDD0',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowCompact: {
    flexDirection: 'column',
    gap: 0,
  },
  rowField: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#37241D',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EEDBCF',
    borderRadius: 18,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#251712',
    fontSize: 15,
  },
  textArea: {
    minHeight: 132,
    borderWidth: 1,
    borderColor: '#EEDBCF',
    borderRadius: 18,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#251712',
    fontSize: 15,
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 18,
    backgroundColor: '#C7512D',
    alignItems: 'center',
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: '#FFF8F2',
    fontSize: 15,
    fontWeight: '800',
  },
  helperText: {
    marginTop: 14,
    color: '#8A7B73',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
