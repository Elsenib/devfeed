import React, { useState, useContext } from 'react';
import { Image, Platform, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import * as api from '../api';

export default function EditProfileScreen({ navigation, route }) {
  const { profile } = route.params || {};
  const { completeOnboarding } = useContext(AuthContext);
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [skillsText, setSkillsText] = useState((profile?.skills || []).join(', '));
  const [languagesText, setLanguagesText] = useState((profile?.languages || []).join(', '));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İcazə lazım', 'Profil şəkli seçmək üçün şəkil qovluğuna icazə verin.');
      }
    }
  };

  const handlePickImage = async () => {
    try {
      await requestPermission();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedAvatar({
          uri: asset.uri,
          name: asset.fileName || `avatar-${Date.now()}.jpg`,
          type: asset.type === 'image' ? asset.uri.split('.').pop().startsWith('jpeg') ? 'image/jpeg' : `image/${asset.uri.split('.').pop()}` : 'image/jpeg',
        });
      }
    } catch (err) {
      console.warn(err);
      setError('Şəkil seçərkən xəta baş verdi');
    }
  };

  const handleSave = async () => {
    setError('');
    if (!name.trim()) {
      setError('Ad tələb olunur');
      return;
    }

    const skills = skillsText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const languages = languagesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      let finalAvatarUrl = null;
      if (selectedAvatar && selectedAvatar.uri) {
        const uploadResult = await api.uploadAvatar(selectedAvatar);
        finalAvatarUrl = uploadResult.avatar_url;
      }

      await completeOnboarding({
        name: name.trim(),
        bio: bio.trim(),
        website: website.trim(),
        avatar_url: finalAvatarUrl || null,
        skills,
        languages,
      });
      navigation.goBack();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Profil güncəlləmə xətası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Profil düzənlə</Text>
      <Text style={styles.subtitle}>Ad, bio, sayt və bacarıqlarını yenilə.</Text>

      <Text style={styles.label}>Ad Soyad</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Ad Soyad"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Qısa bio"
        placeholderTextColor="#94a3b8"
        style={[styles.input, styles.textArea]}
        multiline
      />

      <Text style={styles.label}>Website</Text>
      <TextInput
        value={website}
        onChangeText={setWebsite}
        placeholder="https://example.com"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="url"
      />

      <Text style={styles.label}>Profil şəkli</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage} disabled={loading}>
        <Text style={styles.uploadButtonText}>Şəkil seç</Text>
      </TouchableOpacity>
      {selectedAvatar && selectedAvatar.uri ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedAvatar.uri }} style={styles.imagePreview} />
          <Text style={styles.previewLabel}>Seçilmiş şəkil</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Skills (vergül ilə)</Text>
      <TextInput
        value={skillsText}
        onChangeText={setSkillsText}
        placeholder="React, Node.js, Docker"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />

      <Text style={styles.label}>Dillər (vergül ilə)</Text>
      <TextInput
        value={languagesText}
        onChangeText={setLanguagesText}
        placeholder="English, Turkish"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Dəyişiklikləri saxla</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    color: '#cbd5e1',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0f172a',
    borderColor: '#111827',
    borderWidth: 1,
    borderRadius: 16,
    color: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  imagePreview: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 8,
    backgroundColor: '#111827',
  },
  previewLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  uploadButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  errorText: {
    color: '#f87171',
    marginBottom: 12,
    textAlign: 'center',
  },
});
