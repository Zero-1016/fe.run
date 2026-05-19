export const siteConfig = {
  name: "Tech Blog",
  description:
    "코드를 짜다 마주친 궁금한 것들을 하나씩 따라가며 정리하는 프론트엔드 기록. React, CSS, 웹 표준, 성능과 접근성 노트를 다룹니다.",
  shortDescription: "갈리는 자리를 짚는 프론트엔드 기록",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.frontend.run").replace(/\/$/, ""),
  locale: "ko_KR",
  author: "Zero-1016",
  authorUrl: "https://github.com/Zero-1016",
  social: {
    github: "https://github.com/Zero-1016",
  },
} as const;

export const SITE_URL = siteConfig.url;
