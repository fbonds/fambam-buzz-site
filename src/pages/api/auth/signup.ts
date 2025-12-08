import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const displayName = formData.get('display_name')?.toString();

  if (!email || !password || !displayName) {
    return redirect('/signup?error=All fields are required');
  }

  if (password.length < 6) {
    return redirect('/signup?error=Password must be at least 6 characters');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    return redirect('/login?message=Account created! Please sign in.');
  }

  return redirect('/signup?error=Something went wrong');
};
