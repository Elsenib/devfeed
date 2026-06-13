import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View, Platform } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from './src/context/AuthContext';
import * as api from './src/api';
import { oauthRedirectUri } from './src/hooks/useSocialAuth';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RegisterOnboarding from './src/screens/RegisterOnboarding';
import TabNavigator from './src/navigation/TabNavigator';
import PostDetailScreen from './src/screens/PostDetailScreen';
import ConversationDetailScreen from './src/screens/ConversationDetailScreen';
import NewConversationScreen from './src/screens/NewConversationScreen';
import ApplyJobScreen from './src/screens/ApplyJobScreen';
import NewPostScreen from './src/screens/NewPostScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);

  // Persist token and user across app restarts so social auth redirects land
  // the user into the correct navigator state. On web use localStorage fallback.
  let AsyncStorage = null;
  try {
    if (Platform.OS !== 'web') {
      // require only on native to avoid web bundler errors
      AsyncStorage = require('@react-native-async-storage/async-storage').default;
    }
  } catch (e) {
    console.warn('AsyncStorage require failed (expected on web):', e.message || e);
    AsyncStorage = null;
  }

  const isWeb = Platform.OS === 'web';
  const storageGet = async (key) => {
    if (isWeb) return Promise.resolve(localStorage.getItem(key));
    if (!AsyncStorage) return Promise.resolve(null);
    return AsyncStorage.getItem(key);
  };
  const storageSet = async (key, value) => {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    if (!AsyncStorage) return;
    return AsyncStorage.setItem(key, value);
  };
  const storageRemove = async (key) => {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    if (!AsyncStorage) return;
    return AsyncStorage.removeItem(key);
  };

  useEffect(() => {
    const restore = async () => {
      try {
        // Handle OAuth redirect callback (web only)
        const isWeb = Platform.OS === 'web';
        if (isWeb && typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          const code = url.searchParams.get('code');
          const state = url.searchParams.get('state');
          
          if (code) {
            console.log('[OAuth] Redirect detected with code:', code.slice(0, 20) + '...');
            const storedState = localStorage.getItem('@devfeed_oauth_state');
            const provider = localStorage.getItem('@devfeed_oauth_provider') || 'google';
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Verify state for CSRF protection
            if (state && state !== storedState) {
              console.error('[OAuth] State mismatch - possible CSRF attack');
              localStorage.removeItem('@devfeed_oauth_state');
              localStorage.removeItem('@devfeed_oauth_code_verifier');
              localStorage.removeItem('@devfeed_oauth_provider');
              setLoading(false);
              return;
            }
            
            try {
              // Exchange code for token on backend
              console.log('[OAuth] Exchanging code on backend...');
              const tokenResp = await fetch('http://localhost:4000/auth/oauth-callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  code, 
                  provider,
                  redirectUri: oauthRedirectUri || window.location.origin
                })
              });
              
              if (!tokenResp.ok) {
                throw new Error(`OAuth callback failed: ${tokenResp.status}`);
              }
              
              const data = await tokenResp.json();
              console.log('[OAuth] Token received, storing...');
              
              // Store token and user
              await storageSet('@devfeed_token', data.token);
              await storageSet('@devfeed_user', JSON.stringify(data.user));
              
              // Compute onboarding status
              const computeOnboarding = (u) => {
                if (!u) return true;
                if (typeof u.onboardingPending === 'boolean') return u.onboardingPending;
                return !(
                  u.role ||
                  (Array.isArray(u.skills) && u.skills.length > 0) ||
                  (Array.isArray(u.languages) && u.languages.length > 0) ||
                  u.bio ||
                  u.website
                );
              };
              
              setToken(data.token);
              setUser({ ...(data.user || {}), onboardingPending: computeOnboarding(data.user) });
              
            } catch (e) {
              console.error('[OAuth] Callback error:', e);
              // Silently continue - user will stay on login screen
            } finally {
              // Cleanup
              localStorage.removeItem('@devfeed_oauth_state');
              localStorage.removeItem('@devfeed_oauth_code_verifier');
              localStorage.removeItem('@devfeed_oauth_provider');
            }
            setLoading(false);
            return;
          }
        }
        
        // Normal restore from storage
        const storedToken = await storageGet('@devfeed_token');
        const storedUser = await storageGet('@devfeed_user');
        const storedTheme = await storageGet('@devfeed_theme');
        
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setTheme(storedTheme);
        }
        if (storedToken) {
          setToken(storedToken);
        }
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            // Compute onboarding status if not present
            const computeOnboardingPending = (u) => {
              if (!u) return true;
              if (typeof u.onboardingPending === 'boolean') return u.onboardingPending;
              return !(
                u.role ||
                (Array.isArray(u.skills) && u.skills.length > 0) ||
                (Array.isArray(u.languages) && u.languages.length > 0) ||
                u.bio ||
                u.website
              );
            };
            const withOnboarding = { ...(parsed || {}), onboardingPending: computeOnboardingPending(parsed) };
            setUser(withOnboarding);
          } catch (e) {
            setUser(null);
          }
        }
      } catch (e) {
        console.warn('Failed to restore auth:', e);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  useEffect(() => {
    api.setToken(token);
  }, [token]);

  const authContext = useMemo(
    () => ({
      user,
      token,
      signIn: async ({ email, password }) => {
        const data = await api.login(email, password);
        setToken(data.token);
        const needsOnboarding = !data.user?.role;
        setUser({ ...(data.user || { email }), onboardingPending: needsOnboarding });
        try {
          await storageSet('@devfeed_token', data.token);
          await storageSet('@devfeed_user', JSON.stringify({ ...(data.user || { email }), onboardingPending: needsOnboarding }));
        } catch (e) {
          console.warn('Failed to persist auth after signIn', e);
        }
        return data;
      },
      signOut: async () => {
        setToken(null);
        setUser(null);
        try {
          await storageRemove('@devfeed_token');
          await storageRemove('@devfeed_user');
        } catch (e) {
          console.warn('Failed to clear auth storage', e);
        }
      },
      signUp: async ({ name, email, password, role, skills, languages, bio, website }) => {
        const payload = { name, email, password };
        if (role) payload.role = role;
        if (skills) payload.skills = skills;
        if (languages) payload.languages = languages;
        if (bio) payload.bio = bio;
        if (website) payload.website = website;
        const data = await api.register(payload);
        setToken(data.token);
        const onboarded = role || (skills && skills.length) || (languages && languages.length) || bio || website;
        if (onboarded) {
          setUser(data.user || { name, email });
        } else {
          setUser({ ...(data.user || { name, email }), onboardingPending: true });
        }
        try {
          await storageSet('@devfeed_token', data.token);
          await storageSet('@devfeed_user', JSON.stringify(data.user || { name, email }));
        } catch (e) {
          console.warn('Failed to persist auth after signUp', e);
        }
        return data;
      },
      socialSignIn: async ({ provider, providerId, email, name, avatarUrl }) => {
        const payload = { provider, providerId, email, name, avatarUrl };
        const response = await api.socialLogin(payload);
        console.log('DEBUG socialSignIn response', response);
        setToken(response.token);
        const userProfile = response.user || { name, email };
        const onboardingPending = !(
          userProfile.role ||
          (Array.isArray(userProfile.skills) && userProfile.skills.length > 0) ||
          (Array.isArray(userProfile.languages) && userProfile.languages.length > 0) ||
          userProfile.bio ||
          userProfile.website
        );
        console.log('DEBUG socialSignIn onboardingPending', onboardingPending, 'userProfile', userProfile);
        setUser({ ...userProfile, onboardingPending });
        try {
          await storageSet('@devfeed_token', response.token);
          await storageSet('@devfeed_user', JSON.stringify({ ...userProfile, onboardingPending }));
        } catch (e) {
          console.warn('Failed to persist auth after socialSignIn', e);
        }
        return { ...response, onboardingPending };
      },
      completeOnboarding: async (updates) => {
        const res = await api.updateProfile(updates);
        const updatedUser = res.user;
        setUser({ ...updatedUser, onboardingPending: false });
        try {
          await storageSet('@devfeed_user', JSON.stringify({ ...updatedUser, onboardingPending: false }));
        } catch (e) {
          console.warn('Failed to persist updated profile', e);
        }
        return updatedUser;
      },
      theme,
      toggleTheme: async () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        try {
          await storageSet('@devfeed_theme', nextTheme);
        } catch (e) {
          console.warn('Failed to persist theme', e);
        }
      },
    }),
    [token, user, theme]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </SafeAreaView>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: '#020617' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
            headerBackTitleVisible: false,
          }}
        >
          {!user ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : user.onboardingPending ? (
            // If user exists but onboarding not completed, show onboarding flow
            <>
              <Stack.Screen name="RegisterOnboarding" component={RegisterOnboarding} />
            </>
          ) : (
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen
                name="UserProfile"
                component={UserProfileScreen}
                options={{ headerShown: true, title: 'Profil' }}
              />
              <Stack.Screen
                name="NewConversation"
                component={NewConversationScreen}
                options={{ headerShown: true, title: 'Yeni Söhbət' }}
              />
              <Stack.Screen
                name="ConversationDetail"
                component={ConversationDetailScreen}
                options={{ headerShown: true }}
              />
              <Stack.Screen
                name="PostDetail"
                component={PostDetailScreen}
                options={{ headerShown: true, title: 'Post Detalı' }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ headerShown: true, title: 'Profil düzənlə' }}
              />
              <Stack.Screen
                name="ApplyJob"
                component={ApplyJobScreen}
                options={{ headerShown: true, title: 'Müraciət et' }}
              />
              <Stack.Screen
                name="NewPost"
                component={NewPostScreen}
                options={{ headerShown: true, title: 'Yeni Paylaşım' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
});
