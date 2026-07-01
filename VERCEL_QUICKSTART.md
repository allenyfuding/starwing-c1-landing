# 🚀 C1 Landing 落地页 · 一键上线操作手册

> **版本**: v1.0 固化版 (commit `7d330bd` · 2026-07-01)
> **状态**: ✅ Vercel 已部署 · ✅ 邮箱链路已跑通
> **适用场景**: 主站上线前的独立获客站

---

## 📊 当前状态（2026-07-01 09:04 UTC）

| 项 | 值 | 状态 |
|---|---|---|
| Vercel 永久 URL | `https://starwing-c1-landing-a3m8-5dhv08lf6-starwing.vercel.app/` | ✅ 已分配 |
| Sandbox 备用预览 | `https://oxfn3hwhqmg1.space.minimaxi.com` | ✅ 可用 |
| GitHub HEAD | commit `7d330bd` (v1.0 固化版) | ✅ |
| 邮箱链路 | FormSubmit.co → `bespoke@starwing-aero.com` | ✅ 用户 08:51 确认收到 |
| FormSubmit 激活 | 首次收到激活邮件 → 点 Confirm（一次性） | ⏳ 待用户确认 |
| 自定义域名 `c1.starwing-aero.com` | 未绑 | ⏳ **下一步** |

---

## 🟢 步骤 1：Vercel Import 5 步（已完成）

✅ **用户已完成**（08:59 报告 Vercel 部署成功）

如未来需要重建：
1. 打开 https://vercel.com/new
2. 选 `allenyfuding/starwing-c1-landing` → **Import**
3. Framework 自动 = **Vite**（啥也别改）→ **Deploy**
4. 等 30-60s 拿到永久 URL
5. 验证邮箱链路（打开 URL → 输邮箱 → Subscribe → 弹成功 toast）

---

## 🟡 步骤 2：绑独立子域 `c1.starwing-aero.com`（**当前待办**）

### 2.1 Vercel 端（1 分钟）

1. 打开 https://vercel.com/dashboard
2. 点项目 **`starwing-c1-landing`**
3. 顶部 tab 选 **Settings** → 左侧 **Domains**
4. 输入框填 `c1.starwing-aero.com` → 点 **Add**
5. Vercel 弹出"需要加 DNS 记录"提示，**截屏或复制内容给我**（一般是 CNAME 形式）

### 2.2 Cloudflare 端（2 分钟）

1. 打开 https://dash.cloudflare.com → 登录
2. 左侧 **Domains** → 点 **`starwing-aero.com`**
3. 左侧 **DNS** → **Records**
4. 右上 **Add record**：
   - Type: **CNAME**
   - Name: **`c1`**（不要带 .starwing-aero.com，CF 自动补全）
   - Target: **`cname.vercel-dns.com`**（用 Vercel 告诉你的）
   - Proxy status: **DNS only**（关橙色云朵——Vercel 要直连）
   - TTL: Auto
5. **Save**

### 2.3 等生效（5-30 分钟，自动）

- DNS 全球传播 5-30 分钟
- Vercel 自动签 SSL 证书（Let's Encrypt）
- `https://c1.starwing-aero.com` 即可访问

### 2.4 验证清单

- [ ] 浏览器打开 `https://c1.starwing-aero.com` → 看到落地页
- [ ] 输邮箱 → Subscribe → 弹「Received. Our concierge will reach you within 24 hours.」
- [ ] `bespoke@starwing-aero.com` 收件箱收到订阅邮件

---

## 🔵 步骤 3：切换日（主站上线后）— 思路 ③

**触发条件**：主站 `starwing-aero.com` 正式上线 / `/c1` 路由就绪

**操作**（5-10 分钟，0 代码改）：

1. Vercel Dashboard → `starwing-c1-landing` 项目 → **Settings** → **Domains**
2. 找到 `c1.starwing-aero.com` → 点 **Edit** → 选 **Redirect**
3. Redirect to: `https://starwing-aero.com/c1`
4. 301 重定向（永久）→ 旧 IG 链接全跳主站

