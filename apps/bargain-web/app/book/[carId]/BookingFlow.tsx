'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { ArrowRight, ArrowLeft, Loader2, Check, AlertCircle } from 'lucide-react';
import type { Car } from '@carbooking/sdk';
import { apiClient, getToken, setToken } from '@/lib/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const today = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const toDateInput = (iso?: string, fallbackOffset = 1) => {
  if (!iso) return today(fallbackOffset);
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return today(fallbackOffset);
  }
};

type Step = 'dates' | 'account' | 'license' | 'payment' | 'done';

export default function BookingFlow({
  car,
  defaultStart,
  defaultEnd,
  defaultYoungDriver,
}: {
  car: Car;
  defaultStart?: string;
  defaultEnd?: string;
  defaultYoungDriver?: boolean;
}) {
  const [step, setStep] = useState<Step>('dates');
  const [start, setStart] = useState(toDateInput(defaultStart, 1));
  const [end, setEnd] = useState(toDateInput(defaultEnd, 4));
  const youngDriver = false; // Bargain only requires 21+; no under-25 surcharge.

  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [license, setLicense] = useState({
    licenseNumber: '',
    licenseExpiry: '',
    dateOfBirth: '',
  });
  const [ageError, setAgeError] = useState<string | null>(null);

  const calcAge = (dob: string) => {
    if (!dob) return 0;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return 0;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  };

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const hasToken = typeof window !== 'undefined' && !!getToken();

  const quoteQ = useQuery({
    queryKey: ['quote', car.id, start, end, youngDriver],
    enabled: step !== 'dates' ? true : false,
    queryFn: () =>
      apiClient.quoteBooking({
        carId: car.id,
        start: new Date(start + 'T10:00:00').toISOString(),
        end: new Date(end + 'T10:00:00').toISOString(),
        youngDriver,
      }),
  });

  const liveQuote = useQuery({
    queryKey: ['quote-live', car.id, start, end, youngDriver],
    enabled: step === 'dates',
    queryFn: () =>
      apiClient.quoteBooking({
        carId: car.id,
        start: new Date(start + 'T10:00:00').toISOString(),
        end: new Date(end + 'T10:00:00').toISOString(),
        youngDriver,
      }),
  });

  const authMut = useMutation({
    mutationFn: async () => {
      if (authMode === 'register') {
        return apiClient.register({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || undefined,
        });
      }
      return apiClient.login({ email: form.email, password: form.password });
    },
    onSuccess: (data) => {
      setToken(data.token);
      setStep('license');
    },
  });

  const licenseMut = useMutation({
    mutationFn: () =>
      apiClient.updateMe({
        dateOfBirth: license.dateOfBirth,
        licenseNumber: license.licenseNumber,
        licenseExpiry: license.licenseExpiry,
      }),
    onSuccess: () => createBookingMut.mutate(),
  });

  const createBookingMut = useMutation({
    mutationFn: () =>
      apiClient.createBooking({
        carId: car.id,
        start: new Date(start + 'T10:00:00').toISOString(),
        end: new Date(end + 'T10:00:00').toISOString(),
        youngDriver,
      }),
    onSuccess: (data) => {
      setBookingId(data.booking.id);
      setClientSecret(data.clientSecret);
      setStep('payment');
    },
  });

  const goFromDates = () => {
    if (hasToken) setStep('license');
    else setStep('account');
  };

  return (
    <div>
      <Stepper step={step} />

      {step === 'dates' && (
        <div className="card p-6 md:p-8">
          <h2 className="font-display text-xl mb-5">1. Pickup & return</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Pickup date">
              <input
                type="date"
                min={today(0)}
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Return date">
              <input
                type="date"
                min={start}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <div className="mt-4 p-3 rounded-lg border border-line bg-ink-900/40 text-xs text-muted">
            Drivers must be 21+ with a valid license. You pay the deposit today — your rental cost is deducted from it at return, and the balance is refunded.
          </div>

          {liveQuote.data?.available && (
            <div className="mt-6 p-4 rounded-lg border border-line bg-ink-900/60 text-sm">
              <div className="flex justify-between"><span className="text-muted">Rental ({liveQuote.data.quote.days} day{liveQuote.data.quote.days > 1 ? 's' : ''})</span><span>${liveQuote.data.quote.subtotal}</span></div>
              {Number(liveQuote.data.quote.fees) > 0 && (
                <div className="flex justify-between"><span className="text-muted">Fees</span><span>${liveQuote.data.quote.fees}</span></div>
              )}
              {Number(liveQuote.data.quote.taxes) > 0 && (
                <div className="flex justify-between"><span className="text-muted">Tax</span><span>${liveQuote.data.quote.taxes}</span></div>
              )}
              <div className="flex justify-between text-muted text-xs mt-2 pt-2 border-t border-line"><span>Rental total (deducted from deposit at return)</span><span>${liveQuote.data.quote.totalAmount}</span></div>
              <div className="flex justify-between font-display text-lg mt-2"><span>Deposit charged today</span><span>${liveQuote.data.quote.depositHeld}</span></div>
            </div>
          )}

          {liveQuote.data?.available === false && (
            <div className="mt-4 p-3 rounded-lg border border-flame/40 bg-flame/5 text-sm flex gap-2">
              <AlertCircle size={16} className="text-flame flex-shrink-0" />
              Not available for those dates. Try adjusting them.
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button onClick={goFromDates} className="btn-primary" disabled={!liveQuote.data?.available}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 'account' && (
        <div className="card p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl">2. Your info</h2>
            <button
              onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
              className="text-xs text-flame hover:underline"
            >
              {authMode === 'register' ? 'Already have an account? Sign in' : 'New here? Create account'}
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              authMut.mutate();
            }}
            className="space-y-3"
          >
            {authMode === 'register' && (
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="First name">
                  <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" />
                </Field>
                <Field label="Last name">
                  <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" />
                </Field>
              </div>
            )}
            <Field label="Email">
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
            </Field>
            {authMode === 'register' && (
              <Field label="Phone">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
              </Field>
            )}
            <Field label="Password">
              <input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
            </Field>

            {authMut.error && (
              <div className="p-3 rounded-lg border border-flame/40 bg-flame/5 text-sm flex gap-2">
                <AlertCircle size={16} className="text-flame flex-shrink-0" />
                {(authMut.error as any)?.message || 'Could not sign you in.'}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep('dates')} className="btn-ghost">
                <ArrowLeft size={14} /> Back
              </button>
              <button type="submit" disabled={authMut.isPending} className="btn-primary">
                {authMut.isPending ? <Loader2 className="animate-spin" size={16} /> : <>Continue <ArrowRight size={16} /></>}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 'license' && (
        <div className="card p-6 md:p-8">
          <h2 className="font-display text-xl mb-2">3. Driver's license</h2>
          <p className="text-sm text-muted mb-5">Must be 21 or older with a valid license. We verify at pickup — no credit check.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const age = calcAge(license.dateOfBirth);
              if (age < 21) {
                setAgeError('Drivers must be at least 21 years old to rent.');
                return;
              }
              setAgeError(null);
              licenseMut.mutate();
            }}
            className="space-y-3"
          >
            <Field label="Date of birth">
              <input required type="date" value={license.dateOfBirth} onChange={(e) => { setLicense({ ...license, dateOfBirth: e.target.value }); setAgeError(null); }} className="input" />
            </Field>
            <Field label="Driver's license number">
              <input required value={license.licenseNumber} onChange={(e) => setLicense({ ...license, licenseNumber: e.target.value })} className="input" />
            </Field>
            <Field label="License expiration">
              <input required type="date" value={license.licenseExpiry} onChange={(e) => setLicense({ ...license, licenseExpiry: e.target.value })} className="input" />
            </Field>

            {ageError && (
              <div className="p-3 rounded-lg border border-flame/40 bg-flame/5 text-sm flex gap-2">
                <AlertCircle size={16} className="text-flame flex-shrink-0" />
                {ageError}
              </div>
            )}
            {(licenseMut.error || createBookingMut.error) && (
              <div className="p-3 rounded-lg border border-flame/40 bg-flame/5 text-sm flex gap-2">
                <AlertCircle size={16} className="text-flame flex-shrink-0" />
                {((licenseMut.error || createBookingMut.error) as any)?.message || 'Could not save your info.'}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(hasToken ? 'dates' : 'account')} className="btn-ghost">
                <ArrowLeft size={14} /> Back
              </button>
              <button type="submit" disabled={licenseMut.isPending || createBookingMut.isPending} className="btn-primary">
                {licenseMut.isPending || createBookingMut.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>Continue to payment <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 'payment' && clientSecret && (
        <div className="card p-6 md:p-8">
          <h2 className="font-display text-xl mb-5">4. Payment</h2>
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#E11D2E' } } }}>
            <PaymentStep bookingId={bookingId!} onDone={() => setStep('done')} />
          </Elements>
        </div>
      )}

      {step === 'payment' && !clientSecret && (
        <div className="card p-8 text-center">
          <h2 className="font-display text-xl mb-3">4. Payment</h2>
          <div className="text-sm text-muted mb-2">This payment was simulated.</div>
          <div className="text-xs text-muted max-w-md mx-auto mb-5">
            In production, your deposit is charged today and your rental cost is deducted from it at return — any remaining balance is refunded.
          </div>
          <button onClick={() => setStep('done')} className="btn-primary mx-auto">
            Continue <ArrowRight size={16} />
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="card p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-flame/10 border border-flame/40 flex items-center justify-center mb-4">
            <Check className="text-flame" size={24} />
          </div>
          <h2 className="font-display text-3xl mb-2">You're booked.</h2>
          <p className="text-muted max-w-md mx-auto mb-6">
            We just emailed your confirmation. Show up at pickup with your license and the card you paid with — that's it.
          </p>
          <a href="/account" className="btn-primary mx-auto">
            View my bookings <ArrowRight size={16} />
          </a>
        </div>
      )}
    </div>
  );
}

function PaymentStep({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setErr(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/account?booking=${bookingId}`,
      },
    });

    if (error) {
      setErr(error.message || 'Payment failed.');
      setSubmitting(false);
      return;
    }
    if (paymentIntent?.status === 'succeeded') {
      onDone();
      router.refresh();
    } else {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <PaymentElement />
      {err && (
        <div className="p-3 rounded-lg border border-flame/40 bg-flame/5 text-sm flex gap-2">
          <AlertCircle size={16} className="text-flame flex-shrink-0" /> {err}
        </div>
      )}
      <button type="submit" disabled={!stripe || submitting} className="btn-primary w-full justify-center">
        {submitting ? <Loader2 className="animate-spin" size={16} /> : <>Pay & confirm <ArrowRight size={16} /></>}
      </button>
      <p className="text-xs text-muted text-center">Your deposit is held, not charged. It's released 2–3 business days after return.</p>
    </form>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'dates', label: 'Dates' },
    { key: 'account', label: 'Account' },
    { key: 'license', label: 'License' },
    { key: 'payment', label: 'Payment' },
  ];
  const idx = useMemo(() => {
    const order: Step[] = ['dates', 'account', 'license', 'payment', 'done'];
    return order.indexOf(step);
  }, [step]);

  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-semibold ${
              i < idx ? 'bg-flame border-flame text-white' : i === idx ? 'border-flame text-flame' : 'border-line text-muted'
            }`}
          >
            {i < idx ? <Check size={12} /> : i + 1}
          </div>
          <span className={`text-xs uppercase tracking-[0.15em] ${i === idx ? 'text-bone-100' : 'text-muted'}`}>{s.label}</span>
          {i < steps.length - 1 && <div className="w-6 h-px bg-line" />}
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
