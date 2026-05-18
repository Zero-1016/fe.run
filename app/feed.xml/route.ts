import { posts } from "#site/content";
import { siteConfig, SITE_URL } from "@/lib/site";

const BASE_URL = SITE_URL;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const published = posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latest = published[0];
  const lastBuildDate = (
    latest ? new Date(latest.updated ?? latest.date) : new Date()
  ).toUTCString();

  const items = published
    .map((post) => {
      const pubDate = new Date(post.date).toUTCString();
      const categories = post.tags
        .map((t) => `      <category>${escapeXml(t)}</category>`)
        .join("\n");
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${BASE_URL}/posts/${post.slug}</link>
      <description><![CDATA[${post.description}]]></description>
      <content:encoded><![CDATA[${post.excerpt ?? post.description}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${BASE_URL}/posts/${post.slug}</guid>
${categories}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>ko</language>
    <dc:creator>${siteConfig.author}</dc:creator>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
