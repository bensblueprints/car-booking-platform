'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { LogOut, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { apiClient, clearToken, getToken, setToken } from '@/lib/api';

export default function AccountPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!getToken());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <section className="container-px py-20 flex justify-center">
        <Loader2 className="animate-spin" />
      </section>
    );
  }

  if (!hasToken) {
    return <LoginForm onAuth={() => setHasToken(true)} />;
  }

  return (
    <AccountDashboard
      onLogout={() => {
        clearToken();
        router.push('/');
      }}
    />
  );
}

function LoginForm({ onAuth }: { onAuth: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '' });

  const mut = useMutation({
    mutationFn: () =>
      mode === 'register'
        ? apiClient.register({
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone || undefined,
          })
        : apiClient.login({ email: form.email, password: form.password }),
    onSuccess: (data) => {
      setToken(data.token);
      onAuth();
    },
  });

  return (
    <section className="container-px py-20">
      <div className="max-w-md mx-auto card p-8">
        <h1 className="font-display text-3xl mb-1">
          {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
        </h1>
        <p className="text-sm text-muted mb-6">
          {mode === 'login' ? 'Sign in to manage your bookings.' : 'Book faster next time.'}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
          className="space-y-3"
        >
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <input required placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" />
                <input required placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" />
              </div>
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
            </>
          )}
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          <input required type="password" placeholder="Password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />

          {mut.error && <div className="text-sm text-flame">{(mut.error as any)?.message}</div>}

          <button type="submit" disabled={mut.isPending} className="btn-primary w-full justify-center">
            {mut.isPending ? <Loader2 className="animate-spin" size={16} /> : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full text-center text-xs text-flame hover:underline mt-4"
        >
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>
      </div>
    </section>
  );
}

function AccountDashboard({ onLogout }: { onLogout: () => void }) {
  const meQ = useQuery({ queryKey: ['me'], queryFn: () => apiClient.me() });
  const bookingsQ = useQuery({ queryKey: ['my-bookings'], queryFn: () => apiClient.myBookings() });

  const statusColor = (s: string) =>
    ({
      pending: 'text-gold border-gold/40',
      confirmed: 'text-flame border-flame/40',
      in_progress: 'text-flame border-flame/60',
      completed: 'text-bone-200 border-line',
      cancelled: 'text-muted border-line',
      refunded: 'text-muted border-line',
    }[s] || 'text-muted border-line');

  return (
    <section className="container-px py-14 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="eyebrow mb-2"><span className="w-8 h-px bg-gold" /> Your account</div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              Hi{meQ.data?.firstName ? `, ${meQ.data.firstName}` : ''}.
            </h1>
          </div>
          <button onClick={onLogout} className="btn-ghost"><LogOut size={14} /> Sign out</button>
        </div>

        <h2 className="font-display text-2xl mb-4">My bookings</h2>
        {bookingsQ.isLoading && <div className="card p-8 text-center text-muted">Loading…</div>}
        {bookingsQ.data?.length === 0 && (
          <div className="card p-10 text-center">
            <UserIcon size={32} className="mx-auto text-flame mb-3" />
            <p className="text-muted mb-5">No bookings yet.</p>
            <Link href="/cars" className="btn-primary mx-auto">Browse the fleet <ArrowRight size={16} /></Link>
          </div>
        )}
        <div className="space-y-3">
          {bookingsQ.data?.map((b: any) => (
            <div key={b.id} className="card p-5 flex items-center gap-5">
              <div className="flex-1">
                <div className="font-display text-lg">
                  {b.car?.year} {b.car?.make} {b.car?.model}
                </div>
                <div className="text-xs text-muted mt-1">
                  {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full border text-xs uppercase tracking-[0.15em] ${statusColor(b.status)}`}>
                {b.status.replace('_', ' ')}
              </div>
              <div className="font-display text-lg">${b.totalAmount}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
