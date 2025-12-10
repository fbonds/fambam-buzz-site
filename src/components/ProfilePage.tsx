import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/client-auth';

interface ProfilePageProps {
  profileId: string;
}

export default function ProfilePage({ profileId }: ProfilePageProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  async function loadProfile() {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      setProfile(profileData);

      // Load user's posts
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });

      setPosts(postsData || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading profile:', err);
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  if (!profile) {
    return <div className="error">Profile not found</div>;
  }

  const isOwnProfile = currentUser?.id === profileId;

  return (
    <div>
      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'start', flexWrap: 'wrap' }}>
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.display_name}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0
              }}
            />
          ) : (
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: '#4A90E2',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {profile.display_name[0].toUpperCase()}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ marginBottom: '10px' }}>{profile.display_name}</h1>
            {profile.bio && <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '10px' }}>{profile.bio}</p>}
            <p style={{ color: '#999', fontSize: '14px' }}>
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>
            {isOwnProfile && !editing && (
              <button 
                onClick={() => setEditing(true)}
                className="btn"
                style={{ marginTop: '15px' }}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {editing && isOwnProfile && (
        <ProfileEditor 
          profile={profile} 
          onSave={() => {
            setEditing(false);
            loadProfile();
          }}
          onCancel={() => setEditing(false)}
        />
      )}

      <h2 style={{ marginBottom: '20px' }}>
        {isOwnProfile ? 'Your Posts' : `${profile.display_name}'s Posts`} ({posts.length})
      </h2>

      {posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#999' }}>No posts yet</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUserId={currentUser?.id || ''}
            onImageClick={(url, allImages) => {
              setLightboxImage(url);
              setLightboxImages(allImages || [url]);
              setLightboxIndex(allImages?.indexOf(url) || 0);
            }}
          />
        ))
      )}

      {/* Image Lightbox Gallery */}
      {lightboxImage && (
        <div
          onClick={() => {
            setLightboxImage(null);
            setLightboxImages([]);
            setLightboxIndex(0);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer',
            padding: '20px'
          }}
        >
          {/* Previous button */}
          {lightboxImages.length > 1 && lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newIndex = lightboxIndex - 1;
                setLightboxIndex(newIndex);
                setLightboxImage(lightboxImages[newIndex]);
              }}
              style={{
                position: 'absolute',
                left: '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#333',
                zIndex: 1001
              }}
            >
              ‹
            </button>
          )}

          <img
            src={lightboxImage}
            alt="Full size"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
          />

          {/* Next button */}
          {lightboxImages.length > 1 && lightboxIndex < lightboxImages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newIndex = lightboxIndex + 1;
                setLightboxIndex(newIndex);
                setLightboxImage(lightboxImages[newIndex]);
              }}
              style={{
                position: 'absolute',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#333',
                zIndex: 1001
              }}
            >
              ›
            </button>
          )}

          {/* Close button */}
          <button
            onClick={() => {
              setLightboxImage(null);
              setLightboxImages([]);
              setLightboxIndex(0);
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#333',
              zIndex: 1001
            }}
          >
            ×
          </button>

          {/* Image counter */}
          {lightboxImages.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 500,
                zIndex: 1001
              }}
            >
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Profile Editor Component
function ProfileEditor({ profile, onSave, onCancel }: any) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setUploading(false);
      onSave();
    } catch (err: any) {
      setError(err.message);
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio || null
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setSaving(false);
      onSave();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: '30px' }}>
      <h2 style={{ marginBottom: '20px' }}>Edit Profile</h2>

      {error && <div className="error">{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
            Profile Picture
          </label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
          {uploading && <p style={{ fontSize: '14px', color: '#4A90E2', marginTop: '5px' }}>Uploading...</p>}
        </div>

        <div>
          <label htmlFor="display_name" style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
            Display Name
          </label>
          <input
            type="text"
            id="display_name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label htmlFor="bio" style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell your family about yourself..."
            disabled={saving}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleSave}
            className="btn"
            disabled={saving || !displayName}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Reuse PostCard from Feed  
function PostCard({ post, currentUserId, onImageClick }: { post: any; currentUserId: string; onImageClick?: (url: string, allImages?: string[]) => void }) {
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

  return (
    <div className="card" style={{ marginBottom: '15px' }}>
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontSize: '13px', color: '#999' }}>{formatDate(post.created_at)}</div>
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
              onClick={() => onImageClick?.(url, post.media_urls)}
              style={{ 
                width: '100%',
                borderRadius: '8px',
                objectFit: 'cover',
                maxHeight: '300px',
                minHeight: '150px',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
