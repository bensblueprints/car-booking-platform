import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Settings() {
  const qc = useQueryClient();
  const { data: tenant } = useQuery({ queryKey: ['admin-tenant'], queryFn: () => api.admin.tenant() });
  const [branding, setBranding] = useState('');
  const [fees, setFees] = useState('');
  const [name, setName] = useState('');
  const [stripeKey, setStripeKey] = useState('');

  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setBranding(JSON.stringify(tenant.branding ?? {}, null, 2));
      setFees(JSON.stringify(tenant.fees ?? {}, null, 2));
      setStripeKey(tenant.stripeKey ?? '');
    }
  }, [tenant]);

  const save = useMutation({
    mutationFn: () => {
      let brandingObj: any = null;
      let feesObj: any = null;
      try { brandingObj = JSON.parse(branding); } catch { throw new Error('Invalid branding JSON'); }
      try { feesObj = JSON.parse(fees); } catch { throw new Error('Invalid fees JSON'); }
      return api.admin.updateTenant({ name, stripeKey: stripeKey || null, branding: brandingObj, fees: feesObj });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tenant'] }),
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-3xl font-display">Settings</h1>
      <div className="card p-6 space-y-4">
        <div><label>Business name</label><input className="w-full" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div>
          <label>Stripe secret key (overrides env — optional)</label>
          <input className="w-full font-mono text-xs" placeholder="sk_live_…" value={stripeKey} onChange={(e) => setStripeKey(e.target.value)} />
        </div>
        <div>
          <label>Branding (JSON)</label>
          <textarea rows={14} className="w-full font-mono text-xs" value={branding} onChange={(e) => setBranding(e.target.value)} />
        </div>
        <div>
          <label>Fees (JSON)</label>
          <textarea rows={6} className="w-full font-mono text-xs" value={fees} onChange={(e) => setFees(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save settings'}
          </button>
        </div>
        {save.isError && <div className="text-red-400 text-xs">{(save.error as any)?.message}</div>}
      </div>
    </div>
  );
}
