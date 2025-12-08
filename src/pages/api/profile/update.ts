import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { getUser } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const user = await getUser(cookies);
  
  if (!user) {
    return redirect('/login');
  }

  try {
    const formData = await request.formData();
    const displayName = formData.get('display_name')?.toString();
    const bio = formData.get('bio')?.toString();
    const avatarFile = formData.get('avatar') as File;

    if (!displayName) {
      return redirect('/profile/edit?error=Display name is required');
    }

    let avatarUrl: string | undefined;

    // Upload avatar if provided
    if (avatarFile && avatarFile.size > 0) {
      if (avatarFile.size > 5 * 1024 * 1024) {
        return redirect('/profile/edit?error=Avatar must be less than 5MB');
      }

      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(data.path);

      avatarUrl = publicUrl;
    }

    // Update profile
    const updateData: any = {
      display_name: displayName,
      bio: bio || null,
    };

    if (avatarUrl) {
      updateData.avatar_url = avatarUrl;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) throw updateError;

    return redirect('/profile/edit?message=Profile updated successfully');
  } catch (error: any) {
    return redirect(`/profile/edit?error=${encodeURIComponent(error.message)}`);
  }
};
