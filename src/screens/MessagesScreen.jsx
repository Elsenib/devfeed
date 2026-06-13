import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import * as api from '../api';

export default function MessagesScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await api.fetchConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadConversations();
    }
  }, [isFocused]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Söhbətlər</Text>
        <Pressable style={styles.newButton} onPress={() => navigation.navigate('NewConversation')}>
          <Text style={styles.newButtonText}>Yeni söhbət</Text>
        </Pressable>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.chatCard}
            onPress={() => navigation.navigate('ConversationDetail', {
              conversationId: item.id,
              title: item.title,
            })}
          >
            <Text style={styles.chatTitle}>{item.title || item.user?.name || 'Söhbət'}</Text>
            <Text style={styles.chatLast}>{item.lastMessage || item.lastMsg || 'Son mesaj burada göstəriləcək'}</Text>
            <Text style={styles.chatTime}>{item.updatedAt || item.time || ''}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Heç bir söhbət yoxdur.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  chatCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderColor: '#111827',
    borderWidth: 1,
  },
  chatTitle: {
    color: '#e2e8f0',
    fontWeight: '700',
    marginBottom: 6,
  },
  chatLast: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  chatTime: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  screenTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
  },
  newButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 24,
  },
});
