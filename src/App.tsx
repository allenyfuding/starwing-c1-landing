import { useState, type FormEvent } from 'react';
import './App.css';

const API_ENDPOINT =
  (import.meta.env.VITE_API_ENDPOINT as string | undefined) ??
  'https://starwing-site-gv8nkw40i-starwing.vercel.app/api/intent';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface Toast {
  kind: 'success' | 'error';
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function App() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (t: Toast) => {
    setToast(t);
    window.setTimeout(() => setToast((cur) => (cur === t ? null : cur)), 5200);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      showToast({ kind: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'C1 · Ming-Feng',
          name: 'C1-Landing Subscriber',
          contact: trimmed,
          locale: 'en',
        }),
      });

      // Handle non-JSON responses (e.g. Vercel 404 HTML)
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : null;

      if (res.ok && data?.success) {
        setStatus('success');
        setEmail('');
        showToast({
          kind: 'success',
          message: 'Received. Our concierge will reach you within 24 hours.',
        });
      } else if (res.status === 503) {
        // DirectMail 未配置 — 仍视为成功记录（Vercel logs 兜底）
        setStatus('success');
        setEmail('');
        showToast({
          kind: 'success',
          message: 'Received. Our concierge will reach you within 24 hours.',
        });
        console.warn('[c1-landing] intent 503 (mail not configured yet):', data);
      } else {
        setStatus('error');
        showToast({
          kind: 'error',
          message: data?.error || 'Subscription failed. Please try again.',
        });
      }
    } catch (err) {
      setStatus('error');
      showToast({
        kind: 'error',
        message: 'Network error. Please check your connection and retry.',
      });
      console.error('[c1-landing] submit error:', err);
    } finally {
      // 2.5s 后允许再次提交
      window.setTimeout(() => setStatus('idle'), 2500);
    }
  };

  return (
    <main className="page">
      <section className="hero" aria-label="C1 主视觉">
        <img
          className="hero-img"
          src="/c1-hero.jpg"
          alt="STARWING C1 · Carbon · Titanium · Aurora"
          loading="eager"
          decoding="async"
        />
        <div className="hero-vignette" />
        <div className="hero-corner">
          <span>C1 · EDGECHORD</span>
          <span>EST. 2026</span>
        </div>
      </section>

      <section className="content">
        <div className="brand">
          <img
            className="brand-logo"
            src="/starwing-logo.svg"
            alt="STARWING"
            width="187"
            height="24"
          />
          <p className="brand-tagline">御苍穹之骨，纳方寸之境</p>
          <p className="brand-sub">Carbon · Titanium · Aurora</p>
          <p className="brand-coming">Coming · 2026</p>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <input
              className="form-input"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'submitting'}
              aria-label="Email address"
              required
            />
            <button
              className="form-submit"
              type="submit"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Sending' : 'Subscribe'}
            </button>
          </div>
          <p className="form-hint"></p>
        </form>
      </section>

      <footer className="foot">© 2026</footer>

      {toast && (
        <div
          className={`toast ${toast.kind === 'error' ? 'toast--err' : ''}`}
          role="status"
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}
