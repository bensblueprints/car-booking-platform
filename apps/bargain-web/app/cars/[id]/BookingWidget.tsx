'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import type { Car } from '@carbooking/sdk';
import { apiClient } from '@/lib/api';

const today = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export default function BookingWidget({ car }: { car: Car }) {
  const router = useRouter();
  const [start, setStart] = useState(today(1));
  const [end, setEnd] = useState(today(4));
  const [youngDriver, setYoungDriver] = useState(false);

  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: () =>
      apiClient.quoteBooking({
        carId: car.id,
        start: new Date(start + 'T10:00:00').toISOString(),
        end: new Date(end + 'T10:00:00').toISOString(),
        youngDriver,
      }),
  });

  useEffect(() => {
    reset();
  }, [start, end, youngDriver, reset]);

  const days = useMemo(() => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return Math.max(1, Math.round((e - s) / 86400000));
  }, [start, end]);

  const handleQuote = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  const continueBooking = () => {
    const params = new URLSearchParams({
      start: new Date(start + 'T10:00:00').toISOString(),
      end: new Date(end + 'T10:00:00').toISOString(),
    });
    if (youngDriver) params.set('youngDriver', '1');
    router.push(`/book/${car.id}?${params.toString()}`);
  };

  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between mb-1">
        <div className="font-display text-2xl">
          ${car.dailyRate}
          <span className="text-muted text-sm font-normal">/day</span>
        </div>
        <div className="text-xs text-muted">${car.depositAmount} deposit</div>
      </div>
      <p className="text-xs text-muted mb-5">Book in 90 seconds. Free cancellation up to 24h before pickup.</p>

      <form onSubmit={handleQuote} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5 flex items-center gap-1">
              <Calendar size={10} /> Pickup
            </span>
            <input
              type="date"
              value={start}
              min={today(0)}
              onChange={(e) => setStart(e.target.value)}
              className="bg-ink-900 border border-line rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:border-flame/60"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5 flex items-center gap-1">
              <Calendar size={10} /> Return
            </span>
            <input
              type="date"
              value={end}
              min={start}
              onChange={(e) => setEnd(e.target.value)}
              className="bg-ink-900 border border-line rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:border-flame/60"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={youngDriver}
            onChange={(e) => setYoungDriver(e.target.checked)}
            className="rounded border-line bg-ink-900"
          />
          <span>Primary driver is under 25 (+$25/day)</span>
        </label>

        <button type="submit" disabled={isPending} className="btn-primary w-full justify-center">
          {isPending ? <Loader2 className="animate-spin" size={16} /> : 'Get price'}
          {!isPending && <ArrowRight size={16} />}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-lg border border-flame/40 bg-flame/5 text-sm flex gap-2 items-start">
          <AlertCircle size={16} className="text-flame flex-shrink-0 mt-0.5" />
          <span>{(error as any)?.message || 'Could not get a quote. Try different dates.'}</span>
        </div>
      )}

      {data && (
        <div className="mt-5 pt-5 border-t border-line">
          {data.available ? (
            <>
              <Row label={`${days} ${days === 1 ? 'day' : 'days'} × rate`} value={`$${data.quote.subtotal}`} />
              {Number(data.quote.fees) > 0 && <Row label="Fees" value={`$${data.quote.fees}`} />}
              <Row label="Tax" value={`$${data.quote.taxes}`} />
              <Row label="Deposit (refundable)" value={`$${data.quote.depositHeld}`} />
              <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-line">
                <span className="font-display">Total today</span>
                <span className="font-display text-2xl">${data.quote.totalAmount}</span>
              </div>
              <button onClick={continueBooking} className="btn-primary w-full justify-center mt-4">
                Continue to checkout <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <div className="text-sm text-flame">
              Not available for those dates — try adjusting them.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
