---
name: blog-topic-suggest
description: |
  외국·국내 유명 테크 블로그를 영감 소스로 프론트엔드 글감 5~8개를 추천한다.
  기존 글과의 중복도, 1순위 자료 가능성, 트렌드/에버그린 라벨까지 점수로
  표시한다. 사용자가 후보를 고르면 직접 blog-write 로 이어붙이도록 안내한다.

  사용 트리거: "/blog-topic-suggest [영역]", "글감 추천해줘", "다음 글 뭐
  쓸까", "주제 추천".

  절대 하지 않는 것: 영감 출처를 References 로 끌어다 쓰기, 글 본문 작성,
  사용자 승인 없이 blog-write 자동 호출, WebFetch 결과 원문을 오케스트레이터
  컨텍스트로 반환.
tools:
  - WebFetch
  - WebSearch
  - Glob
  - Grep
  - Read
  - Write
  - Edit
  - Bash
  - Agent
  - mcp__plugin_context7_context7__resolve-library-id
---

# blog-topic-suggest

프론트엔드 글감을 외국·국내 유명 테크 블로그에서 영감 받아 5~8개 추천합니다.
**파일 시스템을 쓰기 목적으로 건드리지 않아요** (config/posts 인덱스 Read 만
예외).

**이 skill 은 SHARED.md `§SOURCE-PRIORITY`, `§DOMAIN-WHITELIST`,
`§UI-USER-CHOICE`, `§FRONTMATTER`, `§RULE-EXTERNAL-MENTION`,
`§TOPIC-SUGGEST-FLOW` 를 전제** 합니다. 시작 시 해당 섹션을 Read 로 주입.

config: `.claude/skills/blog-shared/config/topic-sources.md` (영감 소스
카탈로그, 별도 파일).

---

## 입력 계약

### 단독 실행 시

```
/blog-topic-suggest [영역] [--count 5-8] [--label trend|evergreen|mixed]
```

- `영역` (선택): 관심 주제 키워드. 예: "CSS", "React", "성능"
  - 생략 시: `content/posts/*.mdx` frontmatter 의 `tags` 빈도로 상위 3개
    영역 자동 추정 후 사용자에게 확인
- `--count` (선택): 추천 개수. 기본 6, 범위 5~8
- `--label` (선택): 라벨 필터. 기본 `mixed` (트렌드 + 에버그린 혼합)

### 오케스트레이터 호출 시 (향후 확장)

현재 버전에서는 단독 실행만. blog-write Phase 0 에서 호출하는 형태는 차후 추가.

---

## 사전 준비: config 로드

Phase 1 시작 전 두 개 config 를 Read.

```
Read .claude/skills/blog-shared/config/topic-sources.md
Read .claude/skills/blog-shared/config/domains.md
```

`topic-sources.md` 로드 실패 시:

```
⚠️ config/topic-sources.md 를 찾을 수 없어요. 추천 흐름을 진행할 수 없어
중단합니다. blog-rule-editor 로 카탈로그를 작성해주세요.
```

진행 거부. domains.md 는 blog-research 와 fallback 동일.

---

## Phase 1: 기존 글 인덱스 빌드 (오케스트레이터 컨텍스트, 크롤 전)

`content/posts/*.mdx` 의 frontmatter 만 읽어서 중복 비교용 인덱스를 만듭니다.

### Step 1-1: 파일 목록

```
Glob content/posts/*.mdx
```

서브디렉토리는 제외. 시리즈 글은 `content/posts/<series>/` 에 있지만 frontmatter
키가 다르고 비교 가치가 낮아 1차 버전은 단일 파일만.

### Step 1-2: frontmatter 추출

각 파일에 대해:

```
Read <파일> offset=1 limit=15
```

frontmatter 영역 (`---` ... `---`) 만 파싱. 본문은 읽지 않음 (토큰 절약).

추출 필드:

- `title` — 제목
- `description` — 요약 (있으면)
- `tags` — 태그 배열
- `slug` — 파일명 기반 slug (확장자 제거)

### Step 1-3: 인덱스 구조

```typescript
type ExistingPost = {
  slug: string;
  title: string;
  titleTokens: Set<string>; // 한글 2-gram + 영문 lowercase 단어
  tagsSet: Set<string>;
};
```

64 개 글 기준 인덱스가 메모리에 들어감. context7 같은 외부 호출 없음.

### Step 1-4: 이전 추천 인덱스 빌드