**适用场景**：
- Instagram bio 链接是 `c1.starwing-aero.com` → 用户点进来自动 301 到主站 `/c1`
- 广告落地页是 `c1.starwing-aero.com/campaign-x` → 自定义 301 路径

**保留期建议**：
- 落地页域名不释放 6-12 个月（保险）
- Vercel 项目降级 Hobby tier
- repo 保留做 archive

---

## 🛠 故障排查

| 现象 | 原因 | 解决 |
|---|---|---|
| Deployments 显示 **Building** | 冷编译 30-60s | 等 1 分钟重试 |
| Deployments 显示 **Error**（红） | 部署失败 | 截屏 Function Logs 给我 |
| 页面打开空白 | Vite 没识别 | 验证 Framework = Vite |
| 邮箱 12s 后报「Submission timed out」 | FormSubmit 在你网络/区域被阻 | 换备用 endpoint（见下） |
| `c1.starwing-aero.com` 打不开 | DNS 未传播 / 配错 | `dig c1.starwing-aero.com CNAME` 查；或等 30 分钟 |
| 收不到 `bespoke@starwing-aero.com` 邮件 | FormSubmit 未激活 | 检查 `noreply@formsubmit.co` 激活邮件 → 点 Confirm |
| Vercel Dashboard 看不到项目 | 登录错账号 | 用 GitHub 账号 `allenyfuding` 登录 |

---

## 🔄 备用邮箱 endpoint（如果 FormSubmit 被墙）

代码改一行 `EMAIL_ENDPOINT = '...'` 即可，0 其他改动。

| 服务 | 替换字符串 | 备注 |
|---|---|---|
| **Web3Forms** | `'https://api.web3forms.com/submit'` + `access_key` hidden field | 需 web3forms.com 注册拿 key（GitHub OAuth） |
| **Formspree** | `'https://formspree.io/f/YOUR_FORM_ID'` | 需注册，免费 50 次/月 |
| **Buttondown** | API 路径（key 走 env） | 适合 newsletter 长期用 |

**改动步骤**（如要换）：
1. 编辑 `src/App.tsx` 第 9 行
2. `npm run build` → 验证 dist 干净
3. `git commit -m "..." && git push origin main`
4. Vercel 自动 build + deploy

---

## 📁 关键文件位置

| 文件 | 作用 |
|---|---|
| `src/App.tsx` | 表单提交逻辑 + UI 主体（第 9 行改 endpoint） |
| `public/c1-hero.jpg` | C1 主图（1.4MB · 复刻自主站） |
| `public/starwing-logo.svg` | STARWING LOGO（深色版 · 浅色背景下 invert） |
| `vercel.json` | cache-control + 安全 headers |
| `package.json` | 依赖声明 |
| `index.html` | `<html lang="zh-CN">` + Google Fonts |

---

## 🔗 链接总览

| 用途 | URL |
|---|---|
| Vercel Dashboard | https://vercel.com/dashboard |
| Vercel Project | https://vercel.com/dashboard/starwing-c1-landing |
| GitHub Repo | https://github.com/allenyfuding/starwing-c1-landing |
| Cloudflare DNS | https://dash.cloudflare.com |
| FormSubmit 激活 | 检查 `bespoke@starwing-aero.com` 收件箱（首次会收到 `noreply@formsubmit.co` 邮件） |
| 主站（待上线） | https://starwing-aero.com/c1 |
| 主站 Vercel | https://starwing-site-gv8nkw40i-starwing.vercel.app/ |

---

## 🆘 关键联系人

- **AI 助手**: Starwing 品牌助手（这个）
- **Vercel 账号**: GitHub `allenyfuding`
- **GitHub 账号**: `allenyfuding` (PAT `ghp_Dcv...` 待 revoke)
- **收件邮箱**: `bespoke@starwing-aero.com`（DirectMail 已配，主站 Vercel 域挂了但凭证在 env 里）

---

> **重要**: 落地页 v1.0 完全独立，不依赖主站。主站 Vercel 域名修复与否都不影响落地页运行。
