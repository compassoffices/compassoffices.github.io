# Compass Offices — 小红书内容系统 RedNote Content System

内部工具。把这个资料夹整个放进 `compassoffices.github.io`，
就会 serve 在 `compassoffices.io/rednote-system/`。

| 网址 | 是什么 |
|---|---|
| `/rednote-system/` | **版式工厂** — 20 个版式、AI 装配、素材库、存到日历 |
| `/rednote-system/calendar.html` | **内容日历** — 排期、手机分享发布、标记已发布 |

手机开日历页 → 分享 → 加入主画面，会拿到 Compass 橙色圆标的全屏 app。

---

## 资料夹内容

```
index.html              版式工厂（单一档案，html2canvas 已内嵌，离线可导出）
calendar.html           内容日历 / 手机发布页
manifest.webmanifest    加到主画面用
icon-180/192/512.png    app 图标
docs/
  START-HERE.md         ← 从这里开始。安装 6 步。
  SETUP.md              完整说明：空间管理、清理、Cloudflare Access
  Code.gs               Apps Script 后端（备份，不会被当网页 serve）
  doubao-compass-voice.md   豆包智能体设定
```

---

## 架构

```
豆包（写文案）
   ↓  贴上
版式工厂 index.html ──→ Apps Script ──→ Gemini（切分 / 挑图 / 视觉打标）
   ↓  渲染 1500×2000              ↓
Drive「RedNote Output」        Google Sheet（assets / posts / voice / config）
   ↓
calendar.html（手机）→ 分享到小红书 → 标记已发布
```

后端设定（网址与 token）存在浏览器 localStorage，不在程式码里。
Gemini key 只放在 Apps Script 的指令码属性，不在这个 repo 里。

---

## 安全

这个资料夹可以公开 —— 里面没有任何密钥：

- Gemini key 在 Apps Script 指令码属性
- API token 由使用者在「设置」输入，存在自己浏览器
- Drive folder ID 在 `docs/Code.gs` 里，但 ID 本身不给任何存取权

之后走 Cloudflare Pages + Access 时，这里会一并被登入保护。

---

## 改版式或改字数预算

都在 `index.html` 里：

- `LAYOUTS` — 20 个版式的栏位与渲染
- `BUDGETS` — 每个栏位的行数与每行字数上限（AI 装配的合约）
- `CO_ASSETS` — 内嵌的 logo 与 tagline

改完直接 commit，不用重新部署 Apps Script。
后端有改才要 **管理部署作业 → 铅笔 → 新版本**。