이전 호출에서 보여준 후보가 다시 추천되면 사용자가 짜증나요. `content/tmp/
topic-suggestions/` 의 만료 안 된 (30 일 이내) 로그 파일을 모두 읽어 후보
인덱스를 추가로 빌드합니다.

#### 절차

```
Glob content/tmp/topic-suggestions/*.md
```

각 파일에 대해 `Read` 로 frontmatter + 후보 표를 파싱:

- frontmatter `created_at` 기준 30일 초과면 인덱스에서 제외 (Step 6-4 만료
  정리와 별개로, 인덱스 빌드 시점에서도 한 번 더 거름)
- 표에서 `제목 후보` 컬럼 추출 → `titleTokens` 만들기 (Phase 1-3 와 동일
  토큰화 규칙)
- `selected` frontmatter 가 채워져 있으면 그 후보는 이미 사용자가 골라
  blog-write 로 넘어갔을 가능성이 높음 → "강한 중복" 으로 분류

#### 인덱스 구조

```typescript
type PreviousCandidate = {
  source_log: string; // 로그 파일명
  created_at: string;
  title: string;
  titleTokens: Set<string>;
  selected_in_log: boolean; // 그 로그에서 사용자가 골랐는지
};
```

이 인덱스는 메모리에서만 유지. 파일에 다시 쓰지 않음.

### Step 1-5: 두 인덱스 통합

Phase 4 의 중복도 점수 계산은 **두 인덱스 모두**에 대해 수행됩니다. 하나로
합치는 게 아니라, 후보 C 에 대해:

- vs `ExistingPost[]` (기존 글) → `dupScoreVsPosts`
- vs `PreviousCandidate[]` (이전 추천) → `dupScoreVsPrevious`

각각 임계값을 따로 적용. 자세한 건 Phase 4 Step 4-2 참조.

---

## Phase 2: 영감 소스 크롤 (sub-agent 격리, 필수)

WebFetch 결과 (수만 토큰) 가 오케스트레이터 컨텍스트로 흘러들어가지 않도록
**Agent 툴로 sub-agent 호출**. blog-research 와 동일한 격리 패턴.

### Step 2-1: 영역 결정

사용자가 영역을 명시했으면 그대로. 생략했으면:

1. Phase 1 인덱스의 `tagsSet` 빈도 카운트
2. 상위 3개 영역 도출 (예: `CSS`, `React`, `성능`)
3. AskUserQuestion 으로 사용자 확인 (§UI-USER-CHOICE 준수)

### Step 2-2: sub-agent 호출

```
Agent(
  description="영감 소스 크롤",
  subagent_type="general-purpose",
  prompt="""
영감 소스에서 프론트엔드 글감 후보를 수집해줘.

영역: <영역>
라벨 모드: <trend|evergreen|mixed>
필요 개수: 후보 15~20개 (오케스트레이터가 점수로 거를 예정)

카탈로그: .claude/skills/blog-shared/config/topic-sources.md
- §TOPIC-SOURCE-TREND (외국, 최신글 우선)
- §TOPIC-SOURCE-EVERGREEN (외국, 가이드 심층)
- §TOPIC-SOURCE-KOREA (한국, 옵션)

라운드 로빈 규칙:
- 라벨 모드 trend → TREND 5회 + EVERGREEN 1회 + KOREA 2회
- 라벨 모드 evergreen → TREND 1회 + EVERGREEN 5회 + KOREA 2회
- 라벨 모드 mixed → TREND 4회 + EVERGREEN 2회 + KOREA 2회

수집 한도 (엄격):
- WebFetch 누적 8회 이내
- WebSearch 보조 가능, 직접 본문 fetch 는 한도에 포함

각 후보당 추출 필드:
- title (영감 글의 제목)
- url (영감 글의 절대 URL)
- posted_date (있으면 ISO 형식, 없으면 빈 문자열)
- hook_one_liner (영감 글이 다루는 핵심을 한 문장으로 — 글감용 후크 제안)
- source_domain (예: web.dev, css-tricks.com)

원문 본문은 절대 반환하지 마. hook_one_liner 는 영감 글 자체를 요약하는 게
아니라 "이걸 우리 블로그에서 어떤 각도로 다룰 수 있을까" 한 문장.

도달성 실패 (404/redirect 루프) URL 은 결과에서 제외.

출력 형식:

# 영감 소스 수집 결과

- 영역: <영역>
- 라벨 모드: <trend|evergreen|mixed>
- WebFetch 사용: <X>/8

## 후보 목록

### 1. <title>
- url: <절대 URL>
- posted_date: <ISO 또는 빈>
- hook_one_liner: <한 문장>
- source_domain: <도메인>
- source_section: <TREND|EVERGREEN|KOREA>

### 2. ...
"""
)
```

