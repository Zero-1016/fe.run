# Blog Skills Family — Changelog

이 파일은 blog-rule-editor 가 자동으로 관리합니다. 직접 편집 가능하지만,
형식을 유지하세요.

---

## 2026-06-09 23:15

### SHARED.md §RULE-TERM-INTRODUCTION — 번호 기반 스펙 참조 도입 규칙 확장

**변경**: `대상`에 "번호 기반 스펙 참조(RFC 6749, RFC 7636, ECMA-262 등)" 항목
추가. `형식`에 "번호는 풀어쓰기 불가 → 한 줄 정의 또는 인라인 링크+풀이로 무슨
표준인지 밝힌다"는 주의 추가.

**이유**: OAuth 2.0 프론트엔드 글 검토 중, RFC 번호가 본문에 설명 없이 등장하면
독자가 "이게 뭔데?" 하고 막히는 문제 발견. 기존 §RULE-TERM-INTRODUCTION 이
"표준·명세 약식 표기"를 다루지만 예시가 이름 기반(Background Sync)뿐이고,
번호 기반 스펙은 "풀어쓰기"가 불가능한 사각지대였음.

**수정 유형**: 기존 규칙 확장 (대상 항목 + 형식 주의)

**영향 범위**:

- blog-writer: §RULE-TERM-INTRODUCTION 참조 (자동 반영)
- blog-coherence-review: E5 가 이 규칙으로 통독 검사 (자동 반영)
- 기존 글: RFC/번호 스펙 사용 7건 (data-url-when-to-use, oauth2-frontend-pkce,
  react-concurrent-rendering, react-use-resource-not-state,
  stale-while-revalidate-two-layers, swr-vs-tanstack-query-philosophy,
  why-cookies-follow-every-request) — 강화 방향이라 재검증 시 누락 지점 잡힐 수 있음

**백업**: `.backups/SHARED-20260609-231544.md`

