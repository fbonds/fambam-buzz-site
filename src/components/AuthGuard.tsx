import { useEffect, useState } from 'react';
import { getCurrentUser, onAuthStateChange } from '../lib/client-auth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth state
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Listen for auth changes
    const { data } = onAuthStateChange((newUser) => {
      setUser(newUser);
      if (!newUser && !loading) {
        window.location.href = '/login.html';
      }
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login.html';
    }
    return null;
  }

  return <>{children}</>;
}
