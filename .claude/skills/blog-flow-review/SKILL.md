---
name: blog-flow-review
description: |
  FlowDiagram 이 들어간 글에 한해, 실제로 페이지를 렌더해 다이어그램이 시각적으로
  잘 그려졌는지 검수한다. scripts/shoot-flow.ts 로 라이트/다크 스크린샷을 찍고,
  그 이미지를 직접 보고 화살표·라벨 겹침, 노드 과밀, 캔버스 밖 잘림, 선 모양
  부적합을 판정한다. FlowDiagram 이 없으면 즉시 skip(서버도 안 띄움).

  사용 트리거: blog-write 검증 후반, blog-revise 검증 사이클, 단독 실행
  ("이 글 다이어그램 그림 확인해줘", "/blog-flow-review <파일>").

  자동 수정은 안 함. 문제와 구체 수정안(h/edgeType/y 간격/노드 수)만 제시하고,
  본문 수정은 blog-writer/blog-revise 가 맡는다.
tools:
  - Read
  - Bash
  - Edit
  - Grep
  - AskUserQuestion
---

# blog-flow-review

FlowDiagram 의 **렌더 결과**를 눈으로 검수하는 스킬. 텍스트(MDX)만으로는 못 잡는
겹침·정렬·잘림을 실제 스크린샷으로 확인한다.

## 전제 (시작 시 Read 주입)

- SHARED.md `§MDX-FLOWDIAGRAM` — 판정 기준의 SSOT. 특히 "구조에 형태를 맞추기"
  (왕복 → 세로 허브 + straight, 삼각/대각 → smoothstep).
- SHARED.md `§UI-USER-CHOICE` — 수정안 제시는 AskUserQuestion 툴 호출.
- 컴포넌트 세부 동작(h, edgeType, 레인 자동 분배)은 `components/ui/CLAUDE.md` 참조.

규칙을 여기 복사하지 않는다. 판정할 때 Read 로 주입해 참조만.

## 입력 계약

- **오케스트레이터 호출 시**: `files`(또는 slug), `mode: single`,
  `via: orchestrator|blog-revise`, `dry_run`(선택).
- **단독 실행 시**: `/blog-flow-review content/posts/<slug>.mdx`.

## Step 1: 가드 (FlowDiagram 유무)

대상 MDX 에 `<FlowDiagram` 이 있는지 grep.

```bash
grep -c "<FlowDiagram" content/posts/<slug>.mdx
```

0 이면 즉시 종료: "FlowDiagram 없음 — flow-review skip". **서버를 띄우지 않는다.**

## Step 2: 스크린샷 생성

slug 도출(파일명에서 .mdx 제거, 시리즈면 디렉토리/파일 규칙 따름) 후 실행:

```bash
pnpm tsx scripts/shoot-flow.ts <slug>
```

- stdout 첫 줄이 `NO_FLOWDIAGRAM` → skip 보고 후 종료.
- `SHOTS:` → 그 아래 PNG 경로들(다이어그램 N개 × light/dark)을 수집.
- 서버 전략은 스크립트가 처리(:4321 재사용, 없으면 임시 기동 후 종료).

## Step 3: 비전 판정

수집한 각 PNG 를 Read 로 직접 본다. 다이어그램 1개당 light/dark 둘 다.
판정 항목(§MDX-FLOWDIAGRAM 기준):

- **화살표/라벨 겹침**: 선이 뭉치거나 라벨이 서로/노드와 포개짐.
- **노드 과밀·겹침**: 카드끼리 붙거나 겹침.
- **캔버스 밖 잘림**: fitView 실패로 노드/라벨이 잘림.
- **선 모양 부적합**: 삼각·대각 배치에 straight(비스듬), 또는 왕복인데 세로
  허브 없이 겹침 → 구조-형태 불일치.
- **라이트/다크 가독성**: 특정 테마에서 대비 부족·안 보임.

## Step 4: 수정안 제시 (문제 있을 때, §UI-USER-CHOICE)

발견 항목마다 구체값으로 제안. 예:

- 왕복인데 겹침 → "Client 노드에 `h: 360` + 반대편 세로 스택 + `edgeType=\"straight\"`"
- 삼각에 straight 비스듬 → "`edgeType` 제거(기본 smoothstep)"
- 잘림 → "`height` 를 N 으로, 또는 노드 y 간격 확대"
- 과밀 → "노드 7~8개 초과, 섹션 분할 또는 다이어그램 분리"

AskUserQuestion 으로 어떻게 처리할지 선택받는다.

## Step 5: 자동 수정 정책

- `via != standalone`(오케스트레이터/blog-revise 경유): **수정안만 구조화해 반환**.
  본문 Edit 은 호출자(blog-writer/blog-revise)가 백업·검증과 함께 처리.
- `via == standalone`(단독 실행): 사용자 승인 후 직접 Edit 가능. 단 MDX 의
  FlowDiagram 블록만 수정. 수정 후 재촬영(Step 2~3)으로 확인 권장.
- `dry_run: true`: Edit 하지 않고 진단만 보고.

## 출력 형식

```markdown
## flow-review: <slug>

- 다이어그램 N개 검사 (light/dark)
- 발견 M건

### 다이어그램 1 (L<라인>)

- [겹침] B·D 라벨이 Client 좌변에서 포개짐 (dark 에서 특히)
- 수정안: Client h 360 → 420, y 간격 확대

### 다이어그램 2 (L<라인>)

- 문제 없음 (light/dark 양호)
```

오케스트레이터 경유면 위를 구조화 데이터로 반환.

## 제약

- **FlowDiagram 없으면 서버 안 띄움** (Step 1 grep 가드 필수).
- **scripts/shoot-flow.ts 외 임의 시스템 명령 금지**. Bash 는 grep/스크립트 실행만.
- **자동 본문 편집은 단독 실행 + 사용자 승인 시에만**. 오케스트레이터 경유면 반환만.
- **판정 기준은 §MDX-FLOWDIAGRAM SSOT**. 여기 규칙 복사 금지.
- **content/tmp/flow-shots/ 는 로그성**(gitignored). 정리 안내만, 커밋 대상 아님.
