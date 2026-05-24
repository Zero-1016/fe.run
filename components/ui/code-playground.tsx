"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

import { useIsOnline } from "@/lib/use-is-online";

/** 마운트 전·후 동일한 첫 프레임(스켈레톤)으로 hydration 맞춘 뒤, 오프라인이면 코드만 표시 */
function useMountedOnline(): { mounted: boolean; online: boolean } {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const online = useIsOnline();
  return { mounted, online };
}

function subscribeDarkClass(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getDarkClassSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerDarkSnapshot() {
  return false;
}

function useIsDark() {
  return useSyncExternalStore(subscribeDarkClass, getDarkClassSnapshot, getServerDarkSnapshot);
}

const SandpackProvider = dynamic(
  () => import("@codesandbox/sandpack-react").then((mod) => mod.SandpackProvider),
  { ssr: false }
);

const SandpackLayout = dynamic(
  () => import("@codesandbox/sandpack-react").then((mod) => mod.SandpackLayout),
  { ssr: false }
);

const SandpackCodeEditor = dynamic(
  () => import("@codesandbox/sandpack-react").then((mod) => mod.SandpackCodeEditor),
  { ssr: false }
);

const SandpackPreview = dynamic(
  () => import("@codesandbox/sandpack-react").then((mod) => mod.SandpackPreview),
  { ssr: false }
);

type Template = "react" | "vanilla" | "vanilla-ts" | "react-ts";

interface CodePlaygroundProps {
  code: string;
  css?: string;
  template?: Template;
  showPreview?: boolean;
}

interface BuiltPlayground {
  template: Template;
  files: Record<string, string>;
  showPreview: boolean;
  activeFile?: string;
  visibleFiles?: string[];
}

function isCssSnippet(code: string): boolean {
  const t = code.trim();
  if (!t) return false;
  if (/^\s*(\/\*|:root\b|@media|@keyframes|@supports|@import)/.test(t)) return true;
  if (/^[.#]?[\w-]+\s*\{[\s\S]*?\}/.test(t) && !/\bfunction\b|=>|\breturn\b/.test(t)) {
    return true;
  }
  return false;
}

// Insert a blank line between the import block and the rest of the file
// so the injected imports read as a distinct section in the editor.
function ensureBlankLineAfterImports(code: string): string {
  const lines = code.split("\n");
  let lastImportEnd = -1;
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (trimmed === "" || trimmed.startsWith("//")) {
      i++;
      continue;
    }
    if (!/^import\b/.test(trimmed)) break;

    let j = i;
    while (j < lines.length && !lines[j].trimEnd().endsWith(";")) j++;
    if (j >= lines.length) break;
    lastImportEnd = j;
    i = j + 1;
  }

  if (lastImportEnd === -1) return code;
  if (lastImportEnd + 1 >= lines.length) return code;
  if (lines[lastImportEnd + 1].trim() === "") return code;

  lines.splice(lastImportEnd + 1, 0, "");
  return lines.join("\n");
}

// Sandpack 프리뷰는 실제 브라우저 iframe 이라 body 배경이 흰색으로 고정된다.
// (Sandpack theme 은 에디터 chrome 만 칠하고 iframe 안쪽 문서까지는 건드리지 않음)
// 사이트 다크/라이트 토큰에 맞춰 iframe body 를 직접 칠해 화면 이질감을 없앤다.
const SANDBOX_THEME_FILE = "/sandbox-theme.css";

// 배경만 칠한다. 글자색은 건드리지 않는다 — 데모가 밝은 요소 배경을 두고
// 기본(검정) 글자에 기대는 경우가 많아서, color 까지 바꾸면 그 글자가 사라진다.
function previewThemeCss(isDark: boolean): string {
  return isDark ? "body { background: #09090b; }\n" : "body { background: #ffffff; }\n";
}

function buildReactFiles(code: string, isDark: boolean, css?: string): Record<string, string> {
  const trimmed = code.trim();
  const hasDefaultExport = /\bexport\s+default\b/.test(trimmed);
  const hasReactImport = /\bimport\s+React\b/.test(trimmed);
  const hasCssImport = /import\s+["']\.\/styles\.css["']/.test(trimmed);

  let appCode = trimmed;
  if (css && !hasCssImport) {
    appCode = `import "./styles.css";\n${appCode}`;
  }
  if (!hasReactImport) {
    appCode = `import React from "react";\n${appCode}`;
  }

  appCode = ensureBlankLineAfterImports(appCode);

  if (!hasDefaultExport) {
    const match = trimmed.match(/function\s+([A-Z]\w*)\s*\(/);
    const name = match?.[1] ?? "App";
    appCode = `${appCode}\n\nexport default ${name};\n`;
  }

  // 프리뷰 테마는 숨김 entry 에서 가장 먼저 import 한다.
  // App.js 에 넣으면 독자에게 보이는 데모 코드가 더럽혀지므로 entry 로 분리.
  const entry = `import ".${SANDBOX_THEME_FILE}";\nimport { createRoot } from "react-dom/client";\nimport App from "./App";\n\ncreateRoot(document.getElementById("root")).render(<App />);\n`;

  const files: Record<string, string> = {
    "/App.js": appCode,
    "/index.js": entry,
    [SANDBOX_THEME_FILE]: previewThemeCss(isDark),
  };
  if (css) {
    files["/styles.css"] = css.trim();
  }
  return files;
}

function buildVanillaCssFiles(code: string): Record<string, string> {
  const css = code.trim();
  const html = `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="./styles.css" />
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
      .demo-note { color: #666; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="demo-note">CSS 스니펫입니다. 편집기에서 코드를 확인하세요.</div>
  </body>
</html>
`;
  return {
    "/styles.css": css,
    "/index.html": html,
  };
}

function buildFiles(
  code: string,
  template: Template,
  isDark: boolean,
  css?: string
): BuiltPlayground {
  if ((template === "vanilla" || template === "vanilla-ts") && isCssSnippet(code)) {
    return {
      template: "vanilla",
      files: buildVanillaCssFiles(code),
      showPreview: false,
      activeFile: "/styles.css",
      visibleFiles: ["/styles.css"],
    };
  }

  if (template === "react" || template === "react-ts") {
    const files = buildReactFiles(code, isDark, css);
    const visible = css ? ["/App.js", "/styles.css"] : ["/App.js"];
    return {
      template,
      files,
      showPreview: true,
      activeFile: "/App.js",
      visibleFiles: visible,
    };
  }

  return {
    template,
    files: {
      "/index.js": `import ".${SANDBOX_THEME_FILE}";\n${code.trim()}`,
      [SANDBOX_THEME_FILE]: previewThemeCss(isDark),
    },
    showPreview: true,
    activeFile: "/index.js",
    visibleFiles: ["/index.js"],
  };
}

function OfflineCodePlaygroundView({ built }: { built: BuiltPlayground }) {
  const fromVisible = (built.visibleFiles ?? []).filter((p) => p in built.files);
  const paths =
    fromVisible.length > 0
      ? fromVisible
      : built.activeFile && built.activeFile in built.files
        ? [built.activeFile]
        : Object.keys(built.files);

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border bg-background">
      <div className="border-b border-border bg-code-bg px-3 py-2 text-xs text-secondary">
        오프라인 · Sandpack 미리보기 비활성 · 코드만 표시됩니다
      </div>
      {paths.map((path) => (
        <div key={path} className="border-b border-border last:border-b-0">
          <div className="border-b border-border px-3 py-1.5 font-mono text-xs text-secondary">
            {path}
          </div>
          <pre className="m-0 max-h-[min(70vh,520px)] overflow-auto bg-code-bg p-4 font-mono text-sm leading-relaxed text-foreground whitespace-pre">
            <code>{built.files[path] ?? ""}</code>
          </pre>
        </div>
      ))}
    </div>
  );
}

export function CodePlayground({
  code,
  css,
  template = "react",
  showPreview = true,
}: CodePlaygroundProps) {
  const isDark = useIsDark();
  const built = buildFiles(code, template, isDark, css);
  const shouldShowPreview = showPreview && built.showPreview;
  const { mounted, online } = useMountedOnline();

  if (!mounted) {
    return (
      <div
        className="my-6 min-h-[260px] overflow-hidden rounded-lg border border-border bg-code-bg/40"
        aria-busy="true"
        aria-label="코드 에디터 로딩"
      />
    );
  }

  if (!online) {
    return <OfflineCodePlaygroundView built={built} />;
  }

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border">
      <SandpackProvider
        key={isDark ? "dark" : "light"}
        template={built.template}
        files={built.files}
        theme={isDark ? "dark" : "light"}
        options={{
          recompileMode: "delayed",
          recompileDelay: 500,
          activeFile: built.activeFile,
          visibleFiles: built.visibleFiles,
        }}
      >
        <SandpackLayout>
          <SandpackCodeEditor
            showLineNumbers
            showTabs={Boolean(css)}
            style={{ minHeight: "260px" }}
          />
          {shouldShowPreview && <SandpackPreview style={{ minHeight: "260px" }} />}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
