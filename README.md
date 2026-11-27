# QiguanUI Registry

QiguanUI 组件库的 shadcn registry 与 AI 规则索引，纯静态托管。

**在线地址**：https://wangxiaobo97.github.io/qiguanui-registry

---

## 给使用者：三步接入

### 1. 初始化

```bash
npx shadcn@latest init
```

### 2. 装基础样式（只做一次）

```bash
npx shadcn@latest add https://wangxiaobo97.github.io/qiguanui-registry/r/tokens.json
```

然后在你已有的 `globals.css` 里**加一行**（不要替换整个文件）：

```css
@import "../styles/qiguan-tokens.css";
```

> 漏掉这行**不会报错**，但所有颜色与字号会失效。

### 3. 装组件

```bash
npx shadcn@latest add https://wangxiaobo97.github.io/qiguanui-registry/r/button.json
```

兄弟组件、工具函数、图标包装层会一起落盘。

---

## 给 AI

| 地址 | 内容 |
|---|---|
| `https://wangxiaobo97.github.io/qiguanui-registry/llms.txt` | 规则：导入约定、目录分层、token、硬禁止 |
| `https://wangxiaobo97.github.io/qiguanui-registry/r/registry.json` | 组件清单 |

放到 Cursor：存成 `.cursor/rules/qiguanui.mdc`
放到 Claude Code：`CLAUDE.md` 里加一行 `@llms.txt`

---

## 可用 item

| 分类 | item |
|---|---|
| 基础 | `tokens` `cx` `qingicon` |
| 组件（44） | `button` `input` `select` `table` `badge` `modal` `tabs` … 见 `r/registry.json` |
| 页面区块 | `record-table` `data-table` |

---

## 本仓库怎么更新

内容由 QiguanUI 主仓库生成，**不要手改 `r/*.json`**。

```bash
# 在主仓库里
REGISTRY_BASE_URL=https://wangxiaobo97.github.io/qiguanui-registry \
  node scripts/build-registry.mjs

# 把 public/r/*.json 与 llms.txt 复制到本仓库，然后提交
```

---

## 部署

本仓库内容发布于 GitHub Pages。首次启用：

**Settings → Pages → Source 选 `Deploy from a branch` → 分支 `main`，目录 `/ (root)` → Save**

约 1 分钟后生效。之后每次推送到 `main` 自动更新。
