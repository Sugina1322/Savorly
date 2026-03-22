import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { useSettings } from '@/components/settings-provider';
import { AVATAR_OPTIONS, getAvatarOption, getDisplayName, getHandle } from '@/utils/profile';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, user } = useAuth();
  const { theme } = useSettings();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarKey, setAvatarKey] = useState(AVATAR_OPTIONS[0]?.key ?? 'chef');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/sign-in');
      return;
    }

    setFullName(profile?.full_name ?? getDisplayName(null, user.email));
    setUsername(profile?.username ?? user.email?.split('@')[0]?.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase() ?? '');
    setBio(profile?.bio ?? '');
    setAvatarKey(profile?.avatar_key ?? AVATAR_OPTIONS[0]?.key ?? 'chef');
  }, [profile?.avatar_key, profile?.bio, profile?.full_name, profile?.username, user]);

  const selectedAvatar = getAvatarOption(avatarKey);
  const previewName = fullName.trim() || getDisplayName(profile?.full_name, user?.email);
  const previewHandle = getHandle(username, user?.email);

  async function handleSave() {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      await updateProfile({
        fullName,
        username,
        bio,
        avatarKey,
      });
      setSuccessMessage('Profile updated.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save your profile right now.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.appBackground }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 10) + 6,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.shell}>
          <Pressable style={[styles.backButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color="#251712" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Edit profile</Text>
            <Text style={styles.subtitle}>Customize how your account looks across Savorly.</Text>
          </View>

          <View style={[styles.previewCard, { backgroundColor: theme.heroBackground }]}>
            <View style={[styles.previewAvatar, { backgroundColor: selectedAvatar.backgroundColor }]}>
              <Text style={styles.previewAvatarEmoji}>{selectedAvatar.emoji}</Text>
            </View>

            <View style={styles.previewBody}>
              <Text style={styles.previewName}>{previewName}</Text>
              <Text style={styles.previewHandle}>{previewHandle}</Text>
              <Text style={styles.previewBio}>
                {bio.trim() || 'Add a short bio so your profile feels more like you.'}
              </Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.sectionTitle}>Profile details</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Display name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="What should people call you?"
                placeholderTextColor="#9C8B82"
                style={[styles.input, { borderColor: theme.border }]}
                maxLength={40}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                value={username}
                onChangeText={(value) => setUsername(value.replace(/\s+/g, '').toLowerCase())}
                placeholder="your.handle"
                placeholderTextColor="#9C8B82"
                autoCapitalize="none"
                style={[styles.input, { borderColor: theme.border }]}
                maxLength={20}
              />
              <Text style={styles.helperText}>3-20 characters, using letters, numbers, dots, or underscores.</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Home cook, dessert hunter, late-night noodle expert..."
                placeholderTextColor="#9C8B82"
                style={[styles.input, styles.bioInput, { borderColor: theme.border }]}
                multiline
                textAlignVertical="top"
                maxLength={120}
              />
              <Text style={styles.helperText}>{bio.length}/120</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.sectionTitle}>Choose your avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((option) => {
                const isSelected = option.key === avatarKey;

                return (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.avatarOption,
                      { borderColor: theme.border, backgroundColor: theme.appBackground },
                      isSelected && [styles.avatarOptionSelected, { borderColor: theme.accent, backgroundColor: theme.accentSoft }],
                    ]}
                    onPress={() => setAvatarKey(option.key)}>
                    <View style={[styles.avatarBubble, { backgroundColor: option.backgroundColor }]}>
                      <Text style={styles.avatarEmoji}>{option.emoji}</Text>
                    </View>
                    <Text style={[styles.avatarLabel, isSelected && { color: theme.accent }]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

          <Pressable style={[styles.saveButton, { backgroundColor: theme.accent }, isSaving && styles.buttonDisabled]} onPress={handleSave} disabled={isSaving}>
            <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save profile'}</Text>
          </Pressable>
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
    paddingBottom: 36,
    flexGrow: 1,
  },
  shell: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFF8F2',
    borderWidth: 1,
    borderColor: '#F0DDD0',
  },
  backText: {
    color: '#251712',
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    marginTop: 18,
    marginBottom: 18,
  },
  title: {
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
  previewCard: {
    borderRadius: 30,
    backgroundColor: '#201612',
    padding: 20,
    flexDirection: 'row',
    gap: 16,
  },
  previewAvatar: {
    width: 78,
    height: 78,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatarEmoji: {
    fontSize: 34,
  },
  previewBody: {
    flex: 1,
  },
  previewName: {
    color: '#FFF6F0',
    fontSize: 24,
    fontWeight: '900',
  },
  previewHandle: {
    marginTop: 4,
    color: '#E4C7B7',
    fontSize: 14,
    fontWeight: '700',
  },
  previewBio: {
    marginTop: 12,
    color: '#D6C2B8',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    marginTop: 16,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0DDD0',
    padding: 18,
  },
  sectionTitle: {
    color: '#241611',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 10,
  },
  fieldGroup: {
    marginTop: 8,
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
  bioInput: {
    minHeight: 110,
  },
  helperText: {
    marginTop: 7,
    color: '#8A7B73',
    fontSize: 12,
    fontWeight: '600',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: 6,
  },
  avatarOption: {
    width: '31%',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F0DDD0',
    backgroundColor: '#FFF9F5',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionSelected: {
    borderColor: '#C7512D',
    backgroundColor: '#FFF1EA',
  },
  avatarBubble: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 25,
  },
  avatarLabel: {
    marginTop: 8,
    color: '#3A2620',
    fontSize: 13,
    fontWeight: '800',
  },
  errorText: {
    marginTop: 16,
    color: '#B1382F',
    fontSize: 13,
    fontWeight: '700',
  },
  successText: {
    marginTop: 16,
    color: '#2D7B53',
    fontSize: 13,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: '#C7512D',
    alignItems: 'center',
    paddingVertical: 15,
  },
  saveButtonText: {
    color: '#FFF8F2',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
