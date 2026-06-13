import { useContext, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import useSocialAuth from '../hooks/useSocialAuth';

export default function LoginScreen({ navigation }) {
  const { signIn, socialSignIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const { loading: socialLoading, error: socialError, signInWithGoogle, signInWithGithub } = useSocialAuth(
    async (payload) => {
      setLoading(true);
      try {
        await socialSignIn(payload);
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || 'Sosial login alınmadı';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    (err) => {
      const message = err?.message || 'Sosial login xətası';
      setError(message);
    }
  );

  const handleLogin = async () => {
    setError('');
    setInfo('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !password) {
      setError('E-mail və şifrəni daxil edin');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Zəhmət olmasa düzgün e-mail daxil edin');
      return;
    }
    if (password.length < 4) {
      setError('Şifrə ən az 4 simvol olmalıdır');
      return;
    }
    setLoading(true);
    try {
      await signIn({ email, password });
      setInfo('Daxil olma uğurlu oldu');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Daxil olma alınmadı';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DevFeed Mobile</Text>
      <Text style={styles.subtitle}>Sənin developer şəbəkən mobil tətbiqdə.</Text>
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}>
          <Text style={[styles.tabText, { color: '#020617' }]}>Daxil ol</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, styles.tabInactive]} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.tabText}>Qeydiyyat</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.socials}>
        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => {
            setError('');
            signInWithGithub().catch((err) => {
              setError(err?.message || 'GitHub auth alınmadı');
            });
          }}
          disabled={socialLoading}
        >
          <FontAwesome name="github" size={18} color="#fff" />
          <Text style={styles.socialText}> GitHub ilə davam et</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => {
            setError('');
            signInWithGoogle().catch((err) => {
              setError(err?.message || 'Google auth alınmadı');
            });
          }}
          disabled={socialLoading}
        >
          <AntDesign name="google" size={18} color="#fff" />
          <Text style={styles.socialText}> Google ilə davam et</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.orText}>- yaxud e-mail ilə -</Text>

      <View style={styles.formCard}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="E-mail"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Şifrə"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          style={styles.input}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {socialError ? <Text style={styles.errorText}>{socialError}</Text> : null}
        {info ? <Text style={styles.successText}>{info}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Daxil ol</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.switchText}>Hesabın yoxdursa, qeydiyyatdan keç</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  tabRow: {
    flexDirection: 'row',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 18,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#7c3aed',
  },
  tabInactive: {
    backgroundColor: '#0f172a',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '700',
  },
  socials: {
    marginBottom: 18,
  },
  socialBtn: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#111827',
    marginBottom: 12,
  },
  socialText: {
    color: '#e2e8f0',
    fontWeight: '700',
    marginLeft: 10,
  },
  orText: {
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 13,
  },
  formCard: {
    backgroundColor: '#0b1120',
    borderRadius: 24,
    padding: 24,
    borderColor: '#111827',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 22,
    elevation: 8,
  },
  input: {
    backgroundColor: '#121827',
    color: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderColor: '#1e293b',
    borderWidth: 1,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#7c3aed',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  switchText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
  },
  errorText: {
    color: '#f87171',
    marginBottom: 10,
    fontWeight: '700',
    fontSize: 13,
  },
  successText: {
    color: '#34d399',
    marginBottom: 10,
    fontWeight: '700',
    fontSize: 13,
  },
});

