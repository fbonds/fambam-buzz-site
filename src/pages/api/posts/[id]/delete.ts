import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';
import { getUser } from '../../../../lib/auth';

export const POST: APIRoute = async ({ params, cookies, redirect }) => {
  const user = await getUser(cookies);
  
  if (!user) {
    return redirect('/login');
  }

  const postId = params.id;

  if (!postId) {
    return redirect('/');
  }

  try {
    // Get post to check ownership
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('user_id, media_urls')
      .eq('id', postId)
      .single();

    if (fetchError) throw fetchError;

    if (post.user_id !== user.id) {
      return redirect('/?error=Unauthorized');
    }

    // Delete media files from storage if any
    if (post.media_urls && post.media_urls.length > 0) {
      for (const url of post.media_urls) {
        try {
          const path = url.split('/media/')[1];
          if (path) {
            await supabase.storage.from('media').remove([path]);
          }
        } catch (err) {
          console.error('Failed to delete media:', err);
        }
      }
    }

    // Delete post
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (deleteError) throw deleteError;

    return redirect('/');
  } catch (error: any) {
    return redirect(`/?error=${encodeURIComponent(error.message)}`);
  }
};
