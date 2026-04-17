import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { api } from '../lib/api';

const MAX_UPLOAD_BYTES = 2_000_000; // 2MB

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  try { return new Date(iso).toISOString().slice(0, 10); } catch { return ''; }
}

export default function CustomerDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data: u } = useQuery({ queryKey: ['customer', id], queryFn: () => api.admin.customer(id!) });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (u) {
      setForm({
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        phone: u.phone ?? '',
        dateOfBirth: dateInput(u.dateOfBirth),
        licenseNumber: u.licenseNumber ?? '',
        licenseExpiry: dateInput(u.licenseExpiry),
        licenseImage: u.licenseImage ?? '',
      });
    }
  }, [u]);

  const save = useMutation({
    mutationFn: () => {
      const payload: any = { ...form };
      for (const k of Object.keys(payload)) if (payload[k] === '') payload[k] = null;
      return api.admin.updateCustomer(id!, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer', id] });
      setEditing(false);
      setErr(null);
    },
    onError: (e: any) => setErr(e?.message || 'Could not save'),
  });

  const onLicenseFile = async (file: File) => {
    if (file.size > MAX_UPLOAD_BYTES) {
      setErr(`License image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 2MB.`);
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setForm({ ...form, licenseImage: dataUrl });
    setErr(null);
  };

  if (!u) return <div className="text-muted">Loading…</div>;

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display">{u.firstName} {u.lastName}</h1>
        <div className="flex gap-2">
          {!editing && <button onClick={() => setEditing(true)} className="btn text-sm px-3 py-1 bg-surface border border-border rounded">Edit</button>}
          <Link to="/customers" className="btn text-sm px-3 py-1 bg-surface border border-border rounded">Back</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5 space-y-3 text-sm">
          {!editing && (
            <>
              <Field k="Email" v={u.email} />
              <Field k="Phone" v={u.phone ?? '—'} />
              <Field k="Date of birth" v={u.dateOfBirth ? format(new Date(u.dateOfBirth), 'PPP') : '—'} />
              <Field k="License #" v={u.licenseNumber ?? '—'} />
              <Field k="License expiry" v={u.licenseExpiry ? format(new Date(u.licenseExpiry), 'PPP') : '—'} />
              {u.licenseImage ? (
                <a href={u.licenseImage} target="_blank" rel="noreferrer" className="block">
                  <img src={u.licenseImage} className="mt-2 w-full rounded border border-border" alt="Driver's license" />
                </a>
              ) : (
                <div className="text-xs text-muted mt-2">No license image on file.</div>
              )}
            </>
          )}

          {editing && (
            <>
              <div className="text-xs text-muted mb-1">Email (read-only)</div>
              <div className="text-sm mb-3">{u.email}</div>

              <Input label="First name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
              <Input label="Last name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
              <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={(v) => setForm({ ...form, dateOfBirth: v })} />
              <Input label="License number" value={form.licenseNumber} onChange={(v) => setForm({ ...form, licenseNumber: v })} />
              <Input label="License expiry" type="date" value={form.licenseExpiry} onChange={(v) => setForm({ ...form, licenseExpiry: v })} />

              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1">License image</div>
                {form.licenseImage && (
                  <img src={form.licenseImage} className="w-full rounded border border-border mb-2" alt="" />
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn text-xs px-3 py-1 bg-surface border border-border rounded">
                    {form.licenseImage ? 'Replace image' : 'Upload image'}
                  </button>
                  {form.licenseImage && (
                    <button type="button" onClick={() => setForm({ ...form, licenseImage: '' })} className="btn text-xs px-3 py-1 border border-red-500/40 text-red-400 rounded">
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onLicenseFile(f); e.currentTarget.value = ''; }}
                />
                <div className="text-[10px] text-muted mt-1">Or paste a URL:</div>
                <input value={form.licenseImage ?? ''} onChange={(e) => setForm({ ...form, licenseImage: e.target.value })} placeholder="https://…" />
              </div>

              {err && <div className="p-2 rounded border border-red-500/40 bg-red-500/5 text-xs text-red-400">{err}</div>}

              <div className="flex gap-2 pt-2">
                <button onClick={() => save.mutate()} disabled={save.isPending} className="btn bg-primary text-white px-3 py-1 rounded text-sm flex-1">
                  {save.isPending ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => { setEditing(false); setErr(null); }} className="btn bg-surface border border-border px-3 py-1 rounded text-sm">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <div className="card p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg">Bookings ({u.bookings.length})</h2>
            <Link to={`/bookings/new?userId=${u.id}`} className="btn text-xs px-3 py-1 bg-primary text-white rounded">+ Book for this customer</Link>
          </div>
          <div className="divide-y divide-border">
            {u.bookings.length === 0 && <div className="text-muted text-sm py-4">No bookings yet.</div>}
            {u.bookings.map((b: any) => (
              <div key={b.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <div className="font-medium">{b.car.year} {b.car.make} {b.car.model}</div>
                  <div className="text-xs text-muted">{format(new Date(b.startDate), 'MMM d')} → {format(new Date(b.endDate), 'MMM d, yyyy')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge-${b.status}`}>{b.status.replace('_', ' ')}</span>
                  <Link className="text-primary text-xs hover:underline" to={`/bookings/${b.id}`}>Open →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return <div><div className="text-xs text-muted">{k}</div><div>{v}</div></div>;
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1">{label}</span>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
