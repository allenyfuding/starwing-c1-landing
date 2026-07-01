# STARWING · C1 Landing

> 独立单产品获客站。Vite + React + TypeScript。**主站上线前的临时获客用途**。

---

## 🎯 产品定位

- **角色**：C1 鸣锋 / EDGECHORD 单一产品线的「获客着陆器」
- **目标受众**：海外 IG / 广告流量（90%+ 移动端 4:5）
- **流量主站**：`starwing-aero.com`（上线后） / `mds5qfvc3n5d.space.minimaxi.com`（基线）

---

## 🚀 部署

### Vercel 端（用户手动）

1. vercel.com → New Project → 选 `allenyfuding/starwing-c1-landing` → Import
2. Framework Preset：**Vite**（自动检测）
3. Build Command / Output Directory：留默认（`npm run build` / `dist`）
4. Settings → Environment Variables：
   - `VITE_API_ENDPOINT` = `https://starwing-site-gv8nkw40i-starwing.vercel.app/api/intent`
5. Deploy → 30s 后拿到 `starwing-c1-landing-xxx.vercel.app`
6. Settings → Domains → 添加 `c1.starwing-aero.com`

### 邮箱后端（已就绪）

- 落地页表单 → `POST {VITE_API_ENDPOINT}` → 主站 `/api/intent` → DirectMail → `bespoke@starwing-aero.com`
- **CORS 已配置**（commit `006a991`）—— `c1.starwing-aero.com` 和 `*.vercel.app` 都在 allowlist

---

## 🔁 切换日 checklist（主站上线后）

### 思路 ③ — Vercel 重定向（推荐）

**A. 最快（30 秒）**：在 Vercel Dashboard → Settings → Domains → `c1.starwing-aero.com` → Redirect to → `starwing-aero.com/c1`  
  → 0 代码改动，DNS 不动，5-10 分钟全球生效

**B. 全量（vercel.json 替换）**：

```json
// 替换 vercel.json 全部内容
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "redirects": [
    { "source": "/", "destination": "https://starwing-aero.com/c1", "statusCode": 301 },
    { "source": "/(.*)", "destination": "https://starwing-aero.com/c1/$1", "statusCode": 301 }
  ]
}
```

→ commit + push，Vercel 自动 build + deploy。**所有旧链接（IG 收藏、PDF 印刷、广告）301 跳主站**，SEO 权重全传。

**C. 渐进（meta refresh）**：仅替换 `index.html` 头部加：
```html
<meta http-equiv="refresh" content="3;url=https://starwing-aero.com/c1">
```
→ 用户停留 3 秒看到"已迁移"提示再跳。

### 切换后保留

- 域名 `c1.starwing-aero.com` 不释放（301 长期兜底 6-12 个月）
- GitHub repo 保留（不删）
- Vercel 项目降级为 Hobby（白嫖）

---

## 🛠 维护

### 文案微调

所有可见文案在 `src/App.tsx` 顶部的 JSX。改完：

```bash
git add -A && git commit -m "..." && git push
# Vercel 自动 build + deploy
```

### API 换源（如未来切 Formspree / Substack / Mailchimp）

改 `.env.production` 的 `VITE_API_ENDPOINT` → commit → push。**0 代码改动**。

### CORS 异常

主站 `/api/intent` 的 CORS allowlist 在 `starwing-v4-covenant-v13/src/app/api/intent/route.ts`。
新域名要加进去时改 `CORS_ALLOWLIST` 数组。

---

## 📁 目录

```
starwing-c1-landing/
├── public/
│   ├── c1-hero.jpg          # C1 主图 (4:5 适配 1080×1350)
│   ├── starwing-logo.svg    # 标准品牌 LOGO
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.tsx              # 主组件（文案 / 表单 / toast）
│   ├── App.css              # 全部样式
│   ├── index.css            # 全局重置 + 字体加载
│   └── main.tsx
├── index.html               # Google Fonts (Noto Serif SC)
├── vercel.json              # Vercel 部署配置
├── .env.production          # 生产环境变量
├── .env.example             # 环境变量模板
└── package.json
```

---

## ⚠️ 不要做

- ❌ 把主站 `/api/intent` 的 CORS allowlist 删掉（落地页要靠它跨域）
- ❌ 把页面改成深色背景（与主站浅色基线冲突）
- ❌ 在落地页加完整的产品说明（那是主站 `/c1` 的工作）
- ❌ 把邮箱 endpoint 写死在源码（用 env）
