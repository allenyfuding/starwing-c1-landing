import { useState, useRef, type FormEvent } from 'react';
import './App.css';

// ============== 邮箱 endpoint（form action + hidden iframe 模式） ==============
// 抗 VPN/墙、走浏览器原生 POST、跨域无 CORS、主页面不跳走
// 改 endpoint：搜替换下面这一行即可，0 代码其他改动
const EMAIL_ENDPOINT = 'https://formsubmit.co/bespoke@starwing-aero.com';

// iframe 超时（formsubmit 重定向页面可能慢）
const SUBMIT_TIMEOUT_MS = 12000;

export default function App() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const showToast = (t: { kind: 'success' | 'error'; message: string }) => {
    setToast(t);
    window.setTimeout(() => setToast((cur) => (cur === t ? null : cur)), 5200);
  };

  const submitForm = (url: string, hiddenForm: HTMLFormElement): Promise<boolean> => {
    return new Promise((resolve) => {
      const iframe = iframeRef.current!;
      let done = false;

      const timer = window.setTimeout(() => {
        if (done) return;
        done = true;
        resolve(false); // 超时
      }, SUBMIT_TIMEOUT_MS);

      iframe.addEventListener(
        'load',
        () => {
          if (done) return;
          done = true;
          window.clearTimeout(timer);
          resolve(true); // iframe 加载完成 ≈ 表单提交完成
        },
        { once: true },
      );

      hiddenForm.action = url;
      hiddenForm.target = 'c1-landing-iframe';
      hiddenForm.submit();
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    const trimmed = email.trim();
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_RE.test(trimmed)) {
      showToast({ kind: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setStatus('submitting');

    // 隐藏 form
    const form = document.createElement('form');
    form.method = 'POST';
    form.style.display = 'none';

    const fields: Record<string, string> = {
      _subject: `[C1 Landing] New subscription: ${trimmed}`,
      _captcha: 'false',
      _template: 'box',
      email: trimmed,
      source: 'C1 Landing Page',
      locale: 'en',
      product: 'C1 · EDGECHORD',
      subscribed_at: new Date().toISOString(),
    };
    Object.entries(fields).forEach(([k, v]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });
    document.body.appendChild(form);

    try {
      const ok = await submitForm(EMAIL_ENDPOINT, form);
      if (ok) {
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
          message: 'Submission timed out. Please email bespoke@starwing-aero.com directly.',
        });
      }
    } catch (err) {
      console.error('[c1-landing] submit error:', err);
      setStatus('error');
      showToast({
        kind: 'error',
        message: 'Submission failed. Please email bespoke@starwing-aero.com directly.',
      });
    } finally {
      document.body.removeChild(form);
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
        </form>
      </section>

      <footer className="foot">© 2026</footer>

      {/* form action 提交到这里，主页面不跳走 */}
      <iframe
        ref={iframeRef}
        name="c1-landing-iframe"
        title="submission-target"
        style={{ display: 'none' }}
      />

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
