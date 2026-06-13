import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as api from '../api';

export default function ConversationDetailScreen({ route, navigation }) {
  const { conversationId, title } = route.params;
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: title || 'Söhbət' });

    const loadConversation = async () => {
      try {
        const data = await api.fetchConversation(conversationId);
        setConversation(data);
      } catch (error) {
        console.warn(error);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, navigation, title]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const sent = await api.sendMessage(conversationId, message.trim());
      setConversation((prev) => ({
        ...prev,
        messages: prev ? [...prev.messages, sent] : [sent],
        lastMessage: sent.text,
      }));
      setMessage('');
    } catch (error) {
      console.warn(error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
    >
      <FlatList
        ref={listRef}
        data={conversation?.messages || []}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <Text style={styles.messageSender}>{item.sender?.name || 'Siz'}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageTime}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Heç bir mesaj yoxdur. İlk mesajı yazın.</Text>}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputRow}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Mesaj yaz..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
          multiline
        />
        <Pressable style={styles.sendButton} onPress={handleSend} disabled={sending}>
          <Text style={styles.sendText}>{sending ? 'Göndərilir...' : 'Göndər'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  messageList: {
    padding: 16,
  },
  messageBubble: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderColor: '#111827',
    borderWidth: 1,
  },
  messageSender: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  messageText: {
    color: '#e2e8f0',
    lineHeight: 20,
  },
  messageTime: {
    color: '#6d28d9',
    fontSize: 11,
    marginTop: 10,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopColor: '#111827',
    borderTopWidth: 1,
    backgroundColor: '#020617',
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderColor: '#111827',
    borderWidth: 1,
    color: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    minHeight: 44,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 24,
  },
});
