import Constants, { ExecutionEnvironment } from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { Provider } from '@supabase/supabase-js';

import { supabase } from '@/utils/supabase';

WebBrowser.maybeCompleteAuthSession();

type OAuthDebugState = {
  error: string | null;
  lastUrl: string | null;
  lastStep: string | null;
};

const oauthDebugState: OAuthDebugState = {
  error: null,
  lastUrl: null,
  lastStep: null,
};

function setOAuthDebugState(nextState: Partial<OAuthDebugState>) {
  Object.assign(oauthDebugState, nextState);
}

export function getOAuthDebugState() {
  return { ...oauthDebugState };
}

export function getOAuthRedirectUrl() {
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  return makeRedirectUri({
    path: 'auth/callback',
    ...(isExpoGo
      ? {}
      : {
          scheme: 'savorly',
          native: 'savorly://auth/callback',
        }),
    preferLocalhost: true,
  });
}

export function getRecoveryRedirectUrl() {
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  return makeRedirectUri({
    path: 'reset-password',
    ...(isExpoGo
      ? {}
      : {
          scheme: 'savorly',
          native: 'savorly://reset-password',
        }),
    preferLocalhost: true,
  });
}

function getTokensFromUrl(url: string): OAuthSessionResult {
  const [baseUrl, hash] = url.split('#');
  const parsed = new URL(hash ? `${baseUrl}?${hash}` : url);
  const code = parsed.searchParams.get('code');
  const accessToken = parsed.searchParams.get('access_token');
  const refreshToken = parsed.searchParams.get('refresh_token');
  const errorCode = parsed.searchParams.get('error_code') ?? parsed.searchParams.get('error');
  const errorDescription = parsed.searchParams.get('error_description');

  if (errorCode) {
    throw new Error(errorDescription ?? errorCode);
  }

  if (code) {
    return { code };
  }

  if (!accessToken || !refreshToken) {
    throw new Error('Authentication did not return a valid session.');
  }

  return { accessToken, refreshToken };
}

type OAuthSessionResult =
  | {
      code: string;
    }
  | {
      accessToken: string;
      refreshToken: string;
    };

export async function signInWithOAuthProvider(provider: Provider) {
  const redirectTo = getOAuthRedirectUrl();
  setOAuthDebugState({
    error: null,
    lastUrl: redirectTo,
    lastStep: 'starting_oauth',
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    setOAuthDebugState({
      error: error.message,
      lastStep: 'sign_in_with_oauth_failed',
    });
    throw new Error(error.message);
  }

  const authUrl = data?.url;

  if (!authUrl) {
    setOAuthDebugState({
      error: 'Unable to start the OAuth flow.',
      lastStep: 'missing_auth_url',
    });
    throw new Error('Unable to start the OAuth flow.');
  }

  setOAuthDebugState({
    lastStep: 'opening_auth_session',
  });
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);

  if (result.type !== 'success') {
    setOAuthDebugState({
      error: `Authentication was canceled (${result.type}).`,
      lastStep: 'auth_session_not_success',
    });
    throw new Error('Authentication was canceled.');
  }

  setOAuthDebugState({
    lastUrl: result.url,
    lastStep: 'received_callback',
  });

  if (!result.url) {
    setOAuthDebugState({
      error: 'Authentication did not return a callback URL.',
      lastStep: 'missing_callback_url',
    });
    throw new Error('Authentication did not return a callback URL.');
  }

  const sessionResult = getTokensFromUrl(result.url);
  setOAuthDebugState({
    lastStep: 'exchanging_session',
  });
  const { error: sessionError } =
    'code' in sessionResult
      ? await supabase.auth.exchangeCodeForSession(sessionResult.code)
      : await supabase.auth.setSession({
          access_token: sessionResult.accessToken,
          refresh_token: sessionResult.refreshToken,
        });

  if (sessionError) {
    setOAuthDebugState({
      error: sessionError.message,
      lastStep: 'session_exchange_failed',
    });
    throw new Error(sessionError.message);
  }

  setOAuthDebugState({
    error: null,
    lastStep: 'session_ready',
  });
}
