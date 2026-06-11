/**
 * shoot-flow.ts — FlowDiagram 시각 검증용 스크린샷 도구
 *
 * 주어진 글(slug)의 페이지를 실제로 렌더해 FlowDiagram(`figure` 안 `.react-flow`)
 * 마다 라이트/다크 스크린샷을 content/tmp/flow-shots/ 에 저장한다.
 * blog-flow-review 스킬이 이 결과 이미지를 읽어 겹침·정렬을 판정한다.
 *
 * 사용: pnpm tsx scripts/shoot-flow.ts <slug>
 * 출력(stdout): "NO_FLOWDIAGRAM" 또는 "SHOTS:" 다음 줄마다 파일 경로.
 *
 * 서버 전략: :4321 이 이미 떠 있으면 재사용, 없으면 next dev 를 임시 기동 후 종료.
 */
import { chromium } from "@playwright/test";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdir } from "node:fs/promises";

const PORT = 4321;
const BASE = `http://localhost:${PORT}`;
const OUT_DIR = "content/tmp/flow-shots";

async function isUp(): Promise<boolean> {
  try {
    const res = await fetch(BASE, { method: "HEAD" });
    return res.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(timeoutMs = 90000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isUp()) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("usage: pnpm tsx scripts/shoot-flow.ts <slug>");
    process.exit(2);
  }

  let devProc: ChildProcess | null = null;
  const startedByUs = !(await isUp());

  if (startedByUs) {
    console.error(`[shoot-flow] dev 서버(:${PORT})가 없어 임시 기동합니다...`);
    devProc = spawn("pnpm", ["dev"], { stdio: "ignore", detached: true });
    devProc.unref();
    if (!(await waitForServer())) {
      console.error("[shoot-flow] 서버 기동 실패");
      if (devProc.pid) {
        try {
          process.kill(-devProc.pid);
        } catch {
          /* noop */
        }
      }
      process.exit(1);
    }
  }

  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const results: string[] = [];
  try {
    for (const theme of ["light", "dark"] as const) {
      const page = await browser.newPage({
        viewport: { width: 1200, height: 1600 },
        colorScheme: theme,
      });
      await page.addInitScript((t) => {
        try {
          localStorage.setItem("theme", t);
        } catch {
          /* noop */
        }
      }, theme);

      await page.goto(`${BASE}/posts/${slug}`, { waitUntil: "domcontentloaded" });
      const hasFlow = await page
        .waitForSelector(".react-flow", { timeout: 15000 })
        .then(() => true)
        .catch(() => false);
      if (!hasFlow) {
        await page.close();
        break; // FlowDiagram 없음 — 다른 테마 돌 필요 없음
      }
      // React Flow fitView/레이아웃 안정화 대기
      await page.waitForTimeout(1800);

      const figures = page.locator("figure:has(.react-flow)");
      const count = await figures.count();
      for (let i = 0; i < count; i++) {
        await figures.nth(i).scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        const file = `${OUT_DIR}/${slug}-${i + 1}-${theme}.png`;
        await figures.nth(i).screenshot({ path: file });
        results.push(file);
      }
      await page.close();
    }
  } finally {
    await browser.close();
    if (startedByUs && devProc?.pid) {
      try {
        process.kill(-devProc.pid);
      } catch {
        /* noop */
      }
    }
  }

  if (results.length === 0) {
    console.log("NO_FLOWDIAGRAM");
  } else {
    console.log("SHOTS:");
    for (const r of results) console.log(r);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
