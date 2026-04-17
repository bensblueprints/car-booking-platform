import { describe, it, expect } from 'vitest';
import { quoteBooking } from './pricing.js';

describe('quoteBooking', () => {
  const base = {
    dailyRate: 50,
    weeklyRate: 300,
    monthlyRate: 1000,
    depositAmount: 200,
  };

  it('prices a 3-day rental at daily rate', () => {
    const q = quoteBooking({
      ...base,
      start: new Date('2026-05-01T10:00:00Z'),
      end: new Date('2026-05-04T10:00:00Z'),
    });
    expect(q.days).toBe(3);
    expect(q.subtotal).toBe(150);
    expect(q.totalAmount).toBe(150);
    expect(q.depositHeld).toBe(200);
  });

  it('uses weekly rate when >= 7 days', () => {
    const q = quoteBooking({
      ...base,
      start: new Date('2026-05-01T10:00:00Z'),
      end: new Date('2026-05-10T10:00:00Z'), // 9 days = 1 week + 2 days
    });
    expect(q.days).toBe(9);
    expect(q.subtotal).toBe(300 + 100);
  });

  it('applies taxes and fees', () => {
    const q = quoteBooking({
      ...base,
      start: new Date('2026-05-01T10:00:00Z'),
      end: new Date('2026-05-02T10:00:00Z'),
      fees: { taxRate: 0.1, cleaningFee: 25 },
    });
    expect(q.subtotal).toBe(50);
    expect(q.fees).toBe(25);
    expect(q.taxes).toBe(7.5); // (50 + 25) * 0.1
    expect(q.totalAmount).toBe(82.5);
  });

  it('rounds up partial days', () => {
    const q = quoteBooking({
      ...base,
      start: new Date('2026-05-01T10:00:00Z'),
      end: new Date('2026-05-02T22:00:00Z'), // 1 day 12h
    });
    expect(q.days).toBe(2);
  });

  it('throws on invalid date range', () => {
    expect(() =>
      quoteBooking({
        ...base,
        start: new Date('2026-05-05T10:00:00Z'),
        end: new Date('2026-05-01T10:00:00Z'),
      }),
    ).toThrow();
  });
});
