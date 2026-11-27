# QiguanUI 1.0 Beta · 交付说明

> 面向接入方（前端 / 全栈）。读完这份就能把组件装进你自己的项目。
> 所有命令都在 Next.js 16 + React 19 + Tailwind v4 的空项目里实测过。

---

## 一、它是什么

QiguanUI 不是 npm 包。组件以**源码形式**复制进你的项目：

- 装完就是你的代码，可以随便改，没有运行时依赖、没有 lock-in
- 源码里不含任何 `hex` 色值与 `px` 字号，全部走语义 token（暗色模式自动跟随）
- 44 个组件族 + 1 个功能全开的台账表格

**唯一的前置要求**：Next.js 16 / React 19 / Tailwind v4。

---

## 二、三步接入

### 1. 初始化

如果项目还没有 shadcn：

```bash
npx shadcn@latest init
```

### 2. 装基础样式（只做一次）

```bash
npx shadcn@latest add https://wangxiaobo97.github.io/qiguanui-registry/r/tokens.json
```

然后在你已有的 `globals.css` 里**加一行**（不要替换整个文件，`shadcn init` 写的主题还要用）：

```css
@import "../styles/qiguan-tokens.css";
```

> ⚠️ 漏掉这行**不会报错**，但所有颜色与字号会失效 —— 这是最容易排查半天的一步。
> 相对路径按 `qiguan-tokens.css` 实际落盘位置调整。

### 3. 装组件

```bash
npx shadcn@latest add https://wangxiaobo97.github.io/qiguanui-registry/r/button.json
```

兄弟组件、工具函数、图标包装层会一起落盘，不用逐个装。
需要哪个组件，去文档站对应页面复制命令，每页都有。

---

## 三、用起来

```tsx
import { Button } from "@/components/base/buttons/button";

export default function Page() {
  return <Button variant="primary">保存</Button>;
}
```

三条硬规则：

1. **必须指到具体文件**：`@/components/base/buttons/button`，没有桶文件，
   `from "@/components/base/buttons"` 会报错
2. **一律具名导入**，没有 default export
3. **颜色与字号只用语义类**：`text-text-secondary`、`bg-background-primary-default`，
   不要写 `text-gray-600` 或 `text-[13px]`

### 图标

组件内部用的是 `@qiguan/qingicon`，装组件时已自动替换为 `components/qiguan/icons`。
**你自己的页面里要用图标**，从 `qingicon-react` 引入：

```tsx
import { QiSquareDownload } from "qingicon-react";
```

> 图标名不能凭语义拼：没有 `QiDownload`，真名是 `QiCircleDownload` / `QiSquareDownload`。
> 不确定就先查：
> ```bash
> grep -o "Qi[A-Za-z0-9]*" node_modules/qingicon-react/dist/index.d.ts | sort -u | grep -i download
> ```

---

## 四、台账表格（最常用）

台账页不要用 `Table` 自己拼，两个现成的：

| 用哪个 | 场景 |
|---|---|
| `RecordTable` | 默认选择。声明列 + 数据即可，多选按需打开 |
| `DataTableExample` | 需要「功能全开」的参考实现，抄它再改 |

```tsx
"use client";

import { RecordTable, type RecordColumn } from "@/components/application/record-table/record-table";

type Row = { id: string; name: string };

const columns: RecordColumn<Row>[] = [
  { id: "name", header: "客户", cell: (r) => r.name, isRowHeader: true },
];

<RecordTable ariaLabel="客户" unit="家" columns={columns} rows={rows} />
```

> ⚠️ **页面必须加 `"use client"`**。`cell` 是函数，从 server component 传给客户端组件
> 会在构建期报 `Functions cannot be passed directly to Client Components`。

安装：

```bash
npx shadcn@latest add https://wangxiaobo97.github.io/qiguanui-registry/r/record-table.json
npx shadcn@latest add https://wangxiaobo97.github.io/qiguanui-registry/r/data-table.json   # 功能全开版
```

---

## 五、给 AI 用（可选）

如果你的日常是让 Cursor / Claude Code 写页面，把这两个地址给它：

| 地址 | 内容 |
|---|---|
| `https://wangxiaobo97.github.io/qiguanui-registry/llms.txt` | 规则：导入约定、目录分层、token、硬禁止 |
| `https://wangxiaobo97.github.io/qiguanui-registry/r/registry.json` | 组件清单，含每个组件的源文件与依赖 |

放到工具里：

- **Cursor**：存成 `.cursor/rules/qiguanui.mdc`
- **Claude Code**：`CLAUDE.md` 里加一行 `@llms.txt`
- **任意对话**：直接粘贴 `llms.txt` 全文

产出后跑 `npx tsc --noEmit`，过不了基本是导入路径写错。

---

## 六、能装什么、不能装什么

| 可安装 | 不可安装 |
|---|---|
| `components/base/` 全部 44 个组件 | `AppShell`（绑死本产品的侧栏菜单、页签、通知中心） |
| `RecordTable` / `DataTableExample` | `form-page` / `detail-page`（依赖 AppShell） |
| `components/application/` 里的卡片表面、筛选外观常量 | dashboard 区块（绑产品数据） |

不可安装的那几个，文档站里有完整代码，**照抄改成自己的导航配置**即可。

---

## 七、已知问题

| 现象 | 说明 |
|---|---|
| dev 下 Next 16 报 `unstable value Date.now()` | react-table 的调试计时被 `cacheComponents` 判成预渲染期读时间。**dev-only 误报**，生产构建不受影响。想消掉就在 `next.config` 里设 `cacheComponents: false`（同时删掉 `partialPrefetching`） |
| `shadcn@latest` 偶尔报 `colors/neutral.json` 请求失败 | CLI 去上游拉主题色时的网络抖动，重跑一次即可 |
| `shadcn@latest` 装到一半卡住问「是否覆盖」 | 加 `--overwrite`，或用 `shadcn@4.22.0` |

---

## 八、验收清单

接入方自查，五项都过就说明接对了：

- [ ] `npx tsc --noEmit` 无报错
- [ ] 按钮有品牌蓝主色、白底描边次按钮，不是黑底或纯文字
- [ ] 输入框是灰底填充式（不是描边式）—— 这是设计选择，不是样式没生效
- [ ] 给 `<html>` 加 `class="dark"`，整页颜色翻转且没有局部仍是亮色
- [ ] 台账表格：表头与数据左右对齐、行高正常、底部分页可见

---

## 九、遇到问题

1. **颜色全失效** → 回到第二步，`@import` 那一行加了没
2. **报 `Cannot find module`** → 导入路径没指到具体文件
3. **报 `has no exported member`** → 组件名或图标名拼错，去文档站对应页核
4. **表格错位** → `qiguan-tokens.css` 里少了 `.bui-table` 那段，重新装一次 `tokens.json`
