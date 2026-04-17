import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { format } from 'date-fns';
import { Check, X, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

export default function Reviews() {
  const qc = useQueryClient();
  const [approved, setApproved] = useState<boolean | undefined>(undefined);
  const { data } = useQuery({ queryKey: ['admin-reviews', approved], queryFn: () => api.admin.reviews(approved) });
  const update = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) => api.admin.updateReview(id, { approved }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.admin.deleteReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display">Reviews</h1>
        <div className="flex gap-2">
          <button onClick={() => setApproved(undefined)} className={`btn text-xs ${approved === undefined ? 'bg-primary text-white' : 'bg-surface border border-border'}`}>All</button>
          <button onClick={() => setApproved(false)} className={`btn text-xs ${approved === false ? 'bg-primary text-white' : 'bg-surface border border-border'}`}>Pending</button>
          <button onClick={() => setApproved(true)} className={`btn text-xs ${approved === true ? 'bg-primary text-white' : 'bg-surface border border-border'}`}>Approved</button>
        </div>
      </div>

      <div className="grid gap-3">
        {data?.map((r: any) => (
          <div key={r.id} className="card p-4 flex justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{r.user.firstName} {r.user.lastName}</span>
                <span className="text-accent">{'★'.repeat(r.rating)}<span className="text-muted">{'★'.repeat(5 - r.rating)}</span></span>
                <span className="text-muted text-xs">· {r.car.year} {r.car.make} {r.car.model}</span>
              </div>
              {r.title && <div className="font-display mt-1">{r.title}</div>}
              <div className="text-sm text-muted mt-1">{r.body}</div>
              <div className="text-[10px] text-muted mt-2">{format(new Date(r.createdAt), 'PPP')}</div>
            </div>
            <div className="flex gap-2 items-start">
              {!r.approved && <button className="btn-secondary" onClick={() => update.mutate({ id: r.id, approved: true })}><Check size={14} /> Approve</button>}
              {r.approved && <button className="btn-ghost" onClick={() => update.mutate({ id: r.id, approved: false })}><X size={14} /> Unapprove</button>}
              <button className="btn-ghost text-red-400" onClick={() => confirm('Delete review?') && del.mutate(r.id)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {!data?.length && <div className="card p-8 text-center text-muted">No reviews yet.</div>}
      </div>
    </div>
  );
}
