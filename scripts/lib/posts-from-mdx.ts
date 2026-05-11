import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  series?: string;
  published: boolean;
}

function parseFrontmatter(source: string): Record<string, unknown> | null {
  if (!source.startsWith("---")) return null;
  const end = source.indexOf("\n---", 3);
  if (end === -1) return null;
  const block = source.slice(3, end).trim();
  const out: Record<string, unknown> = {};

  for (const rawLine of block.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const rawValue = line.slice(colon + 1).trim();

    if (!rawValue) {
      out[key] = "";
      continue;
    }

    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      const inner = rawValue.slice(1, -1).trim();
      out[key] = inner ? inner.split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")) : [];
      continue;
    }

    if (rawValue === "true" || rawValue === "false") {
      out[key] = rawValue === "true";
      continue;
    }

    if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
      out[key] = Number(rawValue);
      continue;
    }

    out[key] = rawValue.replace(/^["']|["']$/g, "");
  }

  return out;
}

function walkMdx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walkMdx(full));
    } else if (entry.endsWith(".mdx")) {
      out.push(full);
    }
  }
  return out;
}

export function readPostsFromMdx(): PostMeta[] {
  const dir = resolve(process.cwd(), "content/posts");
  const files = walkMdx(dir);
  const posts: PostMeta[] = [];

  for (const file of files) {
    const raw = readFileSync(file, "utf-8");
    const fm = parseFrontmatter(raw);
    if (!fm) continue;
    if (fm.published === false) continue;

    posts.push({
      slug: basename(file, ".mdx"),
      title: String(fm.title ?? ""),
      description: String(fm.description ?? ""),
      date: String(fm.date ?? ""),
      tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
      series: fm.series ? String(fm.series) : undefined,
      published: fm.published !== false,
    });
  }

  return posts;
}
