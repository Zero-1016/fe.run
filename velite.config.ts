import { defineConfig, defineCollection, s } from "velite";
import rehypePrettyCode from "rehype-pretty-code";

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s.object({
    title: s.string().max(120),
    description: s.string().max(300),
    date: s.isodate(),
    updated: s.isodate().optional(),
    tags: s.array(s.string()).default([]),
    series: s.string().optional(),
    seriesOrder: s.number().optional(),
    cover: s.string().optional(),
    banner: s.string().optional(),
    published: s.boolean().default(true),
    slug: s.path().transform((p) => {
      const parts = p.split("/");
      return parts[parts.length - 1];
    }),
    toc: s.toc(),
    metadata: s.metadata(),
    charCount: s
      .custom<string | undefined>((i) => i === undefined || typeof i === "string")
      .transform((_, { meta }) => (meta.plain ?? "").replace(/\s/g, "").length),
    excerpt: s
      .custom<string | undefined>((i) => i === undefined || typeof i === "string")
      .transform((_, { meta }) => {
        const plain = (meta.plain ?? "").replace(/\s+/g, " ").trim();
        if (plain.length <= 280) return plain;
        const sliced = plain.slice(0, 280);
        const lastSpace = sliced.lastIndexOf(" ");
        return (lastSpace > 200 ? sliced.slice(0, lastSpace) : sliced).trim();
      }),
    hasReferences: s
      .custom<string | undefined>((i) => i === undefined || typeof i === "string")
      .transform((_, { meta }) => (meta.content ?? "").includes("<References")),
    body: s.mdx(),
  }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { posts },
  mdx: {
    rehypePlugins: [
      [
        rehypePrettyCode as never,
        {
          theme: {
            dark: "github-dark",
            light: "github-light",
          },
          keepBackground: false,
        },
      ],
    ],
  },
});
