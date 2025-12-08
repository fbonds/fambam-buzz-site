import { supabase } from './supabase';
import { DEV_MODE, getDevUser } from './dev-auth';

// Client-side authentication for static builds
export async function getCurrentUser() {
  if (DEV_MODE) {
    return getDevUser();
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/login.html';
}

// Listen for auth state changes
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChanged((event, session) => {
    callback(session?.user ?? null);
  });
}
