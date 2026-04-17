import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../lib/api';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@bargainrentacarnj.com');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const { token, user } = await api.login({ email, password });
      if (user.role !== 'admin' && user.role !== 'staff') {
        throw new Error('Not authorized for admin access');
      }
      setToken(token);
      nav('/');
    } catch (e: any) {
      setErr(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-3 flex items-center justify-center font-display font-bold text-xl">B</div>
          <h1 className="font-display text-xl">Admin Console</h1>
          <p className="text-xs text-muted">Bargain Rent-A-Car of America</p>
        </div>
        <div className="space-y-3">
          <div>
            <label>Email</label>
            <input type="email" className="w-full" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" className="w-full" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {err && <div className="text-xs text-red-400">{err}</div>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
