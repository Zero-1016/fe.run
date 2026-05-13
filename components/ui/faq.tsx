import type { ReactNode } from "react";

interface FAQItem {
  question: string;
  answer: ReactNode;
}

interface FAQProps {
  title?: string;
  items: FAQItem[];
}

function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    return extractText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

export function FAQ({ title = "자주 묻는 질문", items }: FAQProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: extractText(item.answer).replace(/\s+/g, " ").trim(),
      },
    })),
  };

  return (
    <section className="not-prose my-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="mb-4 text-foreground">{title}</h2>
      <dl className="flex flex-col gap-4 border-l-2 border-border pl-5">
        {items.map((item, i) => (
          <div key={i}>
            <dt className="text-base font-semibold text-foreground">{item.question}</dt>
            <dd className="mt-2 text-sm leading-7 text-secondary">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
