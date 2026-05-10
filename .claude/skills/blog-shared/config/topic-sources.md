# 영감 소스 카탈로그 (글감 추천용)

`blog-topic-suggest` 스킬에서 글감 후보를 가져올 때 사용하는 영감 소스
카탈로그입니다.

**이 파일은 `domains.md` 와 별개입니다**:

- `domains.md` — 자료 우선순위 분류 (1순위/2순위/3순위/블랙리스트). 본문
  References 의 권위 판단 용
- `topic-sources.md` — **영감 소스** 카탈로그. 글감 아이디어를 가져올 도메인.
  본문/References 에는 들어가지 않음 (§RULE-EXTERNAL-MENTION 준수)

같은 도메인이 양쪽에 등장할 수 있어요. 예를 들어 web.dev 는 1순위 자료
도메인이면서 동시에 트렌드 영감 소스이기도 합니다. 역할이 다를 뿐 충돌 아님.

섹션 ID: `§TOPIC-SOURCE-TREND` ~ `§TOPIC-SOURCE-KOREA`

---

## §TOPIC-SOURCE-TREND — 외국, 트렌드 우선

최근 발표·릴리스·실험을 가장 빠르게 다루는 곳들. 90 일 이내 글이 자주 나옴.
RSS/feed URL 우선 사용 (있는 경우).

### 브라우저·웹 표준

- `web.dev` — Google 의 웹 플랫폼 가이드/실험. 후크 풍부
  - feed: `https://web.dev/feed.xml`
- `developer.chrome.com` — Chrome 신기능, Origin Trial 발표
  - feed: `https://developer.chrome.com/feeds/blog.xml`
- `hacks.mozilla.org` — Firefox/Mozilla 개발자 블로그
  - feed: `https://hacks.mozilla.org/feed/`
- `v8.dev` — V8 엔진 내부, 최적화 트릭
  - feed: `https://v8.dev/blog.atom`
- `webkit.org` — Safari/WebKit 동작
  - feed: `https://webkit.org/feed/`

### 프레임워크 공식 블로그

- `react.dev/blog` — React 코어 발표
  - index: `https://react.dev/blog`
- `nextjs.org/blog` — Next.js 릴리스/실험
  - index: `https://nextjs.org/blog`
- `vercel.com/blog` — Vercel 플랫폼/엔지니어링
  - index: `https://vercel.com/blog`

크롤 hint: 트렌드 도메인은 보통 `index page → 최근 5개 글 메타 추출` 구조로
WebFetch 한 번에 충분.

---

## §TOPIC-SOURCE-EVERGREEN — 외국, 가이드/심층

발행일 영향이 적은 가이드, 멘탈 모델, 심층 글. 1년 넘은 글도 여전히 좋은
영감.

- `css-tricks.com` — CSS 위주 패턴 모음
  - feed: `https://css-tricks.com/feed/`
- `smashing-magazine.com` — UX/접근성/CSS/JS 깊은 분석
  - feed: `https://www.smashingmagazine.com/feed/`
- `joshwcomeau.com` — CSS/React 의 멘탈 모델 글
  - index: `https://www.joshwcomeau.com/`
- `kentcdodds.com` — React 패턴, 테스팅, 추상화
  - index: `https://kentcdodds.com/blog`

추가 후보 (2026-05 시점 미등록, 필요 시 blog-rule-editor 로 추가):

- `overreacted.io` — Dan Abramov, React 멘탈 모델
- `martinfowler.com` — 일반 SW 패턴 (프론트도 가끔)
- `2ality.com` — JavaScript 심층

---

## §TOPIC-SOURCE-KOREA — 한국, 옵션

한국 회사 tech 블로그. 라벨 모드와 무관하게 라운드 로빈에서 1~2회 슬롯
할당. 한국 독자 친화 주제 (실무 케이스, 도입 후기) 영감용.

- `toss.tech` — 토스 기술 블로그
  - index: `https://toss.tech`
- `tech.kakao.com` — 카카오 기술 블로그
  - index: `https://tech.kakao.com/blog`
- `techblog.woowahan.com` — 우아한형제들 기술 블로그
  - index: `https://techblog.woowahan.com`
- `d2.naver.com` — 네이버 D2 (활동 빈도 낮음)
  - index: `https://d2.naver.com/home`

크롤 hint: 한국 tech 블로그는 SPA/JSON 응답이 많아 WebFetch 가 메타만 받을
수 있음. WebSearch 보조 (`site:toss.tech <영역>`) 권장.

⚠️ 한국 회사명은 추천 단계 출력에 **도메인** 으로만 표기 (예: `toss.tech`).
회사 정식명 ("토스", "카카오") 표기 금지 — 메모리 §RULE-NO-COMPANY-NAME 준수.

---

## §TOPIC-SOURCE-BLACKLIST — 영감 소스에서도 제외

`domains.md §DOMAIN-BLACKLIST` 와 동일하게, 영감 소스에서도 제외:

- `www.w3schools.com`
- `www.tutorialspoint.com`
- `geeksforgeeks.org`

추가로 영감 소스 전용 제외:

- 익명 미디엄/dev.to 글 (저자 추적 불가)
- AI 생성 의심 글 (목록형 제목 패턴)

---

## 수정 가이드

이 파일은 `blog-rule-editor` 스킬로 수정하세요. 직접 편집은 비권장.

### 추가할 때

1. 해당 섹션 (`TREND`/`EVERGREEN`/`KOREA`) 찾기
2. 도메인 + 짧은 설명 + feed/index URL
3. CHANGELOG.md 에 변경 기록

### 제거할 때

1. 제거 사유 (서비스 종료 / 글 발행 중단 / 품질 저하)
2. 해당 라인 삭제
3. CHANGELOG.md 에 기록

### 라벨 매핑이 모호할 때

같은 도메인이 트렌드성 글과 에버그린 글을 모두 발행하면 **트렌드** 섹션에 등록.
labeling 은 글 단위 `posted_date` 로 하므로 카탈로그 분류는 "어느 슬롯에서 더
자주 뽑아 올 것인가" 의 의미.
