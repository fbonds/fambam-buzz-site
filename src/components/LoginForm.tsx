import { useState } from 'react';
import { signIn } from '../lib/client-auth';
import { DEV_MODE } from '../lib/dev-auth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      window.location.href = '/';
    }
  };

  if (DEV_MODE) {
    return (
      <div className="success" style={{ marginBottom: '20px' }}>
        🛠️ <strong>Dev Mode Active</strong><br/>
        Authentication is bypassed. Go to <a href="/" style={{ color: '#4A90E2' }}>home page</a> to start.
      </div>
    );
  }

  return (
    <>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
        Don't have an account? <a href="/signup.html" style={{ color: '#4A90E2' }}>Sign up</a>
      </p>
    </>
  );
}
