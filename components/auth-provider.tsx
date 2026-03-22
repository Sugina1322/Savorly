import type { Provider, Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { isSupabaseConfigured, supabase } from '@/utils/supabase';
import { getRecoveryRedirectUrl, signInWithOAuthProvider } from '@/utils/oauth';

type SignInInput = {
  email: string;
  password: string;
};

type SignUpInput = {
  email: string;
  password: string;
  name: string;
};

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_key: string | null;
  created_at: string;
};

type SignUpResult = {
  needsEmailConfirmation: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  isAccountReady: boolean;
  accountError: string | null;
  isConfigured: boolean;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<SignUpResult>;
  resetPassword: (email: string) => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<Profile>;
};

type UpdateProfileInput = {
  fullName: string;
  username: string;
  bio: string;
  avatarKey: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getUserFullName(user: User) {
  const fullName = user.user_metadata?.full_name;
  const name = user.user_metadata?.name;

  if (typeof fullName === 'string' && fullName.trim().length > 0) {
    return fullName.trim();
  }

  if (typeof name === 'string' && name.trim().length > 0) {
    return name.trim();
  }

  return '';
}

function getAccountErrorMessage(error: { message: string }) {
  if (/relation .*profiles.* does not exist/i.test(error.message) || /table .*profiles.* does not exist/i.test(error.message)) {
    return 'Your Supabase profiles table is not ready yet. Run supabase/schema.sql in the Supabase SQL editor first.';
  }

  if (/permission denied|row-level security|violates row-level security/i.test(error.message)) {
    return 'Your Supabase profiles policies are blocking account setup. Apply supabase/schema.sql so signed-in users can create their own profile.';
  }

  return error.message;
}

function canUseFallbackProfile(error: { message: string }) {
  return (
    /relation .*profiles.* does not exist/i.test(error.message) ||
    /table .*profiles.* does not exist/i.test(error.message) ||
    /permission denied|row-level security|violates row-level security/i.test(error.message)
  );
}

function buildProfilePayload(user: User) {
  return {
    id: user.id,
    email: user.email ?? null,
    full_name: getUserFullName(user) || null,
  };
}

function buildFallbackProfile(user: User): Profile {
  return {
    id: user.id,
    email: user.email ?? null,
    full_name: getUserFullName(user) || null,
    username: null,
    bio: null,
    avatar_key: null,
    created_at: user.created_at ?? new Date().toISOString(),
  };
}

function normalizeProfile(data: Record<string, unknown>, user?: User | null): Profile {
  const fallbackName = user ? getUserFullName(user) || null : null;

  return {
    id: typeof data.id === 'string' ? data.id : user?.id ?? '',
    email: typeof data.email === 'string' ? data.email : user?.email ?? null,
    full_name: typeof data.full_name === 'string' ? data.full_name : fallbackName,
    username: typeof data.username === 'string' ? data.username : null,
    bio: typeof data.bio === 'string' ? data.bio : null,
    avatar_key: typeof data.avatar_key === 'string' ? data.avatar_key : null,
    created_at:
      typeof data.created_at === 'string' ? data.created_at : user?.created_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const profileRequestRef = useRef(0);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.warn('Failed to restore auth session', error.message);
        }

        if (isMounted) {
          setSession(data.session ?? null);
          setIsLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          console.warn('Failed to read auth session', error);
          setSession(null);
          setIsLoading(false);
        }
      });

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      appStateSubscription.remove();
      supabase.auth.stopAutoRefresh();
      subscription.subscription.unsubscribe();
    };
  }, []);

  const refreshAccount = useCallback(async () => {
    const user = session?.user;

    if (!isSupabaseConfigured || !user) {
      setProfile(null);
      setIsProfileLoading(false);
      setAccountError(null);
      return;
    }

    const requestId = profileRequestRef.current + 1;
    profileRequestRef.current = requestId;

    setIsProfileLoading(true);
    setAccountError(null);

    const { data, error } = await supabase
      .from('profiles')
      .upsert(buildProfilePayload(user), {
        onConflict: 'id',
      })
      .select('*')
      .single();

    if (profileRequestRef.current !== requestId) {
      return;
    }

    if (error) {
      if (canUseFallbackProfile(error)) {
        console.warn('Profiles table is unavailable, using auth user fallback for account state.');
        setProfile(buildFallbackProfile(user));
        setAccountError(null);
        setIsProfileLoading(false);
        return;
      }

      const message = getAccountErrorMessage(error);
      console.warn('Failed to sync user profile', message);
      setProfile(null);
      setAccountError(message);
      setIsProfileLoading(false);
      return;
    }

    setProfile(normalizeProfile(data as Record<string, unknown>, user));
    setAccountError(null);
    setIsProfileLoading(false);
  }, [session?.user]);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      setIsProfileLoading(false);
      setAccountError(null);
      return;
    }

    refreshAccount().catch((error: unknown) => {
      const message = error instanceof Error ? getAccountErrorMessage(error) : 'Unable to prepare your account right now.';
      console.warn('Failed to sync user profile', message);
      setProfile(null);
      setAccountError(message);
      setIsProfileLoading(false);
    });
  }, [refreshAccount, session?.user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      isProfileLoading,
      isAccountReady: Boolean(session?.user && profile),
      accountError,
      isConfigured: isSupabaseConfigured,
      async signIn({ email, password }) {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured yet.');
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw new Error(error.message);
        }
      },
      async signUp({ email, password, name }) {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured yet.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        return {
          needsEmailConfirmation: !data.session,
        };
      },
      async resetPassword(email) {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured yet.');
        }

        const normalizedEmail = email.trim();

        if (!normalizedEmail) {
          throw new Error('Enter your email first so we know where to send the reset link.');
        }

        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: getRecoveryRedirectUrl(),
        });

        if (error) {
          throw new Error(error.message);
        }
      },
      async signInWithProvider(provider) {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured yet.');
        }

        await signInWithOAuthProvider(provider);
      },
      async signOut() {
        if (!isSupabaseConfigured) {
          return;
        }

        const { error } = await supabase.auth.signOut();

        if (error) {
          throw new Error(error.message);
        }

        setProfile(null);
        setAccountError(null);
        setIsProfileLoading(false);
      },
      async refreshAccount() {
        await refreshAccount();
      },
      async updateProfile({ avatarKey, bio, fullName, username }) {
        const currentUser = session?.user;

        if (!isSupabaseConfigured || !currentUser) {
          throw new Error('You need to be signed in to edit your profile.');
        }

        const normalizedFullName = fullName.trim();
        const normalizedUsername = username.trim().toLowerCase();
        const normalizedBio = bio.trim();

        if (!normalizedFullName) {
          throw new Error('Please enter your name.');
        }

        if (!/^[a-z0-9._]{3,20}$/.test(normalizedUsername)) {
          throw new Error('Username must be 3-20 characters and use letters, numbers, dots, or underscores.');
        }

        const { error: userError } = await supabase.auth.updateUser({
          data: {
            full_name: normalizedFullName,
          },
        });

        if (userError) {
          throw new Error(userError.message);
        }

        const { data, error } = await supabase
          .from('profiles')
          .upsert(
            {
              id: currentUser.id,
              email: currentUser.email ?? null,
              full_name: normalizedFullName,
              username: normalizedUsername,
              bio: normalizedBio || null,
              avatar_key: avatarKey,
            },
            {
              onConflict: 'id',
            }
          )
          .select('*')
          .single();

        if (error) {
          if (/duplicate key value|unique constraint/i.test(error.message)) {
            throw new Error('That username is already taken. Try another one.');
          }

          if (/column .* does not exist/i.test(error.message)) {
            throw new Error('Your profiles table is missing the new profile fields. Re-run supabase/schema.sql first.');
          }

          throw new Error(getAccountErrorMessage(error));
        }

        const nextProfile = normalizeProfile(data as Record<string, unknown>, currentUser);
        setProfile(nextProfile);
        setAccountError(null);
        return nextProfile;
      },
    }),
    [accountError, isLoading, isProfileLoading, profile, refreshAccount, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
