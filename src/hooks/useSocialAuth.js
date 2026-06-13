import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { makeRedirectUri, ResponseType, exchangeCodeAsync, useAuthRequest } from 'expo-auth-session';
import {
  GOOGLE_CLIENT_ID_EXPO,
  GOOGLE_CLIENT_ID_WEB,
  GITHUB_CLIENT_ID,
  GOOGLE_SCOPES,
  GITHUB_SCOPES,
} from '../constants/oauth-config';

const redirectUri = makeRedirectUri({
  useProxy: true,
  projectNameForProxy: 'devfeed-mobile',
});

export { redirectUri as oauthRedirectUri };

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

// Suppress COOP/COEP warnings in console
if (typeof window !== 'undefined') {
  const origError = console.error;
  console.error = function(...args) {
    const str = (args[0] || '').toString();
    if (str.includes('Cross-Origin')) {
      return;
    }
    return origError.apply(console, args);
  };
}

const githubDiscovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
};

async function fetchGoogleProfile(accessToken) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error('Google profile fetch failed');
  }
  return response.json();
}

async function fetchGithubProfile(accessToken) {
  const userResponse = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
  });
  if (!userResponse.ok) {
    throw new Error('GitHub profile fetch failed');
  }
  const profile = await userResponse.json();
  let email = profile.email;
  if (!email) {
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
    });
    if (!emailResponse.ok) {
      throw new Error('GitHub email fetch failed');
    }
    const emails = await emailResponse.json();
    const primary = emails.find((item) => item.primary && item.verified) || emails[0];
    email = primary?.email;
  }
  return {
    id: profile.id,
    email,
    name: profile.name || profile.login,
    avatarUrl: profile.avatar_url,
  };
}

export default function useSocialAuth(onResult, onError) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleClientId = Platform.OS === 'web' ? GOOGLE_CLIENT_ID_WEB : GOOGLE_CLIENT_ID_EXPO;

  const [googleRequest, googleResponse, promptGoogleAsync] = useAuthRequest(
    {
      clientId: googleClientId,
      redirectUri,
      scopes: GOOGLE_SCOPES,
      responseType: ResponseType.Code,
      extraParams: { access_type: 'offline', prompt: 'consent' },
    },
    googleDiscovery
  );

  const [githubRequest, githubResponse, promptGithubAsync] = useAuthRequest(
    {
      clientId: GITHUB_CLIENT_ID,
      redirectUri,
      scopes: GITHUB_SCOPES,
      responseType: ResponseType.Code,
      extraParams: { allow_signup: 'true' },
    },
    githubDiscovery
  );

  useEffect(() => {
    console.log('DEBUG googleResponse changed', googleResponse);
    if (googleResponse?.type === 'success' && googleResponse.params?.code) {
      handleGoogleCode(googleResponse.params.code).catch((err) => {
        handleError(err);
      });
    }
  }, [googleResponse]);

  useEffect(() => {
    console.log('DEBUG githubResponse changed', githubResponse);
    if (githubResponse?.type === 'success' && githubResponse.params?.code) {
      handleGithubCode(githubResponse.params.code).catch((err) => {
        handleError(err);
      });
    }
  }, [githubResponse]);

  const handleError = (err) => {
    const message = err?.message || 'Sosial giriş alınmadı';
    setError(message);
    if (typeof onError === 'function') {
      onError(err);
    }
  };

  const handleGoogleCode = async (code) => {
    if (!googleRequest) {
      throw new Error('Google auth request is not ready yet');
    }
    setLoading(true);
    try {
      const tokenResult = await exchangeCodeAsync(
        {
          clientId: googleClientId,
          code,
          redirectUri,
          extraParams: { code_verifier: googleRequest.codeVerifier },
        },
        googleDiscovery
      );

      if (!tokenResult?.accessToken) {
        throw new Error('Google token exchange failed');
      }

      const profile = await fetchGoogleProfile(tokenResult.accessToken);
      const payload = {
        provider: 'google',
        providerId: profile.sub || profile.id,
        email: profile.email,
        name: profile.name || profile.email || 'Google User',
        avatarUrl: profile.picture,
      };
      if (!payload.email) {
        throw new Error('Google hesabınız üçün e-mail alınmadı');
      }
      if (typeof onResult === 'function') {
        await onResult(payload);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubCode = async (code) => {
    if (!githubRequest) {
      throw new Error('GitHub auth request is not ready yet');
    }
    setLoading(true);
    try {
      const tokenResult = await exchangeCodeAsync(
        {
          clientId: GITHUB_CLIENT_ID,
          code,
          redirectUri,
          extraParams: { code_verifier: githubRequest.codeVerifier },
        },
        githubDiscovery
      );

      if (!tokenResult?.accessToken) {
        throw new Error('GitHub token exchange failed');
      }

      const profile = await fetchGithubProfile(tokenResult.accessToken);
      if (!profile.email) {
        throw new Error('GitHub hesabınız üçün e-mail alınmadı');
      }
      const payload = {
        provider: 'github',
        providerId: String(profile.id),
        email: profile.email,
        name: profile.name || profile.email || 'GitHub User',
        avatarUrl: profile.avatarUrl,
      };
      if (typeof onResult === 'function') {
        await onResult(payload);
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError('');
    console.log('DEBUG signInWithGoogle Platform:', Platform.OS);
    
    // On web, use direct OAuth flow due to COOP restrictions
    if (Platform.OS === 'web') {
      try {
        // Generate PKCE challenge
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const codeChallenge = btoa(String.fromCharCode.apply(null, array))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        
        // Generate state for CSRF protection
        const state = btoa(String.fromCharCode.apply(null, new Uint8Array(32)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        
        // Store state and code challenge for later verification
        localStorage.setItem('@devfeed_oauth_state', state);
        localStorage.setItem('@devfeed_oauth_code_verifier', codeChallenge);
        localStorage.setItem('@devfeed_oauth_provider', 'google');
        
        // Build Google auth URL
        const params = new URLSearchParams({
          client_id: googleClientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: GOOGLE_SCOPES.join(' '),
          state: state,
          access_type: 'offline',
          prompt: 'consent'
        });
        
        console.log('[OAuth] Web redirect setup:', { 
          redirectUri,
          clientId: googleClientId
        });
        
        // Navigate to Google auth
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      } catch (e) {
        console.error('Web OAuth setup failed:', e);
        handleError(e);
      }
      return;
    }
    
    // Native/Expo: use prompt
    if (!promptGoogleAsync) {
      handleError(new Error('Google auth is not available'));
      return;
    }
    try {
      await promptGoogleAsync();
    } catch (e) {
      console.error('promptGoogleAsync error:', e);
      handleError(e);
    }
  };

  const signInWithGithub = async () => {
    setError('');
    console.log('DEBUG signInWithGithub promptReady:', !!promptGithubAsync, 'clientId:', GITHUB_CLIENT_ID);
    if (!promptGithubAsync) {
      handleError(new Error('GitHub auth is not available'));
      return;
    }
    await promptGithubAsync();
  };

  return {
    loading,
    error,
    signInWithGoogle,
    signInWithGithub,
  };
}