sub-agent 응답은 위 구조화된 마크다운만. 본문 원문 미포함.

### Step 2-3: 부족한 경우 거부

sub-agent 가 후보 8개 미만 반환 시:

```
영감 소스 수집이 부족해서 추천 흐름을 중단해요.

수집된 후보: <N>개 (목표 15~20개)
WebFetch 사용: <X>/8

가능한 원인:
- 영역이 너무 좁음 (예: "TanStack Query v6") → 더 넓은 키워드로 재시도
- 카탈로그 도메인 일부가 응답 안 함

다른 영역으로 다시 시도하시겠어요?
```

AskUserQuestion 으로 재시도 / 종료 선택지 제공.

---

## Phase 3: 라벨링

각 후보에 `[트렌드]` / `[에버그린]` / `[혼합]` 라벨을 붙입니다.

판정 규칙:

- `posted_date` 가 최근 90일 이내 → `[트렌드]`
- `posted_date` 가 1년 초과 또는 URL 경로에 `guides/` `basics/` `tutorial/` `learn/`
  포함 → `[에버그린]`
- 그 외 (90일 ~ 1년, 또는 날짜 정보 없음) → `[혼합]`

라벨 모드가 `trend` 인데 `[에버그린]` 이 섞이면 그대로 표시 (사용자 선택은
유지). 강제 필터링 안 함.

---

## Phase 4: 중복도 점수 (결정론적, 오케스트레이터 로컬)

각 후보 vs Phase 1 인덱스 64개 글 비교.

### Step 4-1: 점수 계산

각 후보 C, 각 기존 글 E 에 대해:

```
tagJaccard = |C.estimated_tags ∩ E.tagsSet| / |C.estimated_tags ∪ E.tagsSet|
titleTokenJaccard = |C.titleTokens ∩ E.titleTokens| / |C.titleTokens ∪ E.titleTokens|
slugLevenshtein = 1 - levenshtein(slugify(C.title), E.slug) / max_len

score = 0.50 * tagJaccard + 0.35 * titleTokenJaccard + 0.15 * slugLevenshtein
```

토큰화:

- 한글: 공백/조사 분리 후 2-gram (예: "리액트 훅" → `리액`, `액트`, `훅`)
- 영문: lowercase 후 단어 분리 (특수문자 제거)
- 코드 식별자 (`useState`, `aspect-ratio`) 는 그대로 한 토큰

태그 추정 (C.estimated_tags):

- `source_domain` 카테고리 매핑 (web.dev → `web/performance`, css-tricks →
  `CSS`)
- `title` 에서 표면 키워드 추출 (예: "React Compiler" → `React`)

### Step 4-2: 임계값 적용 (두 인덱스 분리 적용)

후보 C 에 대해 점수를 두 번 계산:

- `dupScoreVsPosts` = max(score(C, E) for E in `ExistingPost[]`)
- `dupScoreVsPrevious` = max(score(C, P) for P in `PreviousCandidate[]`)

각 임계값:

기존 글 비교 (강한 차단):

- `dupScoreVsPosts >= 0.5` → 자동 제외
- `0.3 <= dupScoreVsPosts < 0.5` → "유사글 있음" 표기 + 가장 유사한 E.slug
- `dupScoreVsPosts < 0.3` → 통과

이전 추천 비교 (조금 느슨, 단 사용자가 골랐던 후보는 강하게):

- `dupScoreVsPrevious >= 0.4` 면서 P.selected_in_log = true → 자동 제외
  (사용자가 골라서 진행한 후보를 다시 보여주지 마세요)
- `dupScoreVsPrevious >= 0.5` → 자동 제외 (선택 여부 무관)
- `0.3 <= dupScoreVsPrevious < 0.5` → "지난 추천에 유사 후보" 표기 +
  source_log 파일명 + P.title
- `dupScoreVsPrevious < 0.3` → 통과

**둘 중 하나라도 자동 제외 조건에 걸리면 후보에서 제거.** 두 점수 다 0.3
이상이면 출력 표에 두 줄로 표기 (`기존 글 유사 + 지난 추천 유사`).

