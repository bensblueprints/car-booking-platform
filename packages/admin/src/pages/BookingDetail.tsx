import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { api } from '../lib/api';

const MAX_UPLOAD_BYTES = 4_000_000; // 4MB per file (PDFs can be chunky)

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isImage(url: string) {
  if (!url) return false;
  if (url.startsWith('data:image/')) return true;
  return /\.(jpe?g|png|gif|webp|heic|avif)$/i.test(url.split('?')[0]);
}

export default function BookingDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data: b } = useQuery({ queryKey: ['booking', id], queryFn: () => api.admin.booking(id!) });
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [contractUrl, setContractUrl] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const contractInput = useRef<HTMLInputElement>(null);
  const docsInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (b) {
      const bb: any = b;
      setStatus(bb.status);
      setNotes(bb.notes ?? '');
      setContractUrl(bb.contractUrl ?? '');
      setDocuments(bb.documents ?? []);
      setPaymentLink(bb.stripePaymentLinkUrl ?? null);
    }
  }, [b]);

  const save = useMutation({
    mutationFn: () => api.admin.updateBooking(id!, {
      status,
      notes,
      contractUrl: contractUrl || null,
      documents,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['booking', id] }),
  });

  const markPaid = useMutation({
    mutationFn: (method: 'cash' | 'card_at_location' | 'check' | 'other') => api.admin.markBookingPaid(id!, method),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['booking', id] });
      setActionMsg('Marked as paid.');
    },
    onError: (e: any) => setActionMsg(e?.message || 'Could not mark paid'),
  });

  const genLink = useMutation({
    mutationFn: () => api.admin.bookingPaymentLink(id!),
    onSuccess: (r) => {
      setPaymentLink(r.url);
      qc.invalidateQueries({ queryKey: ['booking', id] });
      setActionMsg(r.reused ? 'Using existing payment link.' : 'Payment link created.');
    },
    onError: (e: any) => setActionMsg(e?.message || 'Could not create payment link'),
  });

  const onContractFile = async (file: File) => {
    if (file.size > MAX_UPLOAD_BYTES) {
      setActionMsg(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 4MB.`);
      return;
    }
    setContractUrl(await fileToDataUrl(file));
    setActionMsg(null);
  };

  const onDocFiles = async (files: FileList) => {
    const next = [...documents];
    for (const f of Array.from(files)) {
      if (f.size > MAX_UPLOAD_BYTES) {
        setActionMsg(`Skipped ${f.name} (>4MB)`);
        continue;
      }
      next.push(await fileToDataUrl(f));
    }
    setDocuments(next);
  };

  const copyLink = async () => {
    if (!paymentLink) return;
    try { await navigator.clipboard.writeText(paymentLink); setActionMsg('Link copied.'); }
    catch { setActionMsg('Copy failed — select & copy manually.'); }
  };

  if (!b) return <div className="text-muted">Loading…</div>;
  const booking: any = b;

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display">Booking <span className="text-muted text-base">#{booking.id.slice(0, 8)}</span></h1>
        <Link to="/bookings" className="btn text-sm px-3 py-1 bg-surface border border-border rounded">Back</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5 md:col-span-2 space-y-5">
          <section>
            <h2 className="font-display text-lg mb-2">Trip</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-muted">Pickup</div><div>{format(new Date(booking.startDate), 'PPP')}</div></div>
              <div><div className="text-xs text-muted">Return</div><div>{format(new Date(booking.endDate), 'PPP')}</div></div>
              <div><div className="text-xs text-muted">Pickup location</div><div>{booking.pickupLocation?.name ?? '—'}</div></div>
              <div><div className="text-xs text-muted">Return location</div><div>{booking.dropoffLocation?.name ?? '—'}</div></div>
            </div>
          </section>

          <section className="border-t border-border pt-4">
            <h2 className="font-display text-lg mb-2">Car</h2>
            <div className="flex gap-3">
              {booking.car.images?.[0] && <img src={booking.car.images[0]} className="w-32 h-20 object-cover rounded" alt="" />}
              <div>
                <div className="font-semibold">{booking.car.year} {booking.car.make} {booking.car.model} {booking.car.trim ?? ''}</div>
                <div className="text-xs text-muted">{booking.car.category?.name} · {booking.car.transmission} · {booking.car.seats} seats</div>
              </div>
            </div>
          </section>

          <section className="border-t border-border pt-4">
            <h2 className="font-display text-lg mb-2">Customer</h2>
            <div className="text-sm">
              <div className="font-semibold">{booking.user.firstName} {booking.user.lastName}</div>
              <div className="text-muted">{booking.user.email}{booking.user.phone ? ` · ${booking.user.phone}` : ''}</div>
              {booking.user.licenseNumber && <div className="text-xs text-muted mt-1">License: {booking.user.licenseNumber}</div>}
              <Link to={`/customers/${booking.user.id}`} className="text-primary text-xs hover:underline">Open customer →</Link>
            </div>
          </section>

          <section className="border-t border-border pt-4">
            <h2 className="font-display text-lg mb-2">Rental contract</h2>
            {contractUrl ? (
              <div className="space-y-2">
                {isImage(contractUrl) ? (
                  <a href={contractUrl} target="_blank" rel="noreferrer">
                    <img src={contractUrl} className="max-h-64 rounded border border-border" alt="Contract" />
                  </a>
                ) : (
                  <a href={contractUrl} target="_blank" rel="noreferrer" className="inline-block px-3 py-2 bg-surface border border-border rounded text-sm hover:border-primary">
                    View contract (PDF/file) →
                  </a>
                )}
                <div className="flex gap-2">
                  <button onClick={() => contractInput.current?.click()} className="btn text-xs px-3 py-1 bg-surface border border-border rounded">Replace</button>
                  <button onClick={() => setContractUrl('')} className="btn text-xs px-3 py-1 border border-red-500/40 text-red-400 rounded">Remove</button>
                </div>
              </div>
            ) : (
              <button onClick={() => contractInput.current?.click()} className="btn text-sm px-3 py-1 bg-surface border border-border rounded">Upload contract (image or PDF)</button>
            )}
            <input
              ref={contractInput}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onContractFile(f); e.currentTarget.value = ''; }}
            />
            <div className="text-[10px] text-muted mt-1">Or paste URL:</div>
            <input value={contractUrl} onChange={(e) => setContractUrl(e.target.value)} placeholder="https://…" />
          </section>

          <section className="border-t border-border pt-4">
            <h2 className="font-display text-lg mb-2">Other documents ({documents.length})</h2>
            <div className="space-y-2">
              {documents.map((d, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-surface/40 border border-border rounded">
                  {isImage(d) ? (
                    <a href={d} target="_blank" rel="noreferrer"><img src={d} className="w-12 h-12 object-cover rounded" alt="" /></a>
                  ) : (
                    <a href={d} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline flex-1 truncate">File {i + 1} →</a>
                  )}
                  <div className="flex-1 text-xs text-muted truncate">{d.startsWith('data:') ? `${(d.length / 1024).toFixed(0)}KB upload` : d}</div>
                  <button onClick={() => setDocuments(documents.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:underline">Remove</button>
                </div>
              ))}
              <button onClick={() => docsInput.current?.click()} className="btn text-sm px-3 py-1 bg-surface border border-border rounded">+ Add files</button>
              <input
                ref={docsInput}
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => { if (e.target.files) onDocFiles(e.target.files); e.currentTarget.value = ''; }}
              />
            </div>
          </section>
        </div>

        <div className="card p-5 space-y-5">
          <section>
            <h2 className="font-display text-lg mb-2">Pricing</h2>
            <dl className="text-sm space-y-1">
              <Row k="Subtotal" v={`$${Number(booking.subtotal).toFixed(2)}`} />
              <Row k="Fees" v={`$${Number(booking.fees).toFixed(2)}`} />
              <Row k="Tax" v={`$${Number(booking.taxes).toFixed(2)}`} />
              <Row k="Deposit" v={`$${Number(booking.depositHeld).toFixed(2)}`} />
              <div className="border-t border-border pt-2 mt-2">
                <Row k={<span className="font-semibold">Total</span>} v={<span className="font-semibold">${Number(booking.totalAmount).toFixed(2)}</span>} />
              </div>
            </dl>
          </section>

          <section className="border-t border-border pt-4">
            <h2 className="font-display text-lg mb-2">Payment</h2>
            <div className="text-xs text-muted mb-2">
              {booking.paidAt ? (
                <>Paid {format(new Date(booking.paidAt), 'PPP')} · {booking.paymentMethod ?? 'stripe'}</>
              ) : booking.stripePaymentId ? (
                <>Stripe intent {booking.stripePaymentId.slice(0, 14)}…</>
              ) : (
                <>Not yet paid</>
              )}
            </div>

            {!booking.paidAt && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => markPaid.mutate('cash')} disabled={markPaid.isPending} className="btn text-xs px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded">Paid — cash</button>
                  <button onClick={() => markPaid.mutate('card_at_location')} disabled={markPaid.isPending} className="btn text-xs px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded">Paid — card on-site</button>
                  <button onClick={() => markPaid.mutate('check')} disabled={markPaid.isPending} className="btn text-xs px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded">Paid — check</button>
                  <button onClick={() => markPaid.mutate('other')} disabled={markPaid.isPending} className="btn text-xs px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded">Paid — other</button>
                </div>

                <button onClick={() => genLink.mutate()} disabled={genLink.isPending} className="btn text-sm px-3 py-1 bg-primary text-white rounded w-full">
                  {genLink.isPending ? 'Generating…' : paymentLink ? 'Re-show payment link' : 'Create Stripe payment link'}
                </button>
              </div>
            )}

            {paymentLink && (
              <div className="mt-2 p-2 rounded border border-primary/40 bg-primary/5 text-xs space-y-1">
                <div className="break-all">{paymentLink}</div>
                <div className="flex gap-2">
                  <button onClick={copyLink} className="btn text-[10px] px-2 py-0.5 bg-surface border border-border rounded">Copy</button>
                  <a href={paymentLink} target="_blank" rel="noreferrer" className="btn text-[10px] px-2 py-0.5 bg-surface border border-border rounded">Open</a>
                  <a
                    href={`mailto:${booking.user.email}?subject=${encodeURIComponent('Your rental payment link')}&body=${encodeURIComponent(`Hi ${booking.user.firstName},\n\nPay for your rental here:\n${paymentLink}\n\nThanks!`)}`}
                    className="btn text-[10px] px-2 py-0.5 bg-surface border border-border rounded"
                  >Email customer</a>
                  <a
                    href={`sms:${booking.user.phone ?? ''}?body=${encodeURIComponent(`Your rental payment link: ${paymentLink}`)}`}
                    className="btn text-[10px] px-2 py-0.5 bg-surface border border-border rounded"
                  >SMS</a>
                </div>
              </div>
            )}

            {actionMsg && <div className="mt-2 text-xs text-primary">{actionMsg}</div>}
          </section>

          <section className="border-t border-border pt-4">
            <label className="block mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1">Status</span>
              <select className="w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
                {['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1">Internal notes</span>
              <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <button className="btn bg-primary text-white px-3 py-2 rounded w-full" onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: any) {
  return <div className="flex justify-between"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>;
}
