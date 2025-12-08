import { supabase } from './supabase';
import { DEV_MODE, getDevUser } from './dev-auth';

export async function getSession(cookies: any) {
  // Dev mode bypass
  if (DEV_MODE) {
    const devUser = getDevUser();
    if (devUser) {
      return {
        user: devUser,
        access_token: 'dev-token',
        refresh_token: 'dev-token'
      };
    }
  }

  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken || !refreshToken) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    return null;
  }

  return data.session;
}

export async function getUser(cookies: any) {
  // Dev mode bypass
  if (DEV_MODE) {
    return getDevUser();
  }

  const session = await getSession(cookies);
  return session?.user ?? null;
}
