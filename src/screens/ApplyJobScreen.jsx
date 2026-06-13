import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

export default function ApplyJobScreen({ route, navigation }) {
  const { postId, employerName } = route.params;
  const { user } = useContext(AuthContext);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Xəta', 'Daxil olmalısınız.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.applyToJob(postId, {
        cover_letter: coverLetter.trim(),
        resume_url: resumeUrl.trim(),
      });

      Alert.alert('Uğur', 'Müraciətiniz göndərildi.');

      if (response.conversationId) {
        navigation.replace('ConversationDetail', {
          conversationId: response.conversationId,
          title: employerName || 'İşəgötürən',
        });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Xəta', error.response?.data?.error || error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Müraciət et</Text>
        <Text style={styles.subtitle}>
          {employerName ? `${employerName}-ə müraciət göndərirsiniz.` : 'Müraciətinizi işəgötürənə göndərin.'}
        </Text>

        <Text style={styles.label}>Qısa motivasiya məktubu</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={coverLetter}
          onChangeText={setCoverLetter}
          placeholder="Niyə bu vakansiyaya uyğun olduğunu yaz..."
          placeholderTextColor="#94a3b8"
          multiline
          maxLength={1000}
        />

        <Text style={styles.label}>CV / Portfolio linki</Text>
        <TextInput
          style={styles.input}
          value={resumeUrl}
          onChangeText={setResumeUrl}
          placeholder="CV linki və ya portfolio URL"
          placeholderTextColor="#94a3b8"
          keyboardType="url"
          autoCapitalize="none"
        />

        <Text style={styles.note}>
          Əgər PDF yükləmək istəyirsinizsə, onu əvvəlcə buludda yerləşdirib linki buraya əlavə edin.
        </Text>

        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Müraciəti göndər</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 24,
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
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  note: {
    color: '#8b949e',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
