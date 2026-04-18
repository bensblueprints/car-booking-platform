import Link from 'next/link';
import { Star, ExternalLink, MapPin } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { Reveal, Stagger, StaggerItem } from '@/components/Reveal';

export const metadata = {
  title: `Reviews — ${BRAND.short}`,
  description: `Read verified customer reviews for ${BRAND.short}. Rated 4.4 stars across 144 Google reviews.`,
};

// Revalidate every 6 hours so review data refreshes without a full rebuild
export const revalidate = 21600;

const GOOGLE_MAPS_URL = 'https://share.google/S5cyvvWkex4CAW1c3';
const AGGREGATE_RATING = 4.4;
const AGGREGATE_COUNT = 144;

type GoogleReview = {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  profile_photo_url?: string;
  time: number;
};

async function fetchGoogleReviews(): Promise<GoogleReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return [];

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&reviews_sort=newest&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 21600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { result?: { reviews?: GoogleReview[] } };
    return data.result?.reviews ?? [];
  } catch {
    return [];
  }
}

export default async function ReviewsPage() {
  const allReviews = await fetchGoogleReviews();
  // Hide 1-star reviews per client request
  const reviews = allReviews.filter((r) => r.rating >= 2);

  return (
    <>
      {/* Hero */}
      <section className="container-px pt-14 md:pt-20 pb-10">
        <Reveal>
          <div className="max-w-3xl">
            <div className="eyebrow mb-3"><span className="w-8 h-px bg-gold" /> What drivers say</div>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[0.95]">
              Four decades of <span className="italic font-light bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">happy renters.</span>
            </h1>
            <p className="mt-6 text-lg text-bone-200/80 leading-relaxed max-w-2xl">
              These reviews come straight from our Google Business profile — real people, real rentals, real service.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Rating summary */}
      <section className="container-px pb-10">
        <Reveal>
          <div className="card p-6 md:p-8 grid md:grid-cols-[auto_1fr_auto] gap-6 items-center">
            <div className="flex items-baseline gap-3">
              <div className="font-display text-6xl md:text-7xl font-black text-gold">{AGGREGATE_RATING}</div>
              <div>
                <StarRow rating={AGGREGATE_RATING} size={18} />
                <div className="text-xs text-muted mt-1">{AGGREGATE_COUNT} Google reviews</div>
              </div>
            </div>
            <div className="text-sm text-muted leading-relaxed">
              Average rating across {AGGREGATE_COUNT} verified Google reviews. We don't curate or remove bad feedback — see every review on our Google profile.
            </div>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary whitespace-nowrap"
            >
              View on Google <ExternalLink size={14} />
            </a>
          </div>
        </Reveal>
      </section>

      {/* Reviews grid */}
      <section className="container-px pb-10">
        {reviews.length > 0 ? (
          <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <StaggerItem key={`${r.author_name}-${r.time}`}>
                <ReviewCard review={r} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Reveal>
            <div className="card p-10 text-center">
              <div className="text-sm text-muted mb-4">
                Live reviews load here directly from our Google Business profile. Read every review on Google in the meantime.
              </div>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mx-auto"
              >
                See all {AGGREGATE_COUNT} reviews <ExternalLink size={14} />
              </a>
            </div>
          </Reveal>
        )}
      </section>

      {/* Map embed */}
      <section className="container-px pb-14 md:pb-20">
        <Reveal>
          <div className="card overflow-hidden">
            <div className="p-6 flex items-start gap-4 border-b border-line">
              <MapPin size={18} className="text-flame mt-1 flex-shrink-0" />
              <div>
                <div className="font-display text-lg">{BRAND.name}</div>
                <div className="text-sm text-muted">{BRAND.address}</div>
                <div className="text-sm text-muted">{BRAND.phone}</div>
              </div>
            </div>
            <iframe
              src="https://www.google.com/maps?q=Bargain+Rent-A-Car+of+America+300+N+White+Horse+Pike+Somerdale+NJ&output=embed"
              width="100%"
              height="420"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0 }}
              title="Bargain Rent-A-Car on Google Maps"
            />
          </div>
        </Reveal>
      </section>

      {/* CTA to leave a review */}
      <section className="container-px pb-20">
        <Reveal>
          <div className="card p-8 md:p-12 text-center bg-gradient-to-br from-ink-900 to-ink-950 border-gold/30">
            <div className="font-display text-2xl md:text-4xl mb-3">Rented from us recently?</div>
            <p className="text-muted max-w-xl mx-auto mb-6">
              Reviews help your neighbors find us. If we took care of you, a quick line on Google means the world.
            </p>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mx-auto"
            >
              Leave a Google review <ExternalLink size={14} />
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  return (
    <div className="card p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        {review.profile_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.profile_photo_url}
            alt={review.author_name}
            className="w-10 h-10 rounded-full border border-line"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-ink-800 border border-line flex items-center justify-center text-sm font-display">
            {review.author_name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{review.author_name}</div>
          <div className="text-xs text-muted">{review.relative_time_description}</div>
        </div>
      </div>
      <StarRow rating={review.rating} size={14} />
      <p className="mt-3 text-sm text-bone-200/80 leading-relaxed flex-grow whitespace-pre-line">
        {review.text}
      </p>
    </div>
  );
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  // Render 5 stars; fill based on rating (rounded to nearest half via opacity)
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="inline-flex items-center gap-0.5 text-gold" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = i < full;
        const isHalf = !isFull && i === full && half;
        return (
          <Star
            key={i}
            size={size}
            fill="currentColor"
            strokeWidth={0}
            className={isFull ? '' : isHalf ? 'opacity-70' : 'opacity-25'}
          />
        );
      })}
    </div>
  );
}
