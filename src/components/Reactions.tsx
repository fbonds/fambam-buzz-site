import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ReactionsProps {
  postId: string;
  currentUserId: string;
}

const REACTIONS = {
  like: '❤️',
  love: '🥰',
  laugh: '😂',
  celebrate: '🎉'
};

export default function Reactions({ postId, currentUserId }: ReactionsProps) {
  const [reactions, setReactions] = useState<any[]>([]);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReactions();
    subscribeToReactions();
  }, [postId]);

  async function loadReactions() {
    const { data } = await supabase
      .from('post_reactions')
      .select(`
        *,
        profile:profiles(display_name)
      `)
      .eq('post_id', postId);

    if (data) {
      setReactions(data);
      const myReaction = data.find(r => r.user_id === currentUserId);
      setUserReaction(myReaction?.reaction_type || null);
    }
  }

  function subscribeToReactions() {
    const channel = supabase
      .channel(`reactions-${postId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'post_reactions',
          filter: `post_id=eq.${postId}`
        },
        () => {
          loadReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function handleReaction(reactionType: string) {
    if (loading) return;
    setLoading(true);

    try {
      if (userReaction === reactionType) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);
        
        setUserReaction(null);
      } else if (userReaction) {
        // Update existing reaction
        await supabase
          .from('post_reactions')
          .update({ reaction_type: reactionType })
          .eq('post_id', postId)
          .eq('user_id', currentUserId);
        
        setUserReaction(reactionType);
      } else {
        // Add new reaction
        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: currentUserId,
            reaction_type: reactionType
          });
        
        setUserReaction(reactionType);
      }
      
      setShowPicker(false);
    } catch (err) {
      console.error('Reaction error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Count reactions by type
  const reactionCounts: Record<string, number> = {};
  reactions.forEach(r => {
    reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1;
  });

  const totalReactions = reactions.length;
  const reactedUsers = reactions.slice(0, 3).map(r => r.profile?.display_name).filter(Boolean);

  return (
    <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '12px', marginTop: '12px' }}>
      {/* Reaction counts and who reacted */}
      {totalReactions > 0 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          fontSize: '14px',
          color: '#666'
        }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {Object.entries(reactionCounts).map(([type, count]) => (
              <span key={type} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {REACTIONS[type as keyof typeof REACTIONS]} {count}
              </span>
            ))}
          </div>
          {reactedUsers.length > 0 && (
            <div style={{ fontSize: '13px' }}>
              {reactedUsers.join(', ')}
              {reactions.length > 3 && ` +${reactions.length - 3} more`}
            </div>
          )}
        </div>
      )}

      {/* Reaction buttons */}
      <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
        <button
          onClick={() => userReaction ? handleReaction(userReaction) : setShowPicker(!showPicker)}
          style={{
            background: userReaction ? '#e3f2fd' : 'transparent',
            border: '1px solid #ddd',
            borderRadius: '20px',
            padding: '6px 12px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: userReaction ? '#4A90E2' : '#666',
            fontWeight: userReaction ? 600 : 400
          }}
        >
          {userReaction ? REACTIONS[userReaction as keyof typeof REACTIONS] : '❤️'} 
          {userReaction ? 'Liked' : 'Like'}
        </button>

        {!userReaction && (
          <button
            onClick={() => setShowPicker(!showPicker)}
            style={{
              background: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '20px',
              padding: '6px 10px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
            title="React"
          >
            +
          </button>
        )}

        {/* Reaction picker */}
        {showPicker && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: '8px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '24px',
            padding: '8px 12px',
            display: 'flex',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10
          }}>
            {Object.entries(REACTIONS).map(([type, emoji]) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title={type}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
