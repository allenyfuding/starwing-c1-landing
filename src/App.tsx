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

    // 用 AbortController 给 fetch 套个 8s 超时 — 避免浏览器挂死等 30s+
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

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
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

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
      window.clearTimeout(timeoutId);

      const aborted = err instanceof Error && err.name === 'AbortError';
      console.error(
        '[c1-landing] submit failed:',
        aborted ? 'fetch timeout (8s)' : err,
      );

      // Fallback：主站挂了就退到 mailto: 让用户的邮箱客户端把请求转给我们
      const subject = encodeURIComponent(`C1 Subscription · ${trimmed}`);
      const body = encodeURIComponent(
        `Email: ${trimmed}\nLocale: en\nSource: C1 Landing Page\n\nPlease add me to the C1 priority notification list.`,
      );
      const mailto = `mailto:bespoke@starwing-aero.com?subject=${subject}&body=${body}`;

      // 8s 超时或网络错误 → 自动唤起邮箱客户端（保证用户不丢失这次订阅）
      window.location.href = mailto;

      setStatus('success');
      setEmail('');
      showToast({
        kind: 'success',
        message: aborted
          ? 'Server slow — opening your email client to confirm.'
          : 'Network issue — opening your email client to confirm.',
      });
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