자동 제외된 후보는 출력에 포함하지 않음 (제외 카운트만 보고).

### Step 4-3: 정렬

남은 후보를 다음 우선순위로 정렬:

1. `dupScore` 오름차순 (덜 중복된 게 먼저)
2. `posted_date` 내림차순 (최신이 먼저, 라벨 모드와 무관)
3. `source_section` 다양성 보정 (한 섹션이 5개 이상이면 다른 섹션 끼워넣음)

상위 N 개 (count, 기본 6) 만 출력 후보로 확정.

---

## Phase 5: 1순위 자료 가능성 추정 (가벼운 추정)

각 출력 후보에 `1순위 가능성` 라벨 (`HIGH` / `MEDIUM` / `LOW`) 부여.

### Step 5-1: 키워드 패턴 매칭

후보 title + hook_one_liner 에서 키워드 추출:

- **라이브러리/프레임워크**: domains.md `§DOMAIN-PRIORITY-1` 의 도메인 이름
  매칭 (예: "React", "Next.js", "Tailwind")
- **CSS 속성**: `[a-z][a-z\-]+(?:property|selector)` 패턴 또는 known-list
  (`aspect-ratio`, `container-type` 등)
- **Web API**: `XxxAPI`, `xxxObserver`, `Xxx Element` 형태
- **JS 표준**: `Promise.xxx`, `Array.prototype.xxx` 등

### Step 5-2: 가능성 판정

매칭 결과로:

- 라이브러리 키워드 매치되면 `mcp__plugin_context7_context7__resolve-library-id`
  **만** 호출 (가벼움, query-docs 안 함). 성공 → `HIGH`
- CSS/Web API/JS 키워드 매치 → `HIGH` (MDN URL 패턴 가능성 높음, 실제 fetch 안 함)
- 어디에도 안 걸리면 `MEDIUM` (web.dev/chrome 등 2순위는 가능)
- 영감 글 자체가 `joshwcomeau`/`kentcdodds`/`css-tricks` 의 의견 글이고 표면
  키워드 없음 → `LOW`

추정만 함. 실제 자료 수집은 사용자가 후보를 골라 blog-write 호출 시
blog-research 가 본격 처리.

---

## Phase 6: 출력 + 사용자 선택

마크다운 표 형식으로 후보를 보여주고 §UI-USER-CHOICE 준수해 AskUserQuestion 호출.

### Step 6-1: 표 출력

```markdown
# 글감 추천 결과 — 영역: <영역>

라벨 모드: <trend|evergreen|mixed>
수집된 후보: <N>개 → 중복 자동 제외 <X>개 → 최종 <count>개

| #   | 라벨       | 제목 후보                                          | 한 줄 후크                     | 영감 도메인 | 중복도                                                                                                                                             | 1순위 가능성 |
| --- | ---------- | -------------------------------------------------- | ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1   | [트렌드]   | View Transitions API 의 same-document vs cross-doc | 페이지 이동 전환의 동작 차이   | web.dev     | 0.18                                                                                                                                               | HIGH         |
| 2   | [에버그린] | CSS @container style queries 실전                  | 컨테이너별 스타일 분기 패턴    | css-tricks  | 0.22                                                                                                                                               | HIGH         |
| 3   | [혼합]     | React 19 use() hook 과 Suspense 통합               | 데이터 페칭과 경계의 새 진입점 | react.dev   | 글 0.31 (유사: react-suspense-internals-and-tanstack-query) / 지난 추천 0.34 (유사: 20260510-130037-react.md "Cache Components 한 층 더 들어가기") | HIGH         |
| ... | ...        | ...                                                | ...                            | ...         | ...                                                                                                                                                | ...          |

가드 메모: 영감 도메인은 추천 단계 표시 전용입니다. blog-write 가 본문 작성
시 1순위 자료를 다시 수집하고, References 에는 영감 출처가 자동으로 들어가지
않아요 (§RULE-EXTERNAL-MENTION).
```

### Step 6-2: 사용자 선택

§UI-USER-CHOICE 준수, AskUserQuestion 호출:

```
AskUserQuestion(
  questions=[{
    "question": "어느 후보로 진행할까요?",
    "options": [
      "1번 — <1번 제목 약식>",
      "2번 — <2번 제목 약식>",
      ... (count 만큼),
      "다른 영역으로 다시 추천",
      "지금은 종료"
    ]
  }]
)
```

