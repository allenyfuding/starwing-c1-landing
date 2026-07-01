# 🚀 Vercel 一键上线（5 步，3 分钟）

## 1. Vercel Dashboard → Add New Project
打开 https://vercel.com/new

## 2. Import Git Repo
- 选 `allenyfuding/starwing-c1-landing`
- 点 **Import**

## 3. 配置项目（Vercel 自动检测 Vite）
| 项 | 值 |
|---|---|
| Framework Preset | **Vite**（自动） |
| Build Command | `npm run build`（自动） |
| Output Directory | `dist`（自动） |
| Install Command | `npm install`（自动） |
| Root Directory | `./`（默认） |

**不要改任何配置**，直接点 **Deploy**。

## 4. 等 30 秒，拿到永久 URL
形如：`starwing-c1-landing-xxx.vercel.app`

测试邮箱采集是否通：
1. 打开新 URL
2. 输邮箱 → Subscribe
3. 弹「Received. Our concierge will reach you within 24 hours.」
4. 检查 `bespoke@starwing-aero.com` 收件箱（首次会收到 FormSubmit 激活邮件 → 点确认）

## 5. 绑域名 `c1.starwing-aero.com`（可选）
Vercel Dashboard → 落地页项目 → Settings → Domains

加：
- `c1.starwing-aero.com`
- Vercel 显示要加的 DNS 记录，到 Cloudflare 设置：
  - CNAME `c1` → `cname.vercel-dns.com`

5-30 分钟全球生效。

---

## 切换日（主站上线后）— 思路 ③

最简方案：Settings → Domains → `c1.starwing-aero.com` → Redirect to → `https://starwing-aero.com/c1`

→ 0 代码改、0 DNS 改、5-10 分钟生效，旧 IG/广告链接 301 跳主站。

---

## 故障排查

| 现象 | 解决 |
|---|---|
| Deploy 后页面空白 | 看 Deployments → Function Logs，多半是 Vite 没识别（不常见） |
| 邮箱提交 12s 后报错 | FormSubmit 在你网络/区域被阻，参考下方"备用 endpoint" |
| 想换邮箱服务 | 改 `src/App.tsx` 第 9 行的 `EMAIL_ENDPOINT`，commit + push 即可 |

---

## 备用 endpoint（如果 FormSubmit 被墙）

| 服务 | 替换字符串 |
|---|---|
| **Web3Forms** | `'https://api.web3forms.com/submit'` + 加 `access_key` hidden field（需 web3forms.com 注册拿 key） |
| **Formspree** | `'https://formspree.io/f/YOUR_FORM_ID'` |
| **Buttondown** | API 路径（key 走 env） |

代码里改一行 `EMAIL_ENDPOINT = '...'` 即可，0 其他改动。
