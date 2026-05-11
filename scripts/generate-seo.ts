import { writeFileSync, mkdirSync } from "fs";
import { resolve, join } from "path";
import { type PostMeta, readPostsFromMdx } from "./lib/posts-from-mdx";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tech-blog-six-phi.vercel.app"
).replace(/\/$/, "");

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

function buildSitemap(posts: PostMeta[]): string {
  const now = new Date().toISOString();

  const urls: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [
    { loc: `${SITE_URL}/`, lastmod: now, changefreq: "daily", priority: "1.0" },
  ];

  const latestPost = posts
    .map((p) => toIsoDate(p.date))
    .sort()
    .pop();

  for (const post of posts) {
    urls.push({
      loc: `${SITE_URL}/posts/${encodeURIComponent(post.slug)}`,
      lastmod: toIsoDate(post.date),
      changefreq: "monthly",
      priority: "0.8",
    });
  }

  const seriesSet = new Set<string>();
  for (const post of posts) if (post.series) seriesSet.add(post.series);
  for (const series of seriesSet) {
    urls.push({
      loc: `${SITE_URL}/series/${encodeURIComponent(series)}`,
      lastmod: latestPost ?? now,
      changefreq: "weekly",
      priority: "0.6",
    });
  }

  const tagSet = new Set<string>();
  for (const post of posts) post.tags.forEach((t) => tagSet.add(t));
  for (const tag of tagSet) {
    urls.push({
      loc: `${SITE_URL}/tags/${encodeURIComponent(tag)}`,
      lastmod: latestPost ?? now,
      changefreq: "weekly",
      priority: "0.5",
    });
  }

  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function buildRobots(): string {
  return `User-agent: *\nAllow: /\n\nDisallow: /og\nDisallow: /api\n\nSitemap: ${SITE_URL}/sitemap.xml\nHost: ${SITE_URL}\n`;
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

  writeFileSync(sitemapPath, buildSitemap(posts), "utf-8");
  writeFileSync(robotsPath, buildRobots(), "utf-8");

  console.log(`✓ sitemap.xml (${posts.length} posts) → ${sitemapPath}`);
  console.log(`✓ robots.txt → ${robotsPath}`);
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
