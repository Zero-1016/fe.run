import type { CSSProperties } from "react";

/**
 * HeroGraph — 테크 블로그 히어로용 노드 그래프 배경
 *
 * - 좌측은 비워두고 우측에 그래프가 모이도록 구성 (헤더 타이포 공간 확보)
 * - 색은 전부 CSS 변수 / currentColor 기반 → 라이트/다크 자동 대응
 * - PNG가 아니라 벡터라서 어느 해상도에서도 선명함
 *
 * 색 토큰 (globals.css 의 :root / .dark 에서 정의):
 *   --graph-ink     : 선/일반 노드 색
 *   --graph-accent  : 강조 노드 색 (히어로 보라 포인트)
 *
 * 페이지에 한 번만 렌더되므로 SVG id 는 정적 상수로 둔다. (useId 미사용 →
 * 서버 컴포넌트로 남아 클라이언트 JS 를 싣지 않음)
 */
const id = "herograph";

export function HeroGraph({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        // 라이트 기본값. 다크는 globals.css 의 .dark 토큰에서 오버라이드.
        // 선과 노드를 currentColor로 그리므로 color만 바꿔도 전체 톤이 바뀜.
        color: "var(--graph-ink, rgba(20,20,28,0.55))",
        ...style,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1512 1000"
        width="100%"
        height="100%"
        preserveAspectRatio="xMaxYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          {/* 우하단 글로우 */}
          <radialGradient id={`${id}-glow`} cx="78%" cy="80%" r="55%">
            <stop offset="0%" stopColor="var(--graph-accent, #7c5cff)" stopOpacity="0.22" />
            <stop offset="45%" stopColor="var(--graph-accent, #7c5cff)" stopOpacity="0.07" />
            <stop offset="100%" stopColor="var(--graph-accent, #7c5cff)" stopOpacity="0" />
          </radialGradient>

          {/* 우측에서 좌측으로 갈수록 그래프가 사라지도록 페이드 마스크 */}
          <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="38%" stopColor="#fff" stopOpacity="0" />
            <stop offset="70%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id={`${id}-mask`}>
            <rect x="0" y="0" width="1512" height="1000" fill={`url(#${id}-fade)`} />
          </mask>
        </defs>

        {/* 글로우는 마스크 밖에서 그려서 좌측 여백까지 은은하게 번지게 */}
        <rect x="0" y="0" width="1512" height="1000" fill={`url(#${id}-glow)`} />

        {/* 그래프 본체 — 우측에서 좌로 페이드 */}
        <g mask={`url(#${id}-mask)`}>
          {/* edges */}
          <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round">
            <path d="M820 70 L960 235" />
            <path d="M960 235 L1130 150" />
            <path d="M1130 150 L1300 95" />
            <path d="M1300 95 L1450 200" />
            <path d="M960 235 L1080 360" />
            <path d="M1080 360 L1230 430" />
            <path d="M1230 430 L1400 360" />
            <path d="M1080 360 L1010 540" />
            <path d="M1010 540 L1180 600" />
            <path d="M1180 600 L1330 690" />
            <path d="M1010 540 L900 690" />
            <path d="M900 690 L1040 780" />
            <path d="M1040 780 L1230 760" />
            <path d="M900 690 L760 640" />
            <path d="M760 640 L640 540" />
            <path d="M640 540 L700 410" />
            <path d="M700 410 L840 470" />
            <path d="M840 470 L1010 540" />
            <path d="M1040 780 L960 940" />
            <path d="M1330 690 L1440 800" />
            <path d="M1230 430 L1330 690" />
          </g>

          {/* accent edges (보라) */}
          <g
            stroke="var(--graph-accent, #7c5cff)"
            strokeWidth="1.4"
            fill="none"
            opacity="0.85"
            strokeLinecap="round"
          >
            <path d="M1080 360 L1010 540" />
            <path d="M1010 540 L1180 600" />
            <path d="M1180 600 L1230 760" />
          </g>

          {/* normal nodes */}
          <g fill="currentColor">
            {[
              [820, 70, 4],
              [960, 235, 6],
              [1130, 150, 4.5],
              [1300, 95, 5],
              [1450, 200, 4],
              [1080, 360, 6.5],
              [1230, 430, 5],
              [1400, 360, 4],
              [1180, 600, 5.5],
              [1330, 690, 6],
              [900, 690, 5.5],
              [1040, 780, 7],
              [1230, 760, 4.5],
              [760, 640, 4],
              [640, 540, 5],
              [700, 410, 4],
              [840, 470, 4.5],
              [960, 940, 5],
              [1440, 800, 4.5],
            ].map(([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} opacity={0.85} />
            ))}
          </g>

          {/* accent nodes (보라) */}
          <g fill="var(--graph-accent, #7c5cff)">
            <circle cx={1010} cy={540} r={7} />
            <circle cx={1080} cy={360} r={5.5} />
            <circle cx={1180} cy={600} r={5} />
            <circle cx={1230} cy={760} r={5.5} />
          </g>
        </g>
      </svg>
    </div>
  );
}
