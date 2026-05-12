export const POPULAR_TAG_MIN_COUNT = 3;
export const POPULAR_TAG_LIMIT = 8;

export type PostForPopularTags = {
  published: boolean;
  tags: string[];
};

export function getPopularTagEntries(posts: PostForPopularTags[]): [string, number][] {
  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    if (!post.published) continue;
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  return [...tagCounts.entries()]
    .filter(([, count]) => count > 0 && count >= POPULAR_TAG_MIN_COUNT)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, POPULAR_TAG_LIMIT);
}
