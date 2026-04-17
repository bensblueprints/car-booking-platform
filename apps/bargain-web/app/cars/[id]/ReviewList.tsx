import type { Review } from '@carbooking/sdk';
import { Reveal } from '@/components/Reveal';

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <Reveal>
      <div className="mt-14">
        <div className="flex items-baseline gap-4 mb-6">
          <h2 className="font-display text-2xl">What renters say</h2>
          <span className="text-gold">{'★'.repeat(Math.round(avg))}</span>
          <span className="text-muted text-sm">
            {avg.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gold text-sm">{'★'.repeat(r.rating)}</div>
                <div className="text-xs text-muted">
                  {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
              {r.title && <div className="font-semibold mb-1">{r.title}</div>}
              <p className="text-sm text-bone-200/80 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
