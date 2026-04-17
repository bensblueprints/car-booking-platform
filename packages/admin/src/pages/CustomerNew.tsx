import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function CustomerNew() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    licenseNumber: '',
    licenseExpiry: '',
    password: '',
  });
  const [err, setErr] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () => {
      const payload: any = { ...form };
      for (const k of Object.keys(payload)) if (payload[k] === '') delete payload[k];
      return api.admin.createCustomer(payload);
    },
    onSuccess: (c: any) => nav(`/customers/${c.id}`),
    onError: (e: any) => setErr(e?.message || 'Could not create customer'),
  });

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display">New customer</h1>
        <button onClick={() => nav('/customers')} className="btn text-xs px-3 py-1 bg-surface border border-border">Cancel</button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setErr(null); mut.mutate(); }}
        className="card p-6 space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name *">
            <input required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
          </Field>
          <Field label="Last name *">
            <input required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
          </Field>
        </div>
        <Field label="Email *">
          <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date of birth">
            <input type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
          </Field>
          <Field label="License expiry">
            <input type="date" value={form.licenseExpiry} onChange={(e) => set('licenseExpiry', e.target.value)} />
          </Field>
        </div>
        <Field label="Driver's license #">
          <input value={form.licenseNumber} onChange={(e) => set('licenseNumber', e.target.value)} />
        </Field>
        <Field label="Temporary password (optional — leave blank to create without login)">
          <input type="text" minLength={8} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="at least 8 chars" />
        </Field>

        {err && <div className="p-3 rounded border border-red-500/40 bg-red-500/5 text-sm text-red-400">{err}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="submit" disabled={mut.isPending} className="btn bg-primary text-white px-4 py-2 rounded">
            {mut.isPending ? 'Creating…' : 'Create customer'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1">{label}</span>
      {children}
    </label>
  );
}
