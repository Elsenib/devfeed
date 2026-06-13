import { useContext } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function SettingsScreen() {
  const { signOut, theme, toggleTheme } = useContext(AuthContext);

  const handleSignOut = async () => {
    if (!signOut) {
      Alert.alert('Xəta', 'Çıxış funksiyası mövcud deyil.');
      return;
    }

    try {
      await signOut();
    } catch (error) {
      console.warn('signOut error', error);
      Alert.alert('Xəta', 'Çıxış zamanı problem yarandı.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Ayarlar</Text>
      <Text style={styles.pageSubtitle}>Hesabınız və tətbiq ayarları</Text>

      <Text style={styles.sectionTitle}>Hesab</Text>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={handleSignOut}
      >
        <Text style={styles.cardTitle}>Çıxış</Text>
        <Text style={styles.cardSubtitle}>Hesabınızı bağlayın</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Ümumi</Text>
      <View style={styles.cardRow}>
        <View style={styles.cardFlex}>
          <Text style={styles.cardTitle}>Tema</Text>
          <Text style={styles.cardSubtitle}>{theme === 'dark' ? 'Tünd tema aktivdir' : 'Açıq tema aktivdir'}</Text>
        </View>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          thumbColor={theme === 'dark' ? '#7c3aed' : '#fff'}
          trackColor={{ false: '#6b7280', true: '#8b5cf6' }}
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bildirişlər</Text>
        <Text style={styles.cardSubtitle}>Bildiriş parametrləri gələcəkdə əlavə ediləcək.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Məxfilik</Text>
        <Text style={styles.cardSubtitle}>Məxfilik ayarları və hesab qorunması.</Text>
      </View>
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
    paddingBottom: 32,
  },
  pageTitle: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  pageSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 10,
    marginTop: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderColor: '#111827',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 5,
  },
  cardRow: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderColor: '#111827',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardFlex: {
    flex: 1,
    marginRight: 12,
  },
  cardPressed: {
    backgroundColor: '#111827',
  },
  cardTitle: {
    color: '#e2e8f0',
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 16,
  },
  cardSubtitle: {
    color: '#94a3b8',
    lineHeight: 22,
    fontSize: 14,
  },
});
