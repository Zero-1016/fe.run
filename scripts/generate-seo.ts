import { writeFileSync, mkdirSync } from "fs";
import { resolve, join } from "path";
import { type PostMeta, readPostsFromMdx } from "./lib/posts-from-mdx";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.frontend.run").replace(
  /\/$/,
  ""
);

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toIsoDate(value: string): string {
  if (!value) return new Date().toISOString();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function postLastmod(p: PostMeta): string {
  return toIsoDate(p.updated ?? p.date);
}

function buildSitemap(posts: PostMeta[]): string {
  const now = new Date().toISOString();
  const latestSiteLastmod = posts.map(postLastmod).sort().pop() ?? now;

  const urls: { loc: string; lastmod: string }[] = [
    { loc: `${SITE_URL}/`, lastmod: latestSiteLastmod },
    { loc: `${SITE_URL}/tags`, lastmod: latestSiteLastmod },
    { loc: `${SITE_URL}/series`, lastmod: latestSiteLastmod },
  ];

  for (const post of posts) {
    urls.push({
      loc: `${SITE_URL}/posts/${encodeURIComponent(post.slug)}`,
      lastmod: postLastmod(post),
    });
  }

  const seriesLatest = new Map<string, string>();
  for (const post of posts) {
    if (!post.series) continue;
    const lm = postLastmod(post);
    const prev = seriesLatest.get(post.series);
    if (!prev || lm > prev) seriesLatest.set(post.series, lm);
  }
  for (const [series, lastmod] of seriesLatest) {
    urls.push({ loc: `${SITE_URL}/series/${encodeURIComponent(series)}`, lastmod });
  }

  const tagLatest = new Map<string, string>();
  for (const post of posts) {
    const lm = postLastmod(post);
    for (const tag of post.tags) {
      const prev = tagLatest.get(tag);
      if (!prev || lm > prev) tagLatest.set(tag, lm);
    }
  }
  for (const [tag, lastmod] of tagLatest) {
    urls.push({ loc: `${SITE_URL}/tags/${encodeURIComponent(tag)}`, lastmod });
  }

  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function buildRobots(): string {
  return `User-agent: *\nAllow: /\n\nDisallow: /og\nDisallow: /api\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

function buildLlmsTxt(posts: PostMeta[]): string {
  const sorted = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lines: string[] = [
    `# frontend.run`,
    ``,
    `> 코드를 짜다 마주친 궁금한 것들을 하나씩 따라가며 정리하는 프론트엔드 기록. React, CSS, 웹 표준, 성능과 접근성 노트를 다룹니다.`,
    ``,
    `- 작성자: Zero-1016`,
    `- 사이트: ${SITE_URL}`,
    `- RSS: ${SITE_URL}/feed.xml`,
    `- 사이트맵: ${SITE_URL}/sitemap.xml`,
    `- 언어: 한국어 (ko-KR)`,
    ``,
    `## 글 목록`,
    ``,
  ];

  for (const p of sorted) {
    lines.push(`- [${p.title}](${SITE_URL}/posts/${p.slug}): ${p.description}`);
  }

  return lines.join("\n") + "\n";
}

function isValidIndexNowKey(key: string): boolean {
  return /^[a-zA-Z0-9-]{8,128}$/.test(key);
}

function main() {
  const posts = readPostsFromMdx();
  const publicDir = resolve(process.cwd(), "public");
  mkdirSync(publicDir, { recursive: true });

  const sitemapPath = join(publicDir, "sitemap.xml");
  const robotsPath = join(publicDir, "robots.txt");
  const llmsPath = join(publicDir, "llms.txt");

  writeFileSync(sitemapPath, buildSitemap(posts), "utf-8");
  writeFileSync(robotsPath, buildRobots(), "utf-8");
  writeFileSync(llmsPath, buildLlmsTxt(posts), "utf-8");

  console.log(`✓ sitemap.xml (${posts.length} posts) → ${sitemapPath}`);
  console.log(`✓ robots.txt → ${robotsPath}`);
  console.log(`✓ llms.txt → ${llmsPath}`);
  console.log(`  site url: ${SITE_URL}`);

  const indexNowKey = process.env.INDEXNOW_KEY;
  if (indexNowKey) {
    if (!isValidIndexNowKey(indexNowKey)) {
      console.warn(`! INDEXNOW_KEY 형식 오류 (8~128자 영숫자/하이픈). 키 파일 생성 건너뜀.`);
    } else {
      const keyPath = join(publicDir, `${indexNowKey}.txt`);
      writeFileSync(keyPath, indexNowKey, "utf-8");
      console.log(`✓ IndexNow key → ${keyPath}`);
    }
  }
}

main();
