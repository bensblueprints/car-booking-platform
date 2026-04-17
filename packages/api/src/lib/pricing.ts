import { Prisma } from '@prisma/client';

export interface PricingInput {
  dailyRate: Prisma.Decimal | number | string;
  weeklyRate?: Prisma.Decimal | number | string | null;
  monthlyRate?: Prisma.Decimal | number | string | null;
  depositAmount: Prisma.Decimal | number | string;
  start: Date;
  end: Date;
  fees?: {
    taxRate?: number;            // 0.06625 = 6.625%
    youngDriverFee?: number;     // flat
    airportFee?: number;
    cleaningFee?: number;
  } | null;
  youngDriver?: boolean;
  airportPickup?: boolean;
}

export interface Quote {
  days: number;
  dailyRate: number;
  subtotal: number;
  taxes: number;
  fees: number;
  depositHeld: number;
  totalAmount: number;
  breakdown: Array<{ label: string; amount: number }>;
}

const dec = (v: Prisma.Decimal | number | string | null | undefined): number =>
  v == null ? 0 : typeof v === 'number' ? v : Number(v.toString());

/** Round to 2 decimal places. Avoids FP drift by going through cents. */
const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Compute a booking quote. Uses weekly/monthly rates when they beat the daily rate.
 * Inclusive-exclusive day count: [start, end) rounds up partial days to full days.
 */
export function quoteBooking(input: PricingInput): Quote {
  const ms = input.end.getTime() - input.start.getTime();
  if (ms <= 0) throw new Error('end must be after start');
  const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));

  const daily = dec(input.dailyRate);
  const weekly = dec(input.weeklyRate);
  const monthly = dec(input.monthlyRate);

  // Choose the cheapest applicable bundle breakdown.
  let subtotal: number;
  const breakdown: Array<{ label: string; amount: number }> = [];

  if (monthly > 0 && days >= 28) {
    const months = Math.floor(days / 30);
    const remDays = days - months * 30;
    subtotal = r2(months * monthly + remDays * daily);
    if (months > 0) breakdown.push({ label: `${months} month${months > 1 ? 's' : ''} @ ${monthly.toFixed(2)}`, amount: r2(months * monthly) });
    if (remDays > 0) breakdown.push({ label: `${remDays} day${remDays > 1 ? 's' : ''} @ ${daily.toFixed(2)}`, amount: r2(remDays * daily) });
  } else if (weekly > 0 && days >= 7) {
    const weeks = Math.floor(days / 7);
    const remDays = days - weeks * 7;
    subtotal = r2(weeks * weekly + remDays * daily);
    if (weeks > 0) breakdown.push({ label: `${weeks} week${weeks > 1 ? 's' : ''} @ ${weekly.toFixed(2)}`, amount: r2(weeks * weekly) });
    if (remDays > 0) breakdown.push({ label: `${remDays} day${remDays > 1 ? 's' : ''} @ ${daily.toFixed(2)}`, amount: r2(remDays * daily) });
  } else {
    subtotal = r2(days * daily);
    breakdown.push({ label: `${days} day${days > 1 ? 's' : ''} @ ${daily.toFixed(2)}`, amount: subtotal });
  }

  const f = input.fees ?? {};
  let fees = 0;
  if (input.youngDriver && f.youngDriverFee) {
    fees += f.youngDriverFee;
    breakdown.push({ label: 'Young driver fee', amount: f.youngDriverFee });
  }
  if (input.airportPickup && f.airportFee) {
    fees += f.airportFee;
    breakdown.push({ label: 'Airport pickup fee', amount: f.airportFee });
  }
  if (f.cleaningFee) {
    fees += f.cleaningFee;
    breakdown.push({ label: 'Cleaning fee', amount: f.cleaningFee });
  }
  fees = r2(fees);

  const taxable = subtotal + fees;
  const taxes = r2(taxable * (f.taxRate ?? 0));
  if (taxes > 0) breakdown.push({ label: `Tax (${((f.taxRate ?? 0) * 100).toFixed(3)}%)`, amount: taxes });

  const depositHeld = r2(dec(input.depositAmount));
  const totalAmount = r2(subtotal + fees + taxes);

  return {
    days,
    dailyRate: r2(daily),
    subtotal: r2(subtotal),
    taxes,
    fees,
    depositHeld,
    totalAmount,
    breakdown,
  };
}
