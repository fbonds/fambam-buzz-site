import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface CommentsProps {
  postId: string;
  currentUserId: string;
}

export default function Comments({ postId, currentUserId }: CommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    loadComments();
    subscribeToComments();
  }, [postId]);

  async function loadComments() {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles(display_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(data);
    }
  }

  function subscribeToComments() {
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || loading) return;

    setLoading(true);
    try {
      await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: newComment.trim()
        });

      setNewComment('');
      setShowComments(true);
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm('Delete this comment?')) return;

    try {
      await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '12px', marginTop: '12px' }}>
      {/* Comment count and toggle */}
      <button
        onClick={() => setShowComments(!showComments)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#666',
          fontSize: '14px',
          cursor: 'pointer',
          padding: '4px 0',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        💬 {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        <span style={{ fontSize: '12px' }}>{showComments ? '▼' : '▶'}</span>
      </button>

      {/* Comments list */}
      {showComments && (
        <div style={{ marginTop: '12px' }}>
          {comments.map((comment) => (
            <div 
              key={comment.id}
              style={{
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                {comment.profile?.avatar_url ? (
                  <img 
                    src={comment.profile.avatar_url}
                    alt={comment.profile.display_name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />
                ) : (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#4A90E2',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {comment.profile?.display_name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>
                        {comment.profile?.display_name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#999' }}>
                        {formatDate(comment.created_at)}
                      </div>
                    </div>
                    
                    {comment.user_id === currentUserId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#999',
                          fontSize: '12px',
                          cursor: 'pointer',
                          padding: '2px 6px'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  
                  <div style={{ 
                    fontSize: '14px', 
                    marginTop: '6px',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word'
                  }}>
                    {comment.content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add comment form */}
          <form onSubmit={handleAddComment} style={{ marginTop: '12px' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              style={{ 
                width: '100%',
                resize: 'vertical',
                marginBottom: '8px',
                fontSize: '14px'
              }}
              disabled={loading}
            />
            <button 
              type="submit"
              className="btn"
              style={{ fontSize: '13px', padding: '6px 12px' }}
              disabled={loading || !newComment.trim()}
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
