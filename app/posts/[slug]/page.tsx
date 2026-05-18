import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { posts } from "#site/content";
import { formatCardDate } from "@/lib/utils";
import { readingTime, readingMinutes } from "@/lib/reading-time";
import { siteConfig, SITE_URL } from "@/lib/site";
import { MDXContent } from "@/components/mdx/mdx-content";
import { SeriesNav } from "@/components/ui/series-nav";
import { Toc } from "@/components/ui/toc";
import { MobileToc } from "@/components/ui/mobile-toc";
import { PostHeader } from "@/components/ui/post-header";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { RelatedPosts } from "@/components/ui/related-posts";
import { pickRelatedPosts } from "@/lib/related-posts";
import { Comments } from "@/components/ui/comments";
import { OverflowTags } from "@/components/ui/overflow-tags";
import { CopyArticle } from "@/components/ui/copy-article";
import { Banner } from "@/components/ui/banner";

interface Props {
  params: Promise<{ slug: string }>;
}

function getPost(slug: string) {
  return posts.find((p) => p.slug === slug && p.published);
}

export function generateStaticParams() {
  return posts.filter((p) => p.published).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const ogUrl = `/og/${post.slug}`;
  const canonical = `/posts/${post.slug}`;
  const publishedTime = new Date(post.date).toISOString();
  const modifiedTime = new Date(post.updated ?? post.date).toISOString();

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: siteConfig.author }],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      locale: siteConfig.locale,
      url: `${SITE_URL}${canonical}`,
      siteName: siteConfig.name,
      title: post.title,
      description: post.description,
      publishedTime,
      modifiedTime,
      authors: [siteConfig.author],
      tags: post.tags,
      section: post.series ?? (post.tags[0] || "Tech"),
      images: [{ url: ogUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogUrl],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const toc = post.hasReferences
    ? [...post.toc, { title: "참고 자료", url: "#references", items: [] }]
    : post.toc;

  const postUrl = `${SITE_URL}/posts/${post.slug}`;
  const publishedIso = new Date(post.date).toISOString();
  const modifiedIso = new Date(post.updated ?? post.date).toISOString();
  const ogImageUrl = `${SITE_URL}/og/${post.slug}`;
  const minutes = readingMinutes(post.charCount);

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    headline: post.title,
    description: post.description,
    articleBody: post.excerpt,
    image: {
      "@type": "ImageObject",
      url: ogImageUrl,
      width: 1200,
      height: 630,
    },
    datePublished: publishedIso,
    dateModified: modifiedIso,
    wordCount: post.charCount,
    timeRequired: `PT${minutes}M`,
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: siteConfig.author,
      url: SITE_URL,
      sameAs: Object.values(siteConfig.social),
    },
    publisher: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: siteConfig.author,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    isPartOf: {
      "@type": "Blog",
      "@id": `${SITE_URL}/#blog`,
      name: siteConfig.name,
      url: SITE_URL,
    },
    keywords: post.tags.join(", "),
    inLanguage: "ko-KR",
    articleSection: post.series ?? post.tags[0] ?? "Tech",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".prose h2", ".prose h3", ".prose > p:first-of-type"],
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      ...(post.series
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: post.series,
              item: `${SITE_URL}/series/${encodeURIComponent(post.series)}`,
            },
            { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
          ]
        : [{ "@type": "ListItem", position: 2, name: post.title, item: postUrl }]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ScrollProgress />
      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <div className="xl:flex xl:gap-16">
          <article className="mx-auto min-w-0 max-w-3xl flex-1 xl:mx-0">
            <PostHeader>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight leading-tight">{post.title}</h1>
                <CopyArticle />
              </div>
              <p className="mt-3 text-lg text-secondary">{post.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm text-secondary">
                <time dateTime={post.date} className="whitespace-nowrap">
                  {formatCardDate(post.date)}
                </time>
                <span>·</span>
                <span className="whitespace-nowrap">{readingTime(post.charCount)}</span>
                {post.tags.length > 0 && (
                  <>
                    <span>·</span>
                    <OverflowTags tags={post.tags} />
                  </>
                )}
              </div>
            </PostHeader>
            {!post.cover && (
              <div className="mt-8 mb-10 overflow-hidden rounded-xl">
                <Banner
                  title={post.title}
                  slug={post.slug}
                  tags={post.tags}
                  banner={post.banner}
                  className="aspect-[2/1] w-full"
                />
              </div>
            )}
            {toc.length > 0 && <MobileToc items={toc} />}
            <div className="prose">
              <MDXContent code={post.body} />
            </div>
            {post.series && (
              <SeriesNav
                series={post.series}
                posts={posts
                  .filter((p) => p.published && p.series === post.series)
                  .map((p) => ({
                    slug: p.slug,
                    title: p.title,
                    seriesOrder: p.seriesOrder,
                  }))}
                currentSlug={post.slug}
              />
            )}
            <Comments />
            <RelatedPosts posts={pickRelatedPosts(post, posts)} />
          </article>
          {toc.length > 0 && <Toc items={toc} />}
        </div>
      </div>
    </>
  );
}
