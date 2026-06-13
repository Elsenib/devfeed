import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as api from '../api';

export default function NewConversationScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!email.trim()) {
      Alert.alert('Xəta', 'Email sahəsi boş ola bilməz');
      return;
    }

    setLoading(true);
    try {
      const conversation = await api.createConversation(email.trim());
      // Go back to Messages so it becomes focused and reloads, then open ConversationDetail
      navigation.goBack();
      setTimeout(() => {
        navigation.navigate('ConversationDetail', {
          conversationId: conversation.id,
          title: conversation.title,
        });
      }, 250);
    } catch (error) {
      Alert.alert('Xəta', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni söhbət başla</Text>
      <Text style={styles.subtitle}>Bu istifadəçinin emailini daxil et və söhbətə başla.</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email daxil et"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Pressable style={styles.button} onPress={handleCreate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Yaradılır...' : 'Söhbəti yarat'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#0f172a',
    borderColor: '#111827',
    borderWidth: 1,
    borderRadius: 16,
    color: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
