#!/usr/bin/env node

/**
 * QiguanUI 离线安装器。
 *
 * 为什么需要它：registry 托管在私有仓库/内网，无法用 `npx shadcn add <url>`
 * 拉取。这个脚本直接读本地的 registry JSON，把文件写进你的项目，
 * **不联网、不需要 shadcn CLI**。
 *
 * 用法（在本仓库根目录执行）：
 *   node add.mjs button
 *   node add.mjs record-table
 *   node add.mjs button input select table     # 一次装多个
 *
 * 会做什么：
 *   1. 从 r/<name>.json 读组件定义，递归解析 registryDependencies
 *   2. 按 files[].target 把源码写到项目对应位置（后缀 .ts/.tsx/.css）
 *   3. 打印需要 npm install 的运行时依赖，由你确认后自己装
 *
 * 不会做什么：
 *   - 不自动跑 npm install（不同项目包管理器不同，交给你决定）
 *   - 不覆盖已存在的文件，除非加 --force
 */

import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const REG_DIR = join(ROOT, "r");

const args = process.argv.slice(2);
const force = args.includes("--force");
const names = args.filter((a) => !a.startsWith("--"));
const projectRoot = process.env.QIGUAN_PROJECT || process.cwd();

if (!names.length) {
  console.error(
    [
      "用法: node add.mjs <组件名> [组件名...] [--force]",
      "",
      "示例:",
      "  node add.mjs button",
      "  node add.mjs record-table",
      "  node add.mjs button input select --force",
      "",
      "组件名列表见 r/registry.json",
    ].join("\n"),
  );
  process.exit(1);
}

/** 递归收集：item 本身 + 它依赖的所有本地 item（跳过 http 开头的远程依赖）。 */
function collect(name, seen = new Set(), order = [], deps = new Set()) {
  if (seen.has(name)) return { order, deps };
  seen.add(name);

  const file = join(REG_DIR, `${name}.json`);
  if (!existsSync(file)) {
    console.error(`✗ 找不到 ${name}.json（r/ 目录下没有这个组件）`);
    process.exit(1);
  }
  const item = JSON.parse(readFileSync(file, "utf8"));

  for (const dep of item.registryDependencies ?? []) {
    if (typeof dep !== "string" || dep.startsWith("http")) continue;
    const depName = dep.split("/").pop().replace(/\.json$/, "");
    if (depName && existsSync(join(REG_DIR, `${depName}.json`))) {
      collect(depName, seen, order, deps);
    }
  }

  for (const d of item.dependencies ?? []) deps.add(d);
  order.push(item);
  return { order, deps };
}

/** target 形如 @components/base/buttons/button.tsx → components/base/buttons/button.tsx */
function resolveTarget(target, singleFile) {
  if (target.startsWith("@components/")) return target.slice("@components/".length);
  if (target.startsWith("@lib/")) return `lib/${target.slice("@lib/".length)}`;
  return target;
}

const { order, deps } = collect(names[0]);
for (const extra of names.slice(1)) collect(extra, undefined, order, deps);

let written = 0;
let skipped = 0;

for (const item of order) {
  const files = item.files ?? [];
  for (const f of files) {
    let rel = f.target ? resolveTarget(f.target, files.length === 1) : f.path;
    // 有些 item 只给 path（没有 @ 前缀），按原样落盘
    if (!rel) continue;

    const dest = join(projectRoot, rel);

    if (existsSync(dest) && !force) {
      console.log(`  跳过（已存在） ${rel}`);
      skipped++;
      continue;
    }

    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, f.content ?? "", "utf8");
    console.log(`  ✓ ${rel}`);
    written++;
  }
}

console.log(`\n写入 ${written} 个文件${skipped ? `，跳过 ${skipped} 个已存在文件` : ""}`);

if (deps.size) {
  console.log("\n还需要装这些运行时依赖（手动执行，选你项目的包管理器）：");
  console.log(`  npm i ${[...deps].join(" ")}`);
}

console.log(
  [
    "\n接下来（首次安装必做）：",
    "  1. 确认已装基础样式：node add.mjs tokens",
    '  2. 在你的 globals.css 里加一行：@import "../styles/qiguan-tokens.css";',
    "     漏掉这行不会报错，但所有颜色与字号会失效。",
    "  3. npx tsc --noEmit 验证",
    "",
  ].join("\n"),
);
