import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/client-auth';
import { DEV_MODE, DEV_USER_ID, DEV_USER_NAME } from '../lib/dev-auth';
import PostComposer from './PostComposer';
import type { Post } from '../lib/supabase';

export default function Feed() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (!currentUser) {
        window.location.href = '/login.html';
        return;
      }

      // Get profile
      if (DEV_MODE) {
        setProfile({
          id: DEV_USER_ID,
          display_name: DEV_USER_NAME,
          avatar_url: null,
          bio: 'Dev Mode User',
        });
        setPosts([]);
      } else {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        setProfile(profileData);

        // Get posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            profile:profiles(*)
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (postsError) throw postsError;
        setPosts(postsData || []);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login.html';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <>
      <nav slot="nav" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <a href="/admin.html">Admin</a>
        <button onClick={handleSignOut} className="btn btn-secondary">
          Sign Out
        </button>
      </nav>

      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Family Feed</h1>
        
        {DEV_MODE && (
          <div className="card" style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107', marginBottom: '20px' }}>
            <p style={{ margin: 0, color: '#856404' }}>
              🛠️ <strong>Dev Mode:</strong> Logged in as {DEV_USER_NAME}. Posts won't be saved to the database. Set up Supabase to enable full functionality.
            </p>
          </div>
        )}
        
        <div className="card">
          <PostComposer 
            userId={user?.id || DEV_USER_ID}
            userAvatar={profile?.avatar_url}
          />
        </div>
      </div>

      <div>
        {posts.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#999' }}>No posts yet. Be the first to share something!</p>
          </div>
        )}
        
        {posts.map((post: any) => (
          <PostCard key={post.id} post={post} currentUserId={user?.id || DEV_USER_ID} />
        ))}
      </div>
    </>
  );
}

// PostCard component
function PostCard({ post, currentUserId }: { post: any; currentUserId: string }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;

    try {
      // Delete media files
      if (post.media_urls && post.media_urls.length > 0) {
        for (const url of post.media_urls) {
          const path = url.split('/media/')[1];
          if (path) {
            await supabase.storage.from('media').remove([path]);
          }
        }
      }

      // Delete post
      await supabase.from('posts').delete().eq('id', post.id);
      
      // Reload page
      window.location.reload();
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const isOwner = post.user_id === currentUserId;

  return (
    <div className="card" style={{ marginBottom: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: 0 }}>
          {post.profile?.avatar_url ? (
            <img 
              src={post.profile.avatar_url} 
              alt={post.profile.display_name} 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                flexShrink: 0
              }}
            />
          ) : (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#4A90E2',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {post.profile?.display_name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ 
              fontWeight: 600, 
              color: '#333',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {post.profile?.display_name || 'Unknown'}
            </div>
            <div style={{ fontSize: '13px', color: '#999' }}>{formatDate(post.created_at)}</div>
          </div>
        </div>
        
        {isOwner && (
          <button 
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              color: '#999',
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0,
              width: '28px',
              height: '28px',
              flexShrink: 0
            }}
            title="Delete post"
          >
            ×
          </button>
        )}
      </div>
      
      <div style={{ 
        fontSize: '15px', 
        lineHeight: 1.6, 
        whiteSpace: 'pre-wrap', 
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}>
        {post.content}
      </div>
      
      {post.media_urls && post.media_urls.length > 0 && (
        <div style={{ 
          marginTop: '15px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '10px'
        }}>
          {post.media_urls.map((url: string, i: number) => (
            <img 
              key={i}
              src={url} 
              alt="Post media" 
              style={{ 
                width: '100%',
                borderRadius: '8px',
                objectFit: 'cover',
                maxHeight: '300px',
                minHeight: '150px'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
