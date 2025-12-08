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
    const months = parseInt(formData.get('months')?.toString() || '6');

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    // Get posts older than cutoff
    const { data: oldPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, media_urls')
      .lt('created_at', cutoffDate.toISOString());

    if (fetchError) throw fetchError;

    if (!oldPosts || oldPosts.length === 0) {
      return redirect('/admin?message=No old posts to delete');
    }

    let deletedCount = 0;
    let failedCount = 0;

    // Delete posts and their media
    for (const post of oldPosts) {
      try {
        // Delete media files
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
          .eq('id', post.id);

        if (deleteError) {
          failedCount++;
        } else {
          deletedCount++;
        }
      } catch (err) {
        console.error('Failed to delete post:', err);
        failedCount++;
      }
    }

    const message = `Deleted ${deletedCount} posts${failedCount > 0 ? ` (${failedCount} failed)` : ''}`;
    return redirect(`/admin?message=${encodeURIComponent(message)}`);
  } catch (error: any) {
    return redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }
};