**재검증 결과**: oauth2-frontend-pkce.mdx 는 이미 규칙 준수 (RFC 6749 "인터넷
표준을 정하는 IETF 가 펴낸 명세", RFC 7636 은 PKCE 로 풀이). 신규 규칙의 모범 예시.

---

## 2026-05-19 11:30

### SHARED.md — 번역투·형식명사·접속사 반복·정량 지표 4개 섹션 신설

**변경**:

- `§RULE-FORBIDDEN-PATTERNS` 하위에 `§RULE-TRANSLATIONESE` (번역투),
  `§RULE-FORMAL-NOUN` (형식명사 남용) 신규 추가
- `§RULE-RHYTHM` 하위에 `§RULE-RHYTHM-CONJUNCTION` (문두 접속사 반복) 신규 추가
- `§META-EXPRESSION-METRICS` (정량 지표 정의) 신규 추가
- `blog-expression-review/SKILL.md`: 전제 섹션 + Step 2 검사 항목 (A7, A8, B4
  추가) + Step 3/4 자동 수정 분류 + dry_run 리포트 형식 + 최종 리포트 정량 지표
  블록 + 정량 지표 계산 방법 추가
- `blog-writer/SKILL.md`: 전제 섹션 + Step 4 작성 규칙 + Step 8-6 자가 체크에
  A7/A8/B4 추가

**이유**: 한글 AI 티 검사 분류 체계 (번역투·형식명사·접속사 반복 등) 를 참고해
기존 expression-review 가 못 잡던 카테고리를 보강. 정량 지표는 다듬기 전후 회귀
추적을 위해 도입. 우리 시스템은 어조 정책과 MDX 인식이 강하지만 번역투 카테고리가
약했음.

**수정 유형**: 새 규칙 섹션 추가 4개 + 2개 SKILL.md 통합 (기존 규칙 변경 없음)

**영향 범위**:

- `blog-expression-review`: 검사 항목 6 → 9개, 정량 지표 자동 출력
- `blog-writer`: 작성 시 신규 3개 규칙 자가 회피. 자가 체크리스트 강화
- `blog-revise`: expression-review 호출하므로 자동 반영 (직접 수정 없음)
- `blog-validator`, `blog-coherence-review`, `blog-draft-review`: 영향 없음
  (해당 영역 아님)
- 기존 글 (`content/posts/*.mdx`) — 새 규칙으로 재검증하면 추가 위반 발생 가능

**백업**:

- `.backups/SHARED-20260519-110934.md`
- `.backups/blog-expression-review-SKILL-20260519-112635.md`
- `.backups/blog-writer-SKILL-20260519-113021.md`

**재검증**: 기존 글 영향 가능성 있음. Phase 6 에서 영향받는 글 확인 후 재검증
여부 사용자에게 제안.

---

## 2026-05-18 14:16

### SEO 신선도 신호 — `updated` frontmatter 필드 도입 및 스킬 통합

**변경**:

- SHARED.md §FRONTMATTER: "선택 필드" 서브섹션 신설. 옵셔널 `updated:
<YYYY-MM-DD>` 필드 명세. 본문을 의미 있게 다듬은 날짜를 기록하면 sitemap
  lastmod / BlogPosting `dateModified` / OG `modifiedTime` 에 자동 반영됨.
  새 글 작성에는 적지 않음.
- blog-revise/SKILL.md: 새 섹션 "공통: frontmatter `updated` 자동 갱신" 추가
  (Phase 4 직전). 패턴 2 Step P2-4, 패턴 3 Step P3-6, 패턴 4 새 Step P4-6 에서
  이 절차 참조. 패턴 1/5 는 본문 무변경이라 건너뜀.
- blog-writer/SKILL.md: Step 1 frontmatter 확정에 "적지 않는 필드: `updated`"
  한 줄 추가. blog-revise 가 자동 관리한다는 점 명시.

**이유**: velite 스키마에 옵셔널 `updated` 필드 추가됨 (lib/site.ts /
scripts/generate-seo.ts / app/posts/[slug]/page.tsx / types/content.d.ts). 글 수정
후 신선도 신호를 검색엔진/AI 검색에 보내려면 이 필드를 갱신해야 함. 사용자가 매번
수동으로 적는 대신 blog-revise 가 자동 처리하도록 표준화.

**수정 유형**: 신규 규칙 추가 (선택 필드 + 자동 갱신 절차)

**영향 범위**:

- velite 스키마: 이미 `updated: s.isodate().optional()` 추가됨 (사전 작업)
- types/content.d.ts: 이미 `updated?: string` 추가됨 (사전 작업)
- app/posts/[slug]/page.tsx: 이미 `post.updated ?? post.date` 사용 (사전 작업)
- scripts/generate-seo.ts: 이미 sitemap lastmod 에 반영 (사전 작업)
- 기존 글 58편: 영향 없음 (옵셔널 필드)
- 다른 blog-\* 스킬 (validator, expression-review, coherence-review,
  draft-review, research, write, banner, topic-suggest): 영향 없음
- writer-failures.md: 0건 관련 실패

**백업**:

- `.backups/SHARED-20260518-141629.md`
- `.backups/blog-revise-SKILL-20260518-141629.md`
- `.backups/blog-writer-SKILL-20260518-141629.md`

**재검증**: 옵셔널 필드 추가라 기존 글 재검증 불필요.

---

## 2026-05-13 15:32

### AEO 보강 — §RULE-LEAD-DIRECT 신설, §MDX-FAQ 추가, blog-writer/draft-review 통합

**변경**:

- SHARED.md: §RULE-FORBIDDEN-PATTERNS 묶음 안에 §RULE-LEAD-DIRECT 신설.
  도입부 첫 단락에 "장면/질문 + 한 문장 핵심 답"을 모두 갖추도록 요구.
- SHARED.md: §MDX-COMPONENTS JSX 예시 블록에 `<FAQ>` 사용 예시 추가.
- SHARED.md: §MDX-FAQ 하위 섹션 신설. AEO 효과(FAQPage schema 자동 주입),
  글당 1개 제한, question 독자 질문형, References 직전 배치 가이드.
- blog-writer/SKILL.md: "전제" 의 §RULE-FORBIDDEN-PATTERNS 행에 §RULE-LEAD-DIRECT
  포함 명시. Step 3 오프닝 단락 작성 가이드를 직접 답 패턴 중심으로 재구성.
  Step 7 마무리에 FAQ 권장 가이드 추가. Step 8 자가 체크리스트에
  §RULE-LEAD-DIRECT 항목 추가.
- blog-draft-review/SKILL.md: description, "전제", "자동 수정 가능" 분류,
  검사 흐름에 D6 추가. D5 다음 위치에 D6 (도입부 핵심 답 후보) 검사 본문 신설.
- blog-write/SKILL.md: draft-review 결과 보고 템플릿 예시에 D6 항목 추가.

**이유**:

ChatGPT·Perplexity·Google AI Overview 같은 답변 엔진은 글의 첫 200~300자만 보고
인용 여부를 결정합니다. 기존 도입부는 정황·경험 묘사 중심이라 답변 엔진이 글의
주제를 잡지 못해 인용도가 낮았어요. AEO(Answer Engine Optimization) 측면에서
도입부 패턴을 표준화하고, FAQPage schema 를 통해 Q&A 쌍을 직접 인용 가능하게
만들었습니다. velite·JSON-LD·CollectionPage·BlogPosting 같은 코드 측 변경은
별도로 (skill 영역 아님).

**수정 유형**: 새 규칙 섹션 추가 + 기존 skill 통합

**영향 범위**:

- blog-writer: §RULE-LEAD-DIRECT 강제 적용. Step 3 패턴, Step 8 체크 항목.
- blog-draft-review: D6 검사 항목 추가. 기획안 단계에서 핵심 답 후보 검증.
- blog-write: D6 결과를 보고 템플릿에 노출.
- blog-coherence-review, blog-expression-review: 다른 층이라 충돌 없음
  (전자는 도입-결론 호응 E1, 후자는 표현 규칙).
- 기존 86개 글: 위반으로 잡히지 않음 (validator/expression-review 가 §RULE-LEAD-DIRECT
  를 검사하지 않으므로). 신규 글부터 적용.

**백업**:

- `.backups/SHARED-20260513-153246.md`
- `.backups/blog-writer-SKILL-20260513-153246.md`
- `.backups/blog-draft-review-SKILL-20260513-153246.md`
- `.backups/blog-write-SKILL-20260513-153246.md`

**관련 코드 변경 (참고, skill 외부)**:

- `components/ui/faq.tsx` 신규 (FAQPage JSON-LD 자동 주입 컴포넌트)
- `components/mdx/mdx-components.tsx` 에 FAQ 등록
- `components/ui/CLAUDE.md` 에 FAQ 사용법 추가 (코드 레벨 SSOT)
- `app/tags/[tag]/page.tsx` 에 CollectionPage + ItemList + BreadcrumbList JSON-LD
- `app/series/[slug]/page.tsx` 에 동일 JSON-LD

**재검증 결과**: 기존 글 영향 없음 (신규 규칙은 신규 글부터). FAQ 컴포넌트는 신규
글 작성 시 선택적 사용. dev 서버에서 view-source 로 JSON-LD 주입 확인 권장.

---

## 2026-05-10 12:44

### blog-topic-suggest 신설 — 외국·국내 테크 블로그 영감 기반 글감 추천

**변경**:

신규 파일 (2개):

- `.claude/skills/blog-topic-suggest/SKILL.md` — 새 스킬. Phase 1 (기존 글
  frontmatter 인덱스) → Phase 2 (영감 소스 sub-agent 크롤, WebFetch 한도 8회) →
  Phase 3 (트렌드/에버그린/혼합 라벨링) → Phase 4 (중복도 결정론 점수, 가중치
  tag 0.5 + title 0.35 + slug 0.15, 0.5+ 자동 제외) → Phase 5 (1순위 자료
  가능성 추정, context7 resolve-id 만 사용) → Phase 6 (마크다운 표 + 사용자
  선택, AskUserQuestion) → Phase 7 (blog-write 자동 호출 안 함, 안내 메시지만)
- `.claude/skills/blog-shared/config/topic-sources.md` — 영감 소스 카탈로그.
  `§TOPIC-SOURCE-TREND` (web.dev, developer.chrome.com, hacks.mozilla.org,
  v8.dev, webkit.org, react.dev/blog, nextjs.org/blog, vercel.com/blog),
  `§TOPIC-SOURCE-EVERGREEN` (css-tricks, smashing-magazine, joshwcomeau,
  kentcdodds), `§TOPIC-SOURCE-KOREA` (toss.tech, tech.kakao.com,
  techblog.woowahan.com, d2.naver.com), `§TOPIC-SOURCE-BLACKLIST`

수정 파일 (2개):

SHARED.md (2곳):

- `§RULE-EXTERNAL-MENTION` 끝부분에 "topic-suggest 와의 분리" 단락 추가 —
  영감 도메인이 본문 인라인 링크/References 에 자동 들어가지 않음을 명시
- `§META-FEEDBACK-HANDOFF` 다음에 `§TOPIC-SUGGEST-FLOW` 신설 — 라벨 정의,
  중복도 임계값(0.5/0.3), 영감 출처 vs References 분리 원칙, 카탈로그 위치
  명시

AGENTS.md (4곳):

- "빠른 참조" 표에 `/blog-topic-suggest [영역]` 행 추가 (맨 위)
- "스킬 관계" 헤더 "9개 스킬" → "12개 스킬" 정정
- 호출 관계 다이어그램에 `blog-topic-suggest` 블록 추가 (독립 실행, blog-write
  자동 연결 없음). blog-rule-editor 관리 파일에 `config/topic-sources.md` 추가
- 참조 관계 표에 `blog-topic-suggest` 행 추가 (참조: §SOURCE-PRIORITY,
  §DOMAIN-WHITELIST, §UI-USER-CHOICE, §FRONTMATTER, §RULE-EXTERNAL-MENTION,
  §TOPIC-SUGGEST-FLOW)
- "작업 시나리오별 가이드" 시나리오 6 다음에 시나리오 7 (다음 글 주제가
  떠오르지 않을 때) 추가

**이유**:

64개 글이 누적되면서 다음 글 주제 결정에 시간이 듦. 외국·국내 테크 블로그를
영감 소스로 활용하되, 영감 출처가 본문 References 로 잘못 끌려가는 사고를
구조적으로 차단해야 함 (§RULE-EXTERNAL-MENTION 보강 동기). blog-research 의
sub-agent 격리 패턴을 그대로 차용해 컨텍스트 오염 없이 후보 메타만 받음.

**수정 유형**: 새 skill 추가 (Rail 7 — 여러 번 확인, 본 케이스는 plan
승인 후 통합 1회로 압축)

**영향 범위**:

- 새 명령 `/blog-topic-suggest [영역]` 사용 가능
- 기존 글 영향 없음 (글 작성 규칙 변경 아님)
- blog-write 와는 사용자 클릭으로만 연결, 자동 호출 없음 (영감 출처가 GATE 1
  컨텍스트로 새는 것 차단)
- 기존 다른 스킬에 추가 변경 없음

**백업**:

- `.backups/SHARED-20260510-124446.md`
- `.backups/AGENTS-20260510-124446.md`

**재검증 결과**: 글 작성 규칙 변경 아님 → 기존 글 재검증 불필요 (Phase 6 스킵)

---

## 2026-05-10 12:57

### blog-topic-suggest 영속화 (Step 6-3, 6-4, 7-1) 추가

**변경**:

`.claude/skills/blog-topic-suggest/SKILL.md` (5곳):

- frontmatter `tools` 에 `Write`, `Edit`, `Bash` 추가 (로그 파일 쓰기용)
- Phase 6 에 Step 6-3 (추천 결과 영속화) 신설:
  - 저장 위치: `content/tmp/topic-suggestions/<YYYYMMDD-HHMMSS>-<영역-slug>.md`
  - frontmatter: created_at / area / label_mode / count / webfetch_used /
    selected
  - 가드 헤더 (영감 도메인 References 자동 포함 금지) 본문 상단 자동 포함
  - 본문 / 원문 / 코드 블록 저장 금지 — hook_one_liner 와 메타만
- Phase 6 에 Step 6-4 (만료 정리) 신설: 호출 시작 시 30일 초과 로그 자동
  `find -mtime +30 -delete`
- Phase 7-1 (로그 frontmatter `selected` 필드 업데이트) 신설, 기존 7-1 →
  7-2 로 번호 이동
- "제약" 섹션 갱신: `content/tmp/topic-suggestions/` 안에서만 쓰기 허용
  (gitignored 로컬 로그)

**이유**:

추천 결과가 대화 컨텍스트에만 있으면 회상 불가 + 매번 WebFetch 비용. 사용자가
"지난번 추천에서 1번 골랐는데 2~6번도 괜찮았다" 같은 회상을 할 수 있게 로컬
영속화 추가. `content/tmp/*` 는 이미 `.gitignore` 60·73줄에 등록되어 있어 추가
작업 불필요.

**수정 유형**: 기존 skill 보강 (Phase 추가)

**영향 범위**:

- 기존 글 영향 없음
- `.gitignore` 변경 없음 (이미 `content/tmp/*` 무시 규칙 존재)
- 다른 스킬 영향 없음
- 토큰 예산: 로그 파일 1개당 ~2KB (메타 + 후보 표). 30일 누적 ~50개 가정 시
  100KB 미만

**백업**: `.backups/blog-topic-suggest-SKILL-20260510-125731.md`

**재검증 결과**: 글 작성 규칙 변경 아님 → 기존 글 재검증 불필요

---

## 2026-05-10 13:00

### blog-topic-suggest 이전 추천 cross-dedup (Step 1-4·1-5, Phase 4-2 갱신)

**변경**:

`.claude/skills/blog-topic-suggest/SKILL.md` (3곳):

- Phase 1 에 Step 1-4 (이전 추천 인덱스 빌드) 신설:
  - `content/tmp/topic-suggestions/*.md` 글로브, 30 일 이내 로그만 인덱스
  - frontmatter `selected` 채워진 후보는 "강한 중복" 으로 분류
  - 메모리에서만 유지, 다시 쓰지 않음
- Phase 1 에 Step 1-5 (두 인덱스 통합) 신설: 기존 글 인덱스 +
  이전 추천 인덱스를 하나로 합치지 않고, Phase 4 가 각각 점수 계산
- Phase 4 Step 4-2 갱신:
  - `dupScoreVsPosts` (기존 글) 와 `dupScoreVsPrevious` (이전 추천) 분리 계산
  - 이전 추천 임계값: 0.5 자동 제외 / 0.4 + selected 자동 제외 (사용자가
    이미 골라 진행한 후보) / 0.3~0.5 표기
  - 둘 중 하나라도 자동 제외 조건 만족하면 후보에서 제거
- Phase 6 Step 6-1 출력 표 예시에 "지난 추천 유사" 표기 추가, 컬럼 표기
  규칙 명시

**이유**:

사용자 피드백 — 같은 후보가 다음 호출에서 또 뜨면 짜증. 특히 이미 골라서
blog-write 까지 진행한 후보는 강하게 차단해야 함. `content/tmp/topic-
suggestions/` 의 만료 안 된 로그를 인덱스로 활용해 cross-suggestion dedup.

기존 글 비교와 분리한 이유: 기존 글은 SSOT (이미 발행됨), 이전 추천은 후보
(아직 안 쓴 글). 임계값과 차단 강도가 달라야 함.

**수정 유형**: 기존 skill 보강 (Phase 단계 추가 + 알고리즘 갱신)

**영향 범위**:

- 기존 글 영향 없음
- 이전 추천 로그가 0개면 Step 1-4 가 빈 인덱스 반환, Phase 4 의
  `dupScoreVsPrevious` 는 항상 0 → 자연스럽게 무시됨 (backward compatible)
- 첫 사용 시 사후 저장한 `20260510-130037-react.md` 가 인덱스에 포함되어
  React 영역 다음 호출부터 즉시 동작

**백업**: `.backups/blog-topic-suggest-SKILL-20260510-125731.md` (직전 백업
재사용. 중간 변경 단계)

**재검증 결과**: 글 작성 규칙 변경 아님 → 기존 글 재검증 불필요

---

## 2026-04-30 16:49

### §RULE-TERM-INTRODUCTION 신설 — 약어·기술 용어 도입 검사

**변경**:

SHARED.md (1곳, 신규 섹션 추가):

- §RULE-EXTERNAL-MENTION 다음 자리에 §RULE-TERM-INTRODUCTION 신설
- 약어 (PWA / CDN / SSR / SSG / ISR / RSC / FCP / LCP / CLS / INP / TTI),
  이벤트 이름 (`install` / `activate` / `fetch` / `sync` / `beforeunload`),
  라이프사이클 단계 이름, API 메서드 이름이 본문 첫 등장 시 풀어쓰기·한 줄
  정의·인라인 링크 중 하나가 동반되어야 함을 규정
- 결론·요약 단락에서 본문에 한 번도 풀이되지 않은 용어를 던지지 말 것
- 예외: §META-TITLE "허용 1·2" 약어 (글의 핵심 식별자 + 대상 독자가 통상 아는
  약어). frontmatter `tags` 와 주제 범위로 판단
- §RULE-EXTERNAL-MENTION 과의 관계 명시 (외부 제품 링크 vs 본문 용어 풀이)

blog-coherence-review/SKILL.md (4곳):

- 전제 섹션에 §RULE-TERM-INTRODUCTION, §META-TITLE 참조 추가
- "검사 흐름" 박스: Step 3 "E1~E4 동시 평가" → "E1~E5 동시 평가"
- Step 3 본문 도입: "4개 항목" → "5개 항목"
- E4 다음에 E5 — 용어·개념 도입 검사 항목 신설 (검사 방법, 판정 기준, 예시,
  False Positive 주의사항)
- Step 6 리포트 "검사 항목" 리스트에 E5 추가

blog-writer/SKILL.md (3곳):

- 전제 섹션에 §RULE-TERM-INTRODUCTION 참조 추가 (§RULE-EXTERNAL-MENTION 다음)
- Step 4 작성 규칙에 §RULE-TERM-INTRODUCTION 한 줄 가이드 추가
- Step 4-뒤 미루는 항목 리스트에 "약어·기술 용어 첫 등장 풀이" 추가
- Step 8 자가 체크리스트에 8-13 신설 (약어·기술 용어 도입 검사)

**이유**:

`content/posts/service-worker-network-proxy.mdx` 작성 중에 사용자가 두 곳에서
이해 안 됨을 지적:

- "이 한 줄이 PWA 가 어디까지 책임지는지를 결정해요" 에서 PWA 가 본문에 한
  번도 풀이되지 않음
- 헤딩 "## install 과 activate 사이의 기다림" 에서 install / activate 가
  무엇인지 사전 설명 없음

표면 규칙은 통과했지만 "독자가 모르는 용어를 갑자기 던지지 않는가" 검사 항목이
없었음. 같은 종류의 문제를 다시 새지 않게 하기 위해 SHARED.md 에 새 §RULE
추가 + coherence-review 에 E5 항목 + writer 자가 체크에 8-13 추가.

**수정 유형**: 신규 규칙 섹션 추가 + 두 SKILL.md 에 검사 항목 / 작성 가이드
추가. 1회 확인.

**영향 범위**:

- blog-writer: 본문 작성 시 약어/이벤트 이름 첫 등장 풀이 의무 (강화)
- blog-coherence-review: E5 항목 추가로 검사 범위 확장. 자동 수정 없음, 사용자
  확인 카테고리
- blog-validator / blog-expression-review: 영향 없음 (해당 영역 아님)
- blog-write 오케스트레이터: 직접 영향 없음
- blog-draft-review: 영향 없음 (기획안 검토)
- 기존 글: 일부 글에 LCP / SSR / SSG / ISR / PWA 같은 약어가 풀이 없이 등장.
  단, 새 규칙은 자동 수정 안 함이라 CI 막히지 않음. 다음 글부터 적용 + 기존
  글은 필요 시 `/blog-revise` 로 다듬기

**백업**:

- `.backups/SHARED-20260430-164926.md`
- `.backups/blog-coherence-review-SKILL-20260430-164926.md`
- `.backups/blog-writer-SKILL-20260430-164926.md`

**재검증 결과**:

기존 글 영향이 자동 수정 아니라 강제 재검증 안 함. 사용자가 필요 시 단독
호출 (`/blog-coherence-review <파일>`) 로 새 E5 항목 적용 가능.

---

## 2026-04-30 16:37

### FlowDiagram MDX 컴포넌트 도입에 따른 스킬 패밀리 업데이트

**변경**:

SHARED.md (6곳 + 새 섹션 1개):

- §RULE-EMDASH 적용 범위에 FlowDiagram caption / nodes / edges 추가
- §RULE-BOLD-WHERE 동작 안 함 리스트에 FlowDiagram prop 값 추가 (5번 신설, 기존 5/6 → 6/7 시프트)
- §RULE-BARE-LIST 대체 방법에 "정적 구조·분기·다층 → `<FlowDiagram>`" 추가, AnimatedStep 항목을 "시간 순서 단계" 로 구체화
- §MDX-COMPONENTS 컴포넌트 목록 JSX 블록에 FlowDiagram 예시 추가
- §MDX-FLOWDIAGRAM 신설 (§MDX-ANIMATEDSTEP 다음): 사용 시점, AnimatedStep 과의 분리 기준, 제약 정의. props 상세는 `components/ui/CLAUDE.md` 참조 (SSOT)
- §MDX-DEMO-DENSITY 이론/개념형: "AnimatedStep이나 다이어그램" → "AnimatedStep (시간 순서 단계) 이나 FlowDiagram (정적 구조·분기)" 로 구체화

blog-writer/SKILL.md (4곳):

- Step 4 MDX 컴포넌트 활용에 "정적 구조·분기·다층 → `<FlowDiagram>` (§MDX-FLOWDIAGRAM 참조)" 추가, AnimatedStep 항목을 "시간 순서 단계" 로 구체화
- Step 4-뒤 미니 체크 #2 (JSX prop \*\* 검사) 컴포넌트 리스트에 FlowDiagram 추가
- Step 8-1 em-dash 적용 범위에 "FlowDiagram caption / nodes title·description / edges label" 추가
- Step 8-3 \*\* JSX prop 체크 자리에 FlowDiagram 항목 추가

blog-validator/SKILL.md (2곳):

- §MDX-JSX-BALANCE 체크 항목에 `<FlowDiagram ... />` self-closing 추가
- em-dash 보고 형식의 JSX prop 예시에 FlowDiagram 추가

**이유**: `components/ui/flow-diagram.tsx` 컴포넌트가 새로 추가되어 MDX 에서
import 없이 `<FlowDiagram />` 사용 가능. blog-writer 가 글 작성 중 적절한
자리(다층 구조, 분기, 정적 흐름)에 FlowDiagram 을 쓸 수 있도록 가이드를
주고, validator 가 false positive 없이 정상 컴포넌트로 인지하게 갱신.
AnimatedStep (시간 순서) 과의 역할 분리도 명시.

**수정 유형**: 새 컴포넌트 도입에 따른 다중 파일 업데이트 (기존 섹션 단어
추가 + 새 §MDX-FLOWDIAGRAM 섹션 1개 신설)

**SSOT 유지**: FlowDiagram 의 props 타입·좌표 가이드 등 상세는
`components/ui/CLAUDE.md` 가 SSOT. SHARED.md 의 §MDX-FLOWDIAGRAM 은 사용 시점과
AnimatedStep 과의 구분만 다루고 components/ui/CLAUDE.md 를 참조.

**영향 범위**:

- blog-write (오케스트레이터): 자동 반영, 수정 불필요
- blog-research, blog-draft-review, blog-expression-review, blog-coherence-review,
  blog-revise, blog-banner: FlowDiagram 직접 처리 안 하므로 영향 없음
- 기존 글: 4건이 이미 FlowDiagram 사용 (cdn-speed-and-caching,
  stale-while-revalidate-two-layers, service-worker-network-proxy 직접 추가됨).
  새 규칙은 이 글들과 충돌 없음 (수정 자체가 위 글들의 패턴을 표준화한 것)

**백업**:

- `.backups/SHARED-20260430-163706.md`
- `.backups/blog-writer-SKILL-20260430-163706.md`
- `.backups/blog-validator-SKILL-20260430-163706.md`

**재검증 결과**: 기존 글 영향 없음 (재검증 불필요)

---

## 2026-04-25 23:21

### blog-write GATE 1 피드백 자동 로그 (`content/tmp/draft-feedback.md`)

**변경**: GATE 1 응답 (C/D/E) 직후 사용자 자유 텍스트 + 기획안 메타를
`content/tmp/draft-feedback.md` 에 append 하는 메커니즘 추가. Phase 0 시작 시
누적 로그를 읽어 `complexity` 태그 3건 이상이면 알림.

- `blog-write/SKILL.md`:
  - Phase 0: 누적 GATE 1 피드백 로그 확인 블록 추가 (`FEEDBACK_COUNT`,
    `COMPLEXITY_COUNT` 집계 → 임계치 알림)
  - 새 Step GATE-1-LOG 추가 (Phase 3 GATE 1 응답 처리 직후, C/D/E 모두 기록)
  - GATE 1 응답 분기 (C/D/E) 에 "**자동 로그 기록**: Step GATE-1-LOG" 표기
  - 제약 섹션: `writer-failures.md` 와 `draft-feedback.md` append 원칙 명시
- `AGENTS.md`: 빠른 참조 표에 "GATE 1 피드백 로그 확인 |
  `cat content/tmp/draft-feedback.md`" 한 줄 추가

**이유**: 사용자가 GATE 1 에서 "기획안이 복잡하다" 류 피드백을 반복하는 패턴을
감지해 `blog-rule-editor` 가 D2 (복잡도 판단) 또는 Phase 3 가이드 개선으로
라우팅할 수 있도록 데이터 축적. `writer-failures.md` 와 동일한 학습 루프 구조.

**기록 원칙**: 분류·해석 안 함, 자유 텍스트 원문 그대로 저장, 키워드 태깅은
검색 보조용 (자동 분류 X), A/B 응답은 기록 안 함, E (취소) 는 사유 패턴 분석을
위해 기록.

**수정 유형**: 기능 추가 (학습 루프, 사용자 인지 부담 변화 없음)

**영향 범위**:

- 사용자: 변경 없음 (백그라운드 로그)
- writer / 리뷰어 / revise: 변경 없음
- `content/tmp/` gitignored 유지

**후속**: 누적된 후 `/blog-rule-editor draft-feedback 분석해줘` 시나리오 추가
검토 가능.

---

## 2026-04-25 14:12

### SHARED.md §RULE-LINK-PATH 검출 전략 · blog-validator 4-3-a 접두사 필터

**변경**: negative lookahead `(?!...)` 패턴을 pipe 조합으로 교체

**이유**: `grep -E` (ERE)는 `(?!...)` (PCRE 전용)를 지원하지 않아 1번 패턴(접두사
위반 검출)이 실제로 동작하지 않는 버그. 표준 ERE pipe 조합으로 교체해 macOS/Linux
어디서나 동작하도록 수정.

**수정 파일**:

- `SHARED.md` L507: 패턴 설명을 pipe 조합 방식으로 변경
- `blog-validator/SKILL.md` L588: `grep -nE ... | grep -vE ...` pipe 조합으로 교체

**수정 유형**: 버그 수정 (검출 로직)

**영향 범위**:

- blog-writer: §RULE-LINK-PATH 참조만, grep 패턴 직접 미사용 (수정 불필요)
- 기존 글 영향: 없음 (검출 로직 수정, 규칙 자체 변경 아님)

**백업**: `.backups/SHARED-20260425-141212.md`, `.backups/blog-validator-SKILL-20260425-141212.md`

---

## 2026-04-25 13:30

### blog-write Phase 4.5 (신규 GATE 2) · blog-writer 입력 계약 · blog-draft-review D3 가제 모드

**변경**: 제목·설명을 본문 작성 후로 이동. 사용자가 GATE 1 에서 본문 없는 상태로 제목 후보를 판단해야 하는 부담 제거.

새 흐름:

```
Phase 3 (기획안)
  Step 3-2 (변경): "가제(working title) 1개" 만 (품질 바 낮춤)
  Step 3-7 (변경): 기획안 포맷의 "제목 후보 1/2/3" → "가제" + 안내문
Phase 3.5 (draft-review): D3 가제 모드 (표면 금지만 체크)
GATE 1: 기획안 + 가제 검토 (가벼움)
Phase 4 (writer): 가제로 frontmatter 작성, 본문 작성
Phase 4.5 (NEW): 제목/설명 확정 (GATE 2)
  Step 4.5-1: 본문 통독
  Step 4.5-2: 제목 후보 3개 자동 생성 (§META-TITLE 적용)
  Step 4.5-3: 설명 후보 3개 자동 생성 (§META-DESCRIPTION 적용)
  Step 4.5-4: AskUserQuestion (제목 선택)
  Step 4.5-5: AskUserQuestion (설명 선택)
  Step 4.5-6: frontmatter Edit
  Step 4.5-7: slug 변경 검토 (선택, 기본 유지)
Phase 5+ (validator/review): 그대로
```

- `blog-write/SKILL.md`:
  - Step 3-2: "후보 2~3개" → "가제 1개" 로 단순화
  - Step 3-7 기획안 포맷: "## 제목 후보 1/2/3" → "## 가제 (working title)" + 안내문
  - 새 Phase 4.5 추가 (Phase 4 성공 후 Phase 5 진입 전)
  - Phase 4 성공 시 진입점 변경: "Phase 5 진입" → "Phase 4.5 진입"
  - 시리즈 모드: 시리즈 제목은 가제 그대로 유지, 편 제목만 본문 기반 갱신
- `blog-writer/SKILL.md` Step 1:
  - 오케스트레이터 경유 시 입력 `title` 이 가제일 수 있음 명시
  - 가제 모드에서는 표면 금지 (콜론·em-dash·`**`) 만 지키고, §META-TITLE 의 호기심·군더더기 등 품질은 Phase 4.5 책임
  - 단독 실행 시는 기존대로 §META-TITLE 전체 기준 적용
- `blog-draft-review/SKILL.md` D3:
  - 제목/설명 품질 검사를 가제 모드로 변경
  - 검사: 가제 존재 + 표면 금지 (콜론·em-dash·`**`) + 임시 설명 존재 (가벼움)
  - 호기심 유발·군더더기·약어 풀어쓰기 등은 Phase 4.5 위임

**이유**: 사용자 페인 포인트 — "주제, 설명에 대해서 내가 다시 수정하는 경우가 많은데" / "글이랑 설명에 대한게 어렵게 보여서 수정하는 경우가 많았자나". 본문 없이 제목·설명을 결정하는 게 어려워서 GATE 1 에서 자주 수정. 본문이 있어야 호기심 유발 포인트 / 막히는 지점이 명확해지므로, 본문 작성 후 본문 기반으로 후보 생성하는 게 자연스러움.

**수정 유형**: blog-write 파이프라인 구조 변경 (큰 변경 — 새 Phase + 새 GATE)

**영향 범위**:

- 사용자 인지 부담: 1회 무거운 GATE 1 → 2회 가벼운 GATE (가제 + 제목/설명 선택)
- writer: 가제 모드 입력 받아도 정상 동작 (frontmatter 표면 금지만 지키면 됨)
- draft-review: D3 가벼워짐 (Phase 4.5 가 무거운 검사 담당)
- validator: 변경 없음 (Phase 4.5 후에 호출되니 최종 제목 검사 그대로)
- expression-review/coherence-review: 변경 없음
- blog-revise: 변경 없음 (Phase 4 wrapper 형태로만 blog-write 호출)
- 기존 글: 영향 없음 (이미 작성된 글의 제목·설명 그대로)

**slug 처리**: 기본은 가제 기반 slug 유지. 가제와 최종 제목이 크게 달라진 경우만 사용자에게 확인 (Step 4.5-7). 묻지 않고 넘어가는 게 디폴트 (한 번 더 물으면 짜증 — Rail 5 회피 원칙).

**시리즈 처리**: 시리즈 제목 (`series` 필드) 은 Phase 3 가제 그대로 유지 (시리즈 통일성 우선). 편 제목 (`title`) 만 각 편 본문 기반으로 후보 3개 → GATE 2 진행.

**백업**: `.backups/blog-write-SKILL-20260425-125901.md` (요청 1 백업과 동일 — 추가 백업 생략, 같은 세션 내 변경)

**재검증 결과**: 새 글 작성 시 통합 테스트 필요 — 사용자가 다음 `/blog-write` 호출 시 새 흐름 검증 권장.

---

## 2026-04-25 13:13

### SHARED.md 신규 §META-FEEDBACK-HANDOFF · blog-validator · blog-expression-review · blog-coherence-review · AGENTS.md

**변경**: validator / expression-review / coherence-review 가 메인 작업 종료 후 사용자 메시지에서 **메타 피드백** (규칙·스킬 자체에 대한 변경 요청) 을 자동 감지해 `blog-rule-editor` 로 라우팅하는 핸드오프 메커니즘 추가.

- `SHARED.md`: 신규 섹션 §META-FEEDBACK-HANDOFF 추가 (감지 패턴, 핸드오프 흐름, 적용 범위, 안전 장치 정의)
- `blog-validator/SKILL.md`: 새 Phase 5 추가 (검증 후 메타 피드백 핸드오프, dry_run 무관)
- `blog-expression-review/SKILL.md`: 새 Phase X 추가 (제약 섹션 직전)
- `blog-coherence-review/SKILL.md`: 새 Phase X 추가 (제약 섹션 직전)
- `AGENTS.md`: 참조 관계 표 업데이트 (3개 reviewer 의 §META-FEEDBACK-HANDOFF 참조 추가)

핸드오프 흐름:

```
스킬 메인 작업 종료
  → 실행 중 사용자 메시지 스캔 (감지 패턴 기준)
  → 발견 시 한 문장씩 요약
  → AskUserQuestion: "blog-rule-editor 로 넘길까요?"
  → 승인 시 Skill(skill="blog-rule-editor", args="[META-FEEDBACK from <스킬>] ...")
  → blog-rule-editor 가 자체 Rails 로 처리
발견 없으면 조용히 skip
```

**이유**: 사용자 요청 — "각 스킬 실행이 끝났을 때, 메타 작업 (스킬·규칙 자체 변경) 의견을 자동으로 적용". 기존엔 매번 `/blog-rule-editor` 수동 호출 필요. 자동 라우팅으로 마찰 제거. 단, blog-rule-editor 의 Rail 1 (사용자 승인 없는 수정 금지) 은 보존 — "자동" 의 범위는 라우팅까지만.

**수정 유형**: 신규 SHARED.md 섹션 추가 + 3개 SKILL.md final step 추가 + AGENTS.md 표 업데이트

**영향 범위**:

- 패턴 감지 false positive 가능 → AskUserQuestion 1회 확인으로 완화
- 메타 피드백 없는 일반 실행 시 동작 변경 없음 (조용히 skip)
- blog-research / blog-writer / blog-rule-editor 자체에는 미적용 (의도적)
- blog-revise 는 향후 확장 가능 (현재는 미적용)

**백업**: `.backups/SHARED-20260425-131252.md`, `.backups/blog-validator-SKILL-20260425-131252.md`, `.backups/blog-expression-review-SKILL-20260425-131252-r2.md`, `.backups/blog-coherence-review-SKILL-20260425-131252-r2.md`, `.backups/AGENTS-20260425-131252.md`

**재검증 결과**: 기존 글 영향 없음. validator/reviewer 의 메인 동작 변경 없음 (Phase 추가만).

---

## 2026-04-25 12:59

### blog-write · blog-revise · blog-coherence-review · blog-expression-review SKILL.md

**변경**: AskUserQuestion 코드 블록 (`questions=[{...}]` JSON wrapper) 을 한 줄 헤더 + bullet 형식으로 압축. boilerplate 도입문 ("그 다음 **반드시 `AskUserQuestion` 툴 호출** (§UI-USER-CHOICE 준수):") 과 SHARED.md 와 중복되는 "**절대 금지**: 번호 리스트..." 경고문 제거.

- `blog-write/SKILL.md`: 13개 코드블록 변환 + 4개 boilerplate 제거
- `blog-revise/SKILL.md`: 8개 코드블록 변환 + 3개 boilerplate 제거
- `blog-coherence-review/SKILL.md`: 2개 코드블록 변환
- `blog-expression-review/SKILL.md`: 1개 코드블록 변환
- `blog-banner/SKILL.md`: 변경 없음 (이미 압축 형식)

변환 패턴:

```
# 변경 전
AskUserQuestion(
  questions=[{
    "question": "...",
    "options": ["A", "B", "C"]
  }]
)

# 변경 후
AskUserQuestion("..."):
- A
- B
- C
```

**이유**: SKILL.md 파일들이 너무 길어져서 SSOT 원칙 (SHARED.md §UI-USER-CHOICE 가 단일 정의처) 위반 없이 길이 절감 필요. 옵션 wording 은 100% 보존, JSON wrapper + 중복 경고문만 제거.

**수정 유형**: 4개 SKILL.md 일괄 boilerplate 압축 (옵션 B — 적극적 압축)

**영향 범위**:

- SHARED.md 자체는 변경 없음 (SSOT 보존)
- §UI-USER-CHOICE 의 의미 변경 없음 (writer 가 여전히 AskUserQuestion 호출하도록 SHARED.md 가 강제)
- 옵션 wording 100% 보존 → writer 출력 결과 동일
- blog-rule-editor/SKILL.md 는 Rail 5 (자기 자신 수정 금지) 로 별도 처리 필요 (8개 코드블록 잔존)

**Line count 변화**:

| 파일                   | 변경 전  | 변경 후  | 절감     |
| ---------------------- | -------- | -------- | -------- |
| blog-write             | 1323     | 1235     | -88      |
| blog-revise            | 885      | 831      | -54      |
| blog-coherence-review  | 604      | 592      | -12      |
| blog-expression-review | 664      | 658      | -6       |
| **합계**               | **3476** | **3316** | **-160** |

**백업**: `.backups/blog-{write,revise,coherence-review,expression-review,banner}-SKILL-20260425-125901.md`

**재검증 결과**: 기존 글 영향 없음 (SKILL.md 만 수정, content/posts/\* 변경 없음). validator/writer 동작 변경 없음.

---

## 2026-04-16 15:36

### SHARED.md §RULE-CITE · blog-validator Phase 4-2 · blog-writer Step 6

**변경**: `<Cite />` 가 JSX 컴포넌트 직후 단독 라인에 오는 패턴을 확정 위반으로
명시하고, validator 검출 로직 + writer 가이드를 보강.

- `SHARED.md` §RULE-CITE: "본문 단락의 문장 끝에 인라인" 명시 + "JSX 컴포넌트
  직후 단독 라인 금지" 조항 추가 + 올바른/잘못된 예시 mdx 블록 추가.
- `blog-validator` Phase 4-2: Callout/AnimatedStep/CodePlayground 닫힘 → 빈 줄
  → 단독 `<Cite />` 패턴을 awk 로 검출, 사용자 확인 카테고리로 분류 (자동 수정
  불가 — 어느 본문 단락 끝에 옮길지 의미 판단 필요).
- `blog-writer` Step 6: `<Cite>` 사용 가이드에 "JSX 컴포넌트 직후 단독 라인에
  두지 말 것" 항목 + ❌/✅ 예시 추가.

**이유**: writer 가 `content/posts/rendering-strategies-map.mdx` 작성 시 4개 섹션
(CSR/SSR/SSG/Hydration) 에서 모두 Callout 닫고 빈 줄 + `<Cite />` 단독 라인
패턴을 만듦. 렌더링 시 ⓘ 아이콘이 본문 텍스트 없이 외롭게 떠서 어색함. 기존
§RULE-CITE 의 "텍스트 바로 뒤 공백 없이" 표현이 모호해서 writer 가 "Callout
인용문 = 텍스트" 로 해석할 여지가 있었음. 본문 단락의 문장과 JSX 블록을 명확히
구분.

**수정 유형**: 기존 규칙 강화 (예시 mdx 블록 추가) + validator 검출 1건 추가 +
writer 가이드 1건 추가.

**영향 범위**:

- `SHARED.md` 참조하는 다른 skill 들은 자동 반영 (blog-validator, blog-writer 가
  각자 영역에서 새 규칙 인지).
- 기존 글 영향: `content/posts/rendering-strategies-map.mdx` L90, L157 두 곳
  (이번 세션에서 사용자가 글 수정 진행 중). 다른 글 7건은 정상 패턴 (텍스트 끝
  인라인) 사용 중이라 영향 없음.

**백업**: `.backups/SHARED-20260416-153614.md`,
`.backups/blog-validator-SKILL-20260416-153614.md`,
`.backups/blog-writer-SKILL-20260416-153614.md`

**재검증 결과**: rendering-strategies-map.mdx 의 단독 라인 Cite 2건 (L90, L157)
은 사용자가 직접 본문 단락 끝으로 이동 예정. 다른 글은 재검증 불필요 (기존 패턴
이미 정상).

---

## 2026-04-15 20:17

### SHARED.md §FRONTMATTER

**변경**: `tags` 배열에 약어 판단 기준 추가. 널리 통용되는 약어가 있으면
약어형(예: `"RSC"`, `"SSR"`)을 사용하도록 규정.

**이유**: 기존 98ba5aa 커밋에서 §META-TITLE·§META-DESCRIPTION 에 약어 판단 기준이
추가됐지만 `tags` 는 빠져 있었음. 태그는 식별 라벨이라 짧고 일관된 형태가
검색·중복 방지에 유리하다는 원칙을 명시. §META-TITLE 에서 "풀어쓰기 권장"으로
분류된 성능 지표 약어(LCP/CLS 등)도 tags 에서는 검색 키워드성이 우선이라 약어형 허용.

**수정 유형**: 기존 섹션에 불릿 추가 (§FRONTMATTER 필수 조건)

**영향 범위**:

- blog-writer: frontmatter 스키마 참조로 자동 반영
- blog-validator: §FRONTMATTER 참조로 자동 반영
- 기존 글 7건: "React Server Components" 태그를 "RSC" 로 이미 수정함
  - use-client-boundary-and-overuse.mdx
  - compound-pattern-rsc/{module-graph, three-costs, tradeoff-choice}.mdx
  - suspense-streaming-ssr/{suspense-boundary-where, streaming-html-chunks, loading-ux-web-vitals}.mdx

**백업**: `.backups/SHARED-20260415-201713.md`

---

## 2026-04-14 16:28

### SHARED.md §RULE-CITE · blog-writer Step 6 · Step 8

**변경**: Cite 권고 수준 상향. "선택 사항" → "References items 각 항목에
본문 Cite를 하나 이상 붙이는 것을 기본으로 한다 (SHOULD)".

- `SHARED.md` §RULE-CITE: "선택 사항. 안 써도 되고…" 항목을 삭제하고 "기본 원칙
  (권고, SHOULD)" 항목으로 치환. 자연스러운 문장 흐름을 깨뜨리면 생략 가능 단서 포함.
- `blog-writer/SKILL.md` Step 6 `<Cite>` 사용: "선택 사항, 핵심 주장 한두 군데에만"
  → "References items 각 항목마다 본문 대응 Cite 하나 이상 (권고)".
- `blog-writer/SKILL.md` Step 8 미루는 항목: "References items 각 항목에 본문 Cite가
  하나 이상 붙었는지 (§RULE-CITE, 권고)" 체크 추가.

**이유**: 최근 두 글(use-client-boundary-and-overuse, virtual-list-dom-cost)에서
writer 가 하단 References 블록만 만들고 본문 Cite 를 0개 배치. 기존 §RULE-CITE 는
"선택 사항" 으로 쓰여 있어 writer 가 합법적으로 생략 가능. 필수까지는 아니고,
자연스러우면 붙이도록 SHOULD 수준으로 끌어올림.

**수정 유형**: 기존 규칙 강화 (완전 재작성 아님, 권고 조항 추가)

**영향 범위**:

- blog-writer: 명시적으로 Step 6, Step 8 수정 반영
- blog-validator / blog-expression-review: 손대지 않음 (강제 아니므로 검증 규칙 추가 없음)
- 기존 글: 사용자가 수동으로 use-client-boundary-and-overuse, virtual-list-dom-cost
  두 글에 Cite 인라인을 이미 추가함 (blog-rule-editor 호출 전 처리). 나머지
  기존 글은 기 작성분 기준이므로 소급 적용 대상 아님.

**백업**:

- `.backups/SHARED-20260414-162819.md`
- `.backups/blog-writer-SKILL-20260414-162819.md`

**재검증 결과**: 해당 없음 (validator 규칙 변경 아님).

---

## 2026-04-14 16:17

### SHARED.md §RULE-LINK-PATH · blog-validator 4-3 · blog-writer Step 5

**변경**: 내부 링크 URL 형식에서 `/posts/<seriesSlug>/<partSlug>` 제거. slug 는
**파일명 단일 세그먼트**임을 명시.

- `SHARED.md` §RULE-LINK-PATH: "시리즈 편: `/posts/<partSlug>`" 로 수정. 금지 패턴에
  `/posts/<folder>/<slug>` 추가. 검출 전략 5번 `\]\(/posts/[^)/]+/[^)]+\)` 추가.
- `blog-validator/SKILL.md` 4-3-a: 폴더 경로 URL 검출 grep 추가, 자동 수정
  (마지막 세그먼트만 유지) 추가. 4-3-b 선행 조건 명시.
- `blog-writer/SKILL.md` Step 5 원칙: "시리즈 편 간 링크도 파일명 slug 만" 명시.

**이유**: compound-pattern-rsc 시리즈 3편 간 링크 5개 + use-client-boundary 1개가
전부 404. 원인은 velite.config.ts 의 slug 가 `parts[parts.length - 1]` 로 파일명만
추출하는데, SHARED.md L485 가 `/posts/<seriesSlug>/<partSlug>` 를 유효 URL 로
명시해 writer 가 폴더 경로 URL 을 생성. validator 의 실존 체크는 디스크 파일
경로(`content/posts/*/<slug>.mdx`)로만 매칭돼서 오탐 없이 통과됨.

**수정 유형**: 기존 규칙 수정 (버그 픽스)

**영향 범위**:

- blog-writer: SHARED.md 참조 + Step 5 원칙 명시 추가 (즉시 반영)
- blog-validator: 4-3-a 에 확정 에러 grep 추가, 4-3-b 선행 조건 추가 (즉시 반영)
- 기존 글: 6건 수정 완료 (`compound-pattern-three-costs`, `compound-pattern-module-graph`,
  `compound-pattern-tradeoff-choice`, `use-client-boundary-and-overuse`)

**백업**:

- `.backups/SHARED-20260414-161734.md`
- `.backups/blog-validator-SKILL-20260414-161734.md`
- `.backups/blog-writer-SKILL-20260414-161734.md`

**재검증 결과**: 링크 수정 직접 완료. 추가 validator 호출 불필요.

---

## 2026-04-14 17:15

### AGENTS.md · README.md (blog-banner 반영)

**변경**: 이전 세션에서 추가한 `blog-banner` 스킬을 프로젝트 문서에 반영.

- `AGENTS.md`: 빠른 참조 표에 `/blog-banner` 행 추가, 스킬 개수 8 → 9, 호출 관계 다이어그램에 blog-banner 독립 실행 블록 추가.
- `README.md`: 스킬 개수 8 → 9, 핵심 원칙 목록에 "배너 자동화" 항목 추가.

**수정 유형**: 문서 업데이트 (스코프 외 파일 수정, 일회성 예외)

**영향 범위**:

- 스킬 동작 영향 없음 (문서만 수정)
- 기존 글 영향 없음 → 재검증 불필요

**백업**:

- `.backups/AGENTS-20260414-151537.md`
- `.backups/README-20260414-151537.md`

**참고**: blog-rule-editor의 "관리 대상"에는 프로젝트 루트 문서가 포함돼 있지 않으나, 사용자 승인 후 일회성 예외로 처리. 장기적으로 관리 대상 확장 검토가 필요함.

---

## 2026-04-14 16:30

### blog-banner (신규 skill)

**변경**: 포스트 자동 배너 모티프를 추천하고, 부적합 시 새 모티프 SVG를 자동 생성하는 skill 추가. `lib/banner/spec.ts` 매핑/팔레트와 `public/banners/motifs/` SVG 라이브러리를 관리하며, frontmatter `banner` 필드로 수동 override도 지원.

**역할 경계**:

- blog-write 파이프라인에는 자동 연결하지 않음 (독립 실행만: `/blog-banner <파일>`)
- MDX 본문 수정 금지, frontmatter의 `banner` 한 줄 추가만 허용
- 한 실행에 새 모티프 1개 생성 제한

**수정 유형**: 신규 skill 파일 생성

**파일**: `.claude/skills/blog-banner/SKILL.md`

**영향 범위**:

- 기존 blog-\* skill: 없음 (독립 실행)
- 프로젝트 코드: skill 실행 시 `lib/banner/spec.ts`, `public/banners/motifs/*.svg`, `velite.config.ts`, MDX frontmatter 편집 가능

---

## 2026-04-14 14:57

### SHARED.md §RULE-EXTERNAL-MENTION (신규 섹션)

**변경**: 본문에서 공식 라이브러리·도구·공식 문서를 처음 언급할 때 해당 공식 사이트로 인라인 마크다운 링크를 달도록 하는 규칙 추가. §RULE-LINK-PATH 뒤, §RULE-REFERENCES 앞에 배치.

**함께 수정한 파일**:

- `blog-writer/SKILL.md` — 참조 섹션 목록에 §RULE-EXTERNAL-MENTION 등록

**이유**: compound-pattern-rsc 시리즈 작성 시 Chakra UI v3, Radix, Base UI, Ark UI, seed-design, shadcn/ui 같은 라이브러리 이름에 링크가 빠져 있어 사용자가 후속 요청으로 보강함. 앞으로 같은 누락이 재발하지 않도록 규칙화. References(자료 출처)와의 차이도 명시.

**수정 유형**: 신규 섹션 추가 + 참조 목록 등록

**영향 범위**:

- blog-writer: 참조 목록에 추가됨 (작성 단계에서 내재화)
- blog-validator: 자동 검증 대상 아님 (의미 판단 필요) → 수정 없음
- 기존 글: 라이브러리/도구 첫 언급에 링크 누락이 있을 수 있으나, 일괄 재검증 대상 아님 (앞으로 작성하는 글부터 적용)

**백업**: `.backups/SHARED-20260414-145756.md`, `.backups/blog-writer-SKILL-20260414-145756.md`

---

## 2026-04-14 00:47

### SHARED.md §MDX-ANIMATEDSTEP (신규 섹션)

**변경**: AnimatedStep title 번호 금지 규칙을 JSX 주석 한 줄에서 독립 소절(§MDX-ANIMATEDSTEP)로 승격. 금지 패턴, 검출 전략, 자동 수정 방법 명시.

**함께 수정한 파일**:

- `blog-writer/SKILL.md` — Step 4 미니체크에 5번째 항목(AnimatedStep title 번호) 추가, Read 목록에 §MDX-ANIMATEDSTEP 추가
- `blog-validator/SKILL.md` — Phase 2에 2-5 검출 단계(AnimatedStep title 번호) 추가, Read 목록에 §MDX-ANIMATEDSTEP 추가

**이유**: 기존 규칙이 코드블록 안 JSX 주석 한 줄이라 writer/validator가 인식하지 못하고 반복 위반 발생. §RULE 수준 소절로 올려서 검출-자동수정 파이프라인에 편입.

**수정 유형**: 규칙 강화 (새 소절 추가 + 검증 파이프라인 연결)

**영향 범위**:

- blog-writer: Step 4 미니체크 참조 (즉시 방어)
- blog-validator: Phase 2 검출 (사후 확정 에러 자동 수정)
- 기존 글: 3건 위반 발견 (npm-vs-npx, white-space-property-mastery, team-design-system-guide)

**백업**:

- `.backups/SHARED-20260414-004751.md`
- `.backups/blog-writer-SKILL-20260414-004751.md`
- `.backups/blog-validator-SKILL-20260414-004751.md`

---

## 2026-04-15 17:14

### SHARED.md §META-TITLE, §META-DESCRIPTION + blog-draft-review D3

**변경**: 제목/설명에서 약어/전문용어 전면 배치 판단 기준 추가. blog-draft-review D3 체크리스트에 해당 항목 연결.

**이유**: 사용자 피드백에서 "LCP와 CLS가 나빠지는 두 범인" 같은 제목이 대중 독자에게 어렵게 느껴진다는 지적. 동시에 RSC, SSR처럼 대상 독자가 통상 아는 약어는 허용되어야 한다는 방향성. 따라서 "일괄 금지"가 아니라 "대상 독자 기준 판단"으로 규칙을 정리.

**수정 유형**: 기존 규칙에 판단 기준 불릿 추가 + draft-review 체크리스트 항목 추가

**핵심 원칙**:

- 기본: 현상·결과·체감을 한국어로 풀어 제시
- 허용 1: 글의 핵심 기술 식별자 (`Object.assign`, `useMemo` 등)
- 허용 2: 대상 독자가 통상 아는 약어 (대중: `npm`/`CSS`, 생태계: `RSC`/`SSR`)
- 풀어 쓰기 권장: 성능 지표 약어 (`LCP`/`CLS`/`TTI`) — 대중 독자 기준. 지표 정의 글은 예외
- 판단 기준: 대상 독자가 제목만 보고 주제를 감 잡을 수 있는가

**영향 범위**:

- blog-writer: §META-TITLE/DESCRIPTION 참조 (자동 반영)
- blog-write: 제목 후보 재생성 로직 (자동 반영)
- blog-draft-review: D3 체크리스트에 직접 명시 추가
- 기존 글: `content/posts/compound-pattern-rsc/compound-pattern-module-graph.mdx` L2 "Object.assign compound가 RSC에서 안 보이는 이유" — 핵심 식별자(Object.assign compound) 전면 + RSC는 맥락 보조 + 생태계 약어 허용 조항 — 통과

**백업**:

- `.backups/SHARED-20260415-171402.md`
- `.backups/blog-draft-review-SKILL-20260415-171402.md`

**재검증**: 규칙 강화 방향이지만 기존 글 영향 없음 (허용 조항 충분). 재검증 생략.

---

## 2026-04-29 17:21

### blog-research/SKILL.md — Step 6 (URL 도달성 최종 확인) 추가

**변경**: Step 5 (종료 조건) 와 핵심 포인트 추출 규칙 사이에 새 Step 6 추가.
출력 형식의 "## 요약" 에 도달성 검증 통계 한 줄, "## 수집 메모" 에 특이 케이스
가이드 한 줄 추가.

**이유**: zustand-jotai-top-down-bottom-up 글 작성 중 References href 두 개가
404 URL 로 저장된 사고. 도메인 (zustand.docs.pmnd.rs) 은 §DOMAIN-PRIORITY-1
화이트리스트에 있어서 validator Phase 4-1 통과. 그러나 경로 (`/learn/` prefix
누락) 는 잘못됨. context7 의 zustand_pmnd_rs 페이지 일부 redirect 루프로
sub-agent 가 본문을 받지 못한 채 메타에서 추정한 URL 이 그대로 결과에 포함됐음.

**수정 유형**: 새 Step 추가 (검증 강화) + 출력 형식 보강

**핵심 변경 의도**:

- context7 응답에서만 추출된 URL, 본문을 직접 받지 못한 URL 은 반환 직전 한 번 더
  WebFetch 로 200 OK 확인 의무화
- 4xx/5xx/redirect 루프 시 WebSearch 로 재탐색 1회 시도, 못 찾으면 결과에서 제외
- Step 1~4 에서 본문을 직접 받은 URL 은 자동 통과 (중복 호출 방지)
- WebFetch 한도 (6회) 소진 시 도달성 미확인 URL 은 1순위로 포함 안 함
- 출력 메모에 "통과 P / 교체 Q / 제외 R / 미확인 S" 통계 명시

**영향 범위**:

- blog-write (오케스트레이터): blog-research 결과의 출력 형식만 사용하므로 별도
  수정 불필요. 도달성 미확인 URL 처리 정책은 현재 변경에서 "1순위 포함 안 함" 으로
  명시했으므로 오케스트레이터가 추가 처리 불필요
- blog-validator: 변경 없음 (의도 2 는 보류)
- SHARED.md: 변경 없음 (의도 3 은 보류)
- 기존 글: 영향 없음 (앞으로 작성될 글에만 적용)

**보류된 의도**:

- 의도 2 (blog-validator Phase 4-1 도달성 검사 추가) — 사용자 선택으로 이번 라운드
  제외. 의도 1 만으로 충분히 막힌다는 판단. 추후 필요 시 별도 라운드.
- 의도 3 (SHARED.md §RULE-REFERENCES 한 줄 명문화) — 의도 1 에서 검증 로직이
  실효 강제하므로 명문화는 보류. 추후 필요 시 별도 라운드.

**백업**: `.backups/blog-research-SKILL-20260429-172105.md` (500 라인)

**수정 후**: 531 라인 (31 라인 증가)

**재검증**: 다음 글 작성 시 자연스럽게 검증됨. 기존 글 영향 없음이라 별도 재검증 불필요.

**근거 메시지**: 사용자 원문 (zustand-jotai 글 작성 직후)

> "참조문서 잘못되었는데, 해당 부분 확인해줘, 레퍼런스 글 잘못되어있어.
> https://zustand.docs.pmnd.rs/guides/flux-inspired-practice
> https://zustand.docs.pmnd.rs/getting-started/comparison
> 여기 링크 없어, 기존 스킬이 문제일까"

---

## 2026-05-10 23:20

### SHARED.md, blog-writer, blog-draft-review, blog-expression-review, AGENTS.md

**변경**: 두 개의 새 규칙 추가 — `§RULE-NO-ESCAPE` (도망치는 마무리 금지) 와
`§RULE-PRESCRIPTION` (진단 후 처방 코드 의무).

**이유**: 진단·대안 나열·주의점 강조까지는 잘 쓰이는데, 독자가 바로 따라 할 수 있는
처방(코드·의사 코드·최소 예)이 빠지거나, 마무리에서 범위를 뒤늦게 회수하는 식의
흐름은 기존 스킬만으로는 잡히지 않았음.

- 패턴 A (처방 코드 부재): 여러 구현 대안을 글로만 비교하고 실행 가능한 스니펫이나
  의사 코드가 없음. 함정·난이도는 강조하는데 구체적 처방은 비어 있는 경우.
- 패턴 B (도망치는 마무리): 결론에서 “한 글에 다 안 담는다”처럼 범위를 뒤로 미루며
  끝냄. 스코프는 도입에서 밝히고, 이번 글에서 줄 것만 남기는 편이 나음.

**수정 유형**: 새 규칙 섹션 추가 (2개) + 관련 SKILL.md 참조 갱신 (3개 파일) +
AGENTS.md 표 1행 갱신.

**영향 범위**:

- `SHARED.md` — `§RULE-FORBIDDEN-PATTERNS` 의 `###` 자식으로 `§RULE-NO-ESCAPE`
  (line 412), `§RULE-RHYTHM` 다음 새 `##` 섹션 `§RULE-PRESCRIPTION` (line 453).
  두 규칙은 상호 참조 (PRESCRIPTION 섹션에 NO-ESCAPE 와의 관계 한 단락 포함).
- `.claude/skills/blog-writer/SKILL.md` — 전제 리스트에 `§RULE-PRESCRIPTION` 추가 +
  `§RULE-FORBIDDEN-PATTERNS` 부제에 "도망치는 마무리" 추가.
- `.claude/skills/blog-draft-review/SKILL.md` — 전제 리스트에 `§RULE-PRESCRIPTION`
  추가 (D2 보강용). "§RULE-\* 검사 대상 아님" 안내 문구도 표현 규칙 한정으로 미세 조정.
- `.claude/skills/blog-expression-review/SKILL.md` — 전제 리스트 부제 갱신, A 카테고리에
  A6 신규 항목 추가 (검사 방법, 예시, 자동 수정 불가, 사용자 확인 처리), dry_run
  결과 형식 예시에 A6 한 줄 추가.
- `AGENTS.md` — 참조 관계 표 `blog-draft-review` 행에 `§RULE-PRESCRIPTION` 추가.

**백업** (`.backups/`, timestamp `20260510-232018`):

- `SHARED-20260510-232018.md`
- `blog-writer-SKILL-20260510-232018.md`
- `blog-draft-review-SKILL-20260510-232018.md`
- `blog-expression-review-SKILL-20260510-232018.md`
- `AGENTS-20260510-232018.md`

**기존 글 영향**: 새 규칙은 앞으로 작성될 글에 적용. 기존 `content/posts/*.mdx` 들은
잠재적 위반 가능성 있음 — Phase 6 재검증 단계에서 확인 예정.

**재검증 결과**: (Phase 6 진행 후 업데이트)

---

## 2026-06-10 14:10

### SHARED.md §MDX-FLOWDIAGRAM

**변경**: "구조에 형태를 맞추기" 블록 신설. 표현하려는 실제 관계 구조를 먼저 보고
다이어그램 형태와 `edgeType` 을 맞추라는 원칙 추가.

- 요청·응답 왕복(RFC 프로토콜 흐름 등) → `h` 세로 허브 노드 + 반대편 세로 스택 +
  `edgeType="straight"`. 같은 두 노드 사이 양방향 화살표 직접 겹침은 실패 패턴으로 명시.
- 삼각형·대각선 토폴로지 → 기본 `smoothstep`.
- 세부 동작은 `components/ui/CLAUDE.md` 참조 (SSOT 유지).

**이유**: OAuth 글(oauth2-frontend-pkce) 작성 중 RFC 6749 Abstract Protocol Flow 를
그리며 발견. 양방향 화살표를 짧은 카드에 겹쳐 그려 두 번 실패했고, 세로 허브 + 직선
으로 풀렸다. 일반화해 집필 단계에서 막연히 노드를 흩뿌리지 않도록 가이드.

**수정 유형**: 새 규칙 블록 추가

**영향 범위**:

- blog-writer: Step 4 MDX 컴포넌트 활용이 `§MDX-FLOWDIAGRAM` 참조 (자동 반영)
- 컴포넌트 측: `components/ui/flow-diagram.tsx` 에 `h` prop, `edgeType` prop, 레인
  자동 분배 추가됨 (스킬 외부 변경). `components/ui/CLAUDE.md` 에 상세 문서화.
- 기존 글: 영향 없음 (집필 가이드)

**백업**: `.backups/SHARED-20260610-140950.md`

---

## 2026-06-10 14:25

### 신규 스킬: blog-flow-review

**변경**: FlowDiagram 시각 검수 스킬 신설 (`.claude/skills/blog-flow-review/SKILL.md`).

FlowDiagram 이 있는 글에 한해 실제 페이지를 렌더(Playwright)해 라이트/다크
스크린샷을 찍고, 그 이미지를 비전으로 검사해 화살표·라벨 겹침, 노드 과밀, 캔버스
밖 잘림, 선 모양 부적합(§MDX-FLOWDIAGRAM "구조에 형태를 맞추기" 위반)을 판정한다.
FlowDiagram 없으면 grep 가드로 즉시 skip(서버도 안 띄움).

**이유**: 다이어그램의 겹침·정렬 문제는 렌더된 픽셀 문제라 MDX 텍스트만으로는 못
잡는다. OAuth 글에서 RFC 도식을 그리며 실제로 두 번 실패했고, 사람 눈(스크린샷)이
있어야 잡혔다. 이를 자동화.

**수정 유형**: 새 skill 파일 생성

**구성**:

- 스킬: `blog-flow-review/SKILL.md` (Read/Bash/Edit/Grep/AskUserQuestion)
- 인프라(스킬 밖, 일반 파일): `scripts/shoot-flow.ts` — 실행 중 dev 서버(:4321)
  재사용, 없으면 임시 기동. `figure:has(.react-flow)` 별 light/dark 스크린샷을
  `content/tmp/flow-shots/` 에 저장. stdout 으로 경로(또는 NO_FLOWDIAGRAM) 출력.
- 판정 기준 SSOT: SHARED.md §MDX-FLOWDIAGRAM (복사 아님, Read 참조)

**SSOT 유지**: 판정 규칙은 §MDX-FLOWDIAGRAM 한 곳, 컴포넌트 동작은
`components/ui/CLAUDE.md` 한 곳. blog-flow-review 는 둘을 참조만.

**통합(예정, 별도 diff 확인)**:

- blog-write: coherence-review(5.6) 다음 조건부 Phase 로 연결 (FlowDiagram 있을 때만)
- blog-revise: 검증 사이클 끝에 조건부 연결
- AGENTS.md: 스킬 수·빠른 참조·호출/참조 관계 표 갱신

**백업**: 신규 파일이라 백업 없음

---

## 2026-06-10 14:40

### blog-flow-review 파이프라인 통합

**변경**: blog-flow-review 를 오케스트레이터에 조건부로 연결.

- `blog-write/SKILL.md`: Phase 5.6(coherence) 다음에 **Phase 5.7 flow-review** 추가.
  `grep "<FlowDiagram"` 가드로 있을 때만 실행, 없으면 skip. 수정안은 사용자 확인 후
  오케스트레이터가 해당 블록만 Edit, 1회 재실행으로 확인. 푸터 변경 이력에도 한 줄 추가.
- `blog-revise/SKILL.md`: 검증 사이클에 **Step P1-3.5 flow-review**(조건부) 추가.
  패턴 5(분석만)에서는 dry_run=true. P1-4 종합 문구를 "리뷰어들(... 조건부 flow-review)"
  로 갱신. P1 사이클을 재사용하는 패턴 2/3 에도 자동 전파.
- `AGENTS.md`: 빠른 참조에 flow-review 단독 행 추가, 스킬 수 12→13, 호출 관계
  (blog-write/blog-revise 트리)·참조 관계 표(§MDX-FLOWDIAGRAM, §UI-USER-CHOICE) 갱신,
  skill 인식 확인 목록을 13개 전체로 정정(기존 9개 목록이 revise/topic-suggest/banner
  누락 상태였음).

**수정 유형**: 기존 skill 통합 (오케스트레이터 2개 + AGENTS.md)

**SSOT 유지**: flow-review 는 판정 규칙을 §MDX-FLOWDIAGRAM 에서 Read 참조만. 통합
지점들은 호출 계약(files/mode/via/dry_run)만 전달.

**백업 주의**: 이 작업 라운드 동안 RTK 훅이 셸 파일 쓰기(cp/heredoc/리다이렉트)를
조용히 깨뜨려 일부 `.backups/` 자동 백업이 누락됨. 모든 실제 편집은 Edit/Write
툴(셸 우회)로 적용돼 정상. 편집 직전 버전은 git HEAD 로 롤백 가능
(`git show HEAD:<경로>`).

---
