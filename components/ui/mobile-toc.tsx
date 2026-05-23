interface TocEntry {
  title: string;
  url: string;
  items: TocEntry[];
}

interface MobileTocProps {
  items: TocEntry[];
}

function flattenToc(
  entries: TocEntry[],
  depth = 2
): { title: string; url: string; depth: number }[] {
  const result: { title: string; url: string; depth: number }[] = [];
  for (const entry of entries) {
    result.push({ title: entry.title, url: entry.url, depth });
    if (entry.items.length > 0) {
      result.push(...flattenToc(entry.items, depth + 1));
    }
  }
  return result;
}

export function MobileToc({ items }: MobileTocProps) {
  const flat = flattenToc(items);

  if (flat.length === 0) return null;

  return (
    <nav aria-label="목차" className="mb-8 rounded-lg border border-border p-4 xl:hidden">
      <h2 className="mb-3 text-sm font-medium">목차 ({flat.length})</h2>
      <ul className="flex flex-col gap-1.5">
        {flat.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              className="block text-sm text-secondary transition-colors hover:text-accent"
              style={{ paddingLeft: item.depth === 2 ? 0 : "1rem" }}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
