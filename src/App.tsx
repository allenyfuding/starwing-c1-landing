import { useState, type FormEvent } from 'react';
import './App.css';

// FormSubmit.co：免注册、免 token。POST 任意 form 字段自动转发到目标邮箱。
// 首次使用：bespoke@starwing-aero.com 会收到 FormSubmit 激活邮件 → 点确认 → 激活后所有提交自动转发。
// _captcha=false：关闭原生验证码（落地页已经做过前端校验）
// _template=box：邮件用 box 模板，更清晰
// _subject：自定义邮件主题
const FORMSUBMIT_ENDPOINT =
  (import.meta.env.VITE_API_ENDPOINT as string | undefined) ??
  'https://formsubmit.co/ajax/bespoke@starwing-aero.com';

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

    // 8s 超时 — 避免浏览器挂死等 30s+
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(FORMSUBMIT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `[C1 Landing] New subscription: ${trimmed}`,
          _captcha: 'false',
          _template: 'box',
          email: trimmed,
          source: 'C1 Landing Page',
          locale: 'en',
          product: 'C1 · EDGECHORD',
          subscribed_at: new Date().toISOString(),
        }),
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      // FormSubmit ajax 端点：成功 = 200 + { success: true }
      if (res.ok) {
        setStatus('success');
        setEmail('');
        showToast({
          kind: 'success',
          message: 'Received. Our concierge will reach you within 24 hours.',
        });
      } else {
        setStatus('error');
        showToast({
          kind: 'error',
          message: 'Subscription failed. Please try again in a moment.',
        });
      }
    } catch (err) {
      window.clearTimeout(timeoutId);
      const aborted = err instanceof Error && err.name === 'AbortError';
      console.error(
        '[c1-landing] submit failed:',
        aborted ? 'fetch timeout (8s)' : err,
      );
      setStatus('error');
      showToast({
        kind: 'error',
        message: aborted
          ? 'Server slow. Please try again.'
          : 'Network error. Please try again.',
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
