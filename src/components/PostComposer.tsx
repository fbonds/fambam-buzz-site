import { useState } from 'react';
import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';

interface PostComposerProps {
  userId: string;
  userAvatar?: string | null;
}

export default function PostComposer({ userId, userAvatar }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    // Limit to 4 files
    if (files.length + selectedFiles.length > 4) {
      setError('Maximum 4 images per post');
      return;
    }
    
    setSelectedFiles([...selectedFiles, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Compress image before upload
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, compressedFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && selectedFiles.length === 0) {
      setError('Please write something or add an image');
      return;
    }
    
    setPosting(true);
    setError('');
    
    try {
      let mediaUrls: string[] = [];
      
      // Upload images if any
      if (selectedFiles.length > 0) {
        setUploading(true);
        mediaUrls = await Promise.all(selectedFiles.map(uploadImage));
        setUploading(false);
      }
      
      // Create post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          content: content.trim(),
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        });

      if (postError) throw postError;

      // Reset form
      setContent('');
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      
      // Reload page to show new post
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
      setUploading(false);
      setPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
        {userAvatar ? (
          <img src={userAvatar} alt="You" style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0
          }} />
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
            ?
          </div>
        )}
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          style={{ 
            flex: 1, 
            resize: 'vertical', 
            minHeight: '80px',
            fontSize: '16px'
          }}
          disabled={posting}
        />
      </div>
      
      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '10px',
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      {previewUrls.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '10px'
        }}>
          {previewUrls.map((url, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <img src={url} alt={`Preview ${index + 1}`} style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '8px'
              }} />
              <button
                type="button"
                onClick={() => removeFile(index)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  lineHeight: '1'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ cursor: 'pointer' }}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={posting || selectedFiles.length >= 4}
          />
          <span style={{
            color: '#4A90E2',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            📷 Add Photos {selectedFiles.length > 0 && `(${selectedFiles.length}/4)`}
          </span>
        </label>
        
        <button
          type="submit"
          className="btn"
          disabled={posting || uploading}
          style={{ opacity: (posting || uploading) ? 0.5 : 1 }}
        >
          {uploading ? 'Uploading...' : posting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
