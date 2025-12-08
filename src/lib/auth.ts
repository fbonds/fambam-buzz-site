import { supabase } from './supabase';

export async function getSession(cookies: any) {
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
  const session = await getSession(cookies);
  return session?.user ?? null;
}
