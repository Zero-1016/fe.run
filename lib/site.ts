export const siteConfig = {
  name: "fe.run",
  description:
    "코드가 갈리는 자리를 직접 돌려보며 짚는 프론트엔드 기록. React, CSS, 웹 표준, 성능과 접근성을 읽고 끝내지 않고 데모로 확인합니다.",
  shortDescription: "갈리는 자리를 직접 돌려보는 프론트엔드 기록",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://frontend.run").replace(/\/$/, ""),
  locale: "ko_KR",
  author: "Zero-1016",
  authorUrl: "https://github.com/Zero-1016",
  social: {
    github: "https://github.com/Zero-1016",
  },
} as const;

export const SITE_URL = siteConfig.url;
