"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  feedUrl: string;
  githubUrl: string;
};

export function SubscribeSection({ feedUrl, githubUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      toast.success("RSS 주소를 복사했어요.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("복사하지 못했어요.");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-background p-4 sm:p-5 dark:bg-[--color-bg-secondary]">
      <div className="flex items-center gap-2">
        <RssIcon />
        <p className="text-sm font-medium">RSS 피드</p>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <code className="block min-w-0 flex-1 break-all rounded-lg border border-border bg-code-bg px-3 py-2 font-mono text-xs leading-relaxed text-secondary sm:truncate sm:break-normal sm:leading-normal">
          {feedUrl}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-transparent px-3 py-2.5 text-xs font-medium text-secondary transition-colors hover:border-accent/30 hover:text-accent sm:w-auto sm:py-2"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "복사됨" : "복사"}
        </button>
      </div>

      <a
        href={githubUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-4 inline-flex items-center gap-2 text-sm text-secondary transition-colors hover:text-accent"
      >
        <GithubIcon />
        GitHub에서 보기
        <ArrowIcon />
      </a>
    </div>
  );
}

function RssIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.07 11.07 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.4-5.25 5.69.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}