후보 개수가 4를 넘으면 "더 보기" 옵션으로 분할 (AskUserQuestion 옵션은
최대 4개). count=6 일 때:

- 1차 질문: 후보 1~3, "후보 4~6 보기", "취소"
- 2차 질문 (4~6 선택 시): 후보 4~6, "다시 1~3", "취소"

중복도 컬럼 표기 규칙:

- 기존 글 유사만: `0.18` 또는 `0.31 (유사: <slug>)`
- 지난 추천 유사만: `지난 추천 0.32 (유사: <log-file> "<title>")`
- 둘 다: `글 0.18 / 지난 추천 0.34 (유사: <log-file> "<title>")`

### Step 6-3: 추천 결과 영속화 (gitignored 로컬 로그)

표 출력 직후, 사용자 선택을 기다리기 전에 추천 결과를 로컬 로그로 저장합니다.
나중에 "지난번 추천에서 2~6번이 괜찮았는데" 같은 회상이 가능해지도록.

**저장 위치**: `content/tmp/topic-suggestions/<YYYYMMDD-HHMMSS>-<영역-slug>.md`

- 디렉토리 없으면 `mkdir -p` 로 생성
- `<영역-slug>` 는 영역 이름을 lowercase 하이픈 형태로 (예: "CSS" → `css`,
  "React 성능" → `react-performance`)
- gitignored — `.gitignore` 의 `content/tmp/*` 규칙으로 자동 제외

**저장 내용 (마크다운)**:

```markdown
---
created_at: <YYYY-MM-DD HH:MM>
area: <영역>
label_mode: <trend|evergreen|mixed>
count: <count>
webfetch_used: <X>/8
selected: <비어있음 — Phase 7 에서 사용자 선택 시 채워짐>
---

# 글감 추천 — <영역> (<YYYY-MM-DD HH:MM>)

> ⚠️ 가드: 이 파일의 영감 도메인은 추천 단계 표시 전용. 본문 인라인 링크나
> References 에 자동 포함 금지 (§RULE-EXTERNAL-MENTION + §TOPIC-SUGGEST-FLOW).
> blog-write 가 본 작업에서 1순위 자료를 새로 수집하고, 그 자료만 본문/
> References 에 사용.

## 후보

| #   | 라벨 | 제목 후보 | 한 줄 후크 | 영감 도메인 | 중복도 | 1순위 가능성 |
| --- | ---- | --------- | ---------- | ----------- | ------ | ------------ |
| ... |      |           |            |             |        |              |

## 자동 제외된 후보 (중복도 ≥ 0.5)

- <제목> — 0.62 (유사: <기존 글 slug>)
- ...

## 메모

- WebFetch 사용: <X>/8
- 수집된 후보 총 <N>개 → 중복 자동 제외 <Y>개 → 표시 <count>개
- 라운드 로빈 분배: TREND <a>회 / EVERGREEN <b>회 / KOREA <c>회
```

**저장 시점**:

1. Step 6-1 (표 출력) 직후, Step 6-2 (사용자 선택) 호출 전에 1차 저장
2. Phase 7-1 (사용자 선택 후) 에서 frontmatter `selected` 필드 업데이트해
   재저장

**가드**:

- 본문/원문/긴 인용문 절대 저장 금지. hook_one_liner 한 문장과 메타만
- 영감 글의 코드 블록 저장 금지
- 가드 헤더 (`> ⚠️ 가드:` 단락) 는 모든 저장 파일에 자동 포함

### Step 6-4: 만료 정리 (호출 시작 시 1회)

스킬 호출 시작 직후 (Phase 1 전), 30 일 이상 된 추천 로그를 자동 정리.

```bash
find content/tmp/topic-suggestions/ -name "*.md" -mtime +30 -delete 2>/dev/null
```

조용히 실행. 결과 미보고 (사용자에게 노이즈).

오류 발생 시 (디렉토리 없음 등) 무시하고 진행.

---

## Phase 7: blog-write 통합 안내 (자동 호출 안 함)

후보가 선택되면 **blog-write 를 자동 호출하지 않습니다**. 영감 출처가 GATE 1
컨텍스트로 새는 걸 차단하기 위해.

### Step 7-1: 로그 파일 업데이트

Step 6-3 에서 저장한 로그 파일의 frontmatter `selected` 필드를 채웁니다.

