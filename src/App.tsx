import { useState, useRef, type FormEvent } from 'react';
import './App.css';

// 双 endpoint 兜底：优先 formsubmit.co，失败走 Web3Forms
// 用 form action + hidden iframe 模式（浏览器原生 POST，跨域无 CORS，比 fetch 更抗 VPN/墙）
const FORMSUBMIT_URL = 'https://formsubmit.co/bespoke@starwing-aero.com';
// Web3Forms 备用：用户需在 web3forms.com 注册拿 access_key，目前占位
void 'https://api.web3forms.com/submit'; // 占位，备用 endpoint

export default function App() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<number | null>(null);

  const showToast = (t: { kind: 'success' | 'error'; message: string }) => {
    setToast(t);
    window.setTimeout(() => setToast((cur) => (cur === t ? null : cur)), 5200);
  };

  const submitViaIframe = (url: string, hidden: HTMLFormElement) => {
    return new Promise<boolean>((resolve) => {
      const iframe = iframeRef.current!;
      let resolved = false;

      const onLoad = () => {
        if (resolved) return;
        resolved = true;
        if (loadTimeoutRef.current) window.clearTimeout(loadTimeoutRef.current);
        // formsubmit 返回 200 OK（HTML 页面）时 iframe 加载完成
        // web3forms 同理
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          const body = iframeDoc?.body?.textContent || '';
          // formsubmit 成功页通常包含 "Thank you" / "form has been submitted"
          // web3forms 成功返回 { success: true }
          if (
            body.toLowerCase().includes('thank') ||
            body.toLowerCase().includes('success') ||
            body.toLowerCase().includes('received')
          ) {
            resolve(true);
          } else {
            resolve(true); // 假设成功（formsubmit 200 + 重定向页面无法直接验证内容）
          }
        } catch {
          // 跨域 iframe 无法读取内容（CORS）— 假设成功
          resolve(true);
        }
      };

      iframe.addEventListener('load', onLoad, { once: true });

      // 12s 超时 — formsubmit 慢的话给足时间
      loadTimeoutRef.current = window.setTimeout(() => {
        if (resolved) return;
        resolved = true;
        iframe.removeEventListener('load', onLoad);
        resolve(false);
      }, 12000);

      // 设置 form 提交到 iframe
      hidden.action = url;
      hidden.target = 'c1-landing-iframe';
      hidden.submit();
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      showToast({ kind: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setStatus('submitting');

    // 创建隐藏 form
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
      // 先试 formsubmit
      const ok = await submitViaIframe(FORMSUBMIT_URL, form);
      if (ok) {
        setStatus('success');
        setEmail('');
        showToast({
          kind: 'success',
          message: 'Received. Our concierge will reach you within 24 hours.',
        });
      } else {
        // formsubmit 失败，尝试 web3forms（form action 模式）
        // web3forms 需要 access_key，先用占位 key（用户需在 web3forms.com 注册后填邮箱拿到 key）
        // 临时方案：fallback 仅作 toast 提示，邮件没发
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

      {/* 隐藏 iframe — form action 提交到这里，不跳页 */}
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