```yaml
selected: <선택한 후보 #번> — <선택한 제목>
selected_at: <YYYY-MM-DD HH:MM>
```

본문은 그대로. frontmatter 만 Edit.

### Step 7-2: 안내 메시지

```markdown
✅ 후보 선택: <선택한 제목>

영감 출처: <영감 도메인> (참고용, 실제 작성 시 미사용)
1순위 자료 가능성: <HIGH/MEDIUM/LOW>

추천 로그: content/tmp/topic-suggestions/<파일명>.md

이제 blog-write 로 본격 작성을 시작하려면:

/blog-write <선택한 제목>

blog-write 의 blog-research 가 1순위 공식 출처를 새로 수집해요. 영감 도메인은
이 추천 단계 표기에서 끝나고, 본문/References 에는 들어가지 않습니다
(§RULE-EXTERNAL-MENTION 준수).
```

이 메시지를 보여준 뒤 흐름 종료. 사용자가 다음 명령을 직접 입력.

### Step 7-3: 다른 영역으로 재추천 선택 시

Phase 2-1 로 복귀. 새 영역 입력 받고 흐름 재시작 (Phase 1 인덱스는 재사용).

---

## 출력 형식 (요약)

스킬이 반환하는 표준 출력:

1. (옵션) 영역 자동 추정 결과 + 사용자 확인
2. Phase 6 의 마크다운 표 (후보 리스트)
3. 가드 메모 (영감 출처와 References 분리)
4. AskUserQuestion 선택지
5. (선택 후) blog-write 호출 안내 메시지

원문 본문, 영감 글의 인용문, 영감 글의 코드 블록 — 어느 것도 출력에 포함하지
않음.

---

## 거부 조건

다음 경우 추천 흐름을 중단:

1. **config/topic-sources.md 부재** — 사전 준비 단계에서 거부
2. **content/posts/ 비어 있음** — Phase 1 에서 인덱스 0건. 거부 메시지로
   "기존 글 0건이라 중복도 비교 불가, 그래도 진행할까요?" AskUserQuestion
3. **sub-agent 가 후보 8개 미만 수집** — Phase 2 에서 거부 (재시도 옵션)
4. **중복 자동 제외 후 남은 후보 3개 미만** — Phase 4 에서 거부, 영역 재선택
   유도

---

## 제약

- **파일 시스템 쓰기는 `content/tmp/topic-suggestions/` 안에서만** 허용
  (gitignored 로컬 로그). 그 외 경로 쓰기 금지. Read (config / posts
  frontmatter) 는 자유
- **WebFetch 직접 호출 금지** (오케스트레이터 컨텍스트). Agent 툴 sub-agent
  안에서만
- **WebFetch 한도 8회** (sub-agent 안에서). 한도 도달 시 부분 결과 보고
- **영감 출처를 References 로 끌어다 쓰지 마세요**. 추천 단계 표시 전용
  (§RULE-EXTERNAL-MENTION + §TOPIC-SUGGEST-FLOW)
- **blog-write 자동 호출 금지**. 사용자가 명시적으로 다음 명령 입력
- **본문/코드/긴 인용문 포함 금지**. hook_one_liner 한 문장만
- **사용자 선택지는 AskUserQuestion 툴**. 마크다운 리스트 금지
  (§UI-USER-CHOICE)
- **블랙리스트 도메인 사용 금지** (`config/domains.md §DOMAIN-BLACKLIST`)
- **SHARED.md 규칙을 SKILL.md 에 복사 금지**. Read 로 참조만

---

## 가드: sub-agent 응답 검증

sub-agent 가 반환한 마크다운에 다음이 포함되어 있으면 **거부**하고 재호출:

- 200 자 이상의 인용 블록
- 코드 블록 (백틱 3개)
- 영감 글 본문에서 발췌한 긴 단락

영감 출처는 메타 정보 (제목/URL/날짜/한 줄 후크) 만 받습니다. 본문이 흘러들어
오면 §RULE-EXTERNAL-MENTION 위반 위험.

---

## 가드: config 변경 후 재호출

`topic-sources.md` 가 수정된 직후 호출되면 첫 추천에서 카탈로그 변경 사항을
사용자에게 알림:

```
ℹ️ 영감 소스 카탈로그가 최근 수정되었어요. 새 도메인이 결과에 포함될 수
있습니다.
```

이 알림은 메타 정보일 뿐 흐름을 막지 않음.
