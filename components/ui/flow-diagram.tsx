"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import { cn } from "@/lib/utils";

type NodeKind = "default" | "accent" | "warning" | "success" | "error";
type Side = "top" | "right" | "bottom" | "left";

interface FlowNode extends Record<string, unknown> {
  id: string;
  title: string;
  description?: string;
  x: number;
  y: number;
  kind?: NodeKind;
  h?: number; // 선택: 카드 높이(px). 세로로 긴 허브 노드를 만들 때 사용
  // 레이아웃 단계에서 주입됨 (사용자는 전달하지 않음): 변별 핸들 위치(0~1) 목록
  handleConfig?: Partial<Record<Side, number[]>>;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}

interface FlowDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  height?: number;
  caption?: string;
  edgeType?: "smoothstep" | "step" | "straight"; // 엣지 선 모양 (기본: "smoothstep")
}

const kindStyles: Record<NodeKind, string> = {
  default: "bg-background border-border",
  accent: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  warning: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
  success: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
  error: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
};

function subscribeDarkClass(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getDarkClassSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerDarkSnapshot() {
  return false;
}

function useIsDark() {
  return useSyncExternalStore(subscribeDarkClass, getDarkClassSnapshot, getServerDarkSnapshot);
}

const handleSides = [
  { id: "top", position: Position.Top },
  { id: "right", position: Position.Right },
  { id: "bottom", position: Position.Bottom },
  { id: "left", position: Position.Left },
] as const;

function FlowCardNode({ data }: NodeProps<Node<FlowNode>>) {
  const kind = data.kind ?? "default";
  const cfg = data.handleConfig ?? {};
  const tall = typeof data.h === "number";
  return (
    <div
      style={tall ? { height: `${data.h}px` } : undefined}
      className={cn(
        "min-w-[140px] max-w-[220px] rounded-md border px-3 py-2 text-center shadow-sm",
        tall && "flex flex-col justify-center",
        kindStyles[kind]
      )}
    >
      {handleSides.map((side) => {
        const fracs = cfg[side.id] ?? [0.5];
        const vertical = side.id === "left" || side.id === "right";
        return fracs.map((frac, k) => {
          const style = vertical ? { top: `${frac * 100}%` } : { left: `${frac * 100}%` };
          const id = `${side.id}:${k}`;
          return (
            <div key={id}>
              <Handle
                id={id}
                type="source"
                position={side.position}
                style={style}
                className="!h-2 !w-2 !border-0 !bg-transparent"
              />
              <Handle
                id={id}
                type="target"
                position={side.position}
                style={style}
                className="!h-2 !w-2 !border-0 !bg-transparent"
              />
            </div>
          );
        });
      })}
      <div className="text-sm font-semibold leading-tight text-foreground">{data.title}</div>
      {data.description && (
        <div className="mt-1 text-xs leading-snug text-secondary">{data.description}</div>
      )}
    </div>
  );
}

function pickSides(
  source: { x: number; y: number },
  target: { x: number; y: number }
): { sourceSide: Side; targetSide: Side } {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceSide: "right", targetSide: "left" }
      : { sourceSide: "left", targetSide: "right" };
  }
  return dy >= 0
    ? { sourceSide: "bottom", targetSide: "top" }
    : { sourceSide: "top", targetSide: "bottom" };
}

const nodeTypes = { card: FlowCardNode };

// 같은 노드 변(side)에 붙는 끝점들을 레인으로 균등 분배한다.
// 끝점이 1개면 0.5(중앙)로 떨어져 단일 화살표 다이어그램은 기존과 동일하게 그려진다.
// 양방향(왕복) 엣지는 서로 다른 레인을 받아 겹치지 않는다.
function computeLayout(nodes: FlowNode[], edges: FlowEdge[]) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const sourceHandles: (string | undefined)[] = edges.map(() => undefined);
  const targetHandles: (string | undefined)[] = edges.map(() => undefined);

  type Endpoint = { idx: number; end: "s" | "t"; ox: number; oy: number };
  const groups = new Map<string, Endpoint[]>();
  const push = (key: string, ep: Endpoint) => {
    const arr = groups.get(key);
    if (arr) arr.push(ep);
    else groups.set(key, [ep]);
  };

  edges.forEach((e, i) => {
    const s = nodeMap.get(e.from);
    const t = nodeMap.get(e.to);
    if (!s || !t) return;
    const { sourceSide, targetSide } = pickSides({ x: s.x, y: s.y }, { x: t.x, y: t.y });
    push(`${e.from}|${sourceSide}`, { idx: i, end: "s", ox: t.x, oy: t.y });
    push(`${e.to}|${targetSide}`, { idx: i, end: "t", ox: s.x, oy: s.y });
  });

  const nodeHandles = new Map<string, Partial<Record<Side, number[]>>>();
  groups.forEach((arr, key) => {
    const sep = key.lastIndexOf("|");
    const nodeId = key.slice(0, sep);
    const side = key.slice(sep + 1) as Side;
    const vertical = side === "left" || side === "right";
    // 반대편 노드의 수직(또는 수평) 위치 순으로 정렬해 교차를 줄인다.
    arr.sort((a, b) => (vertical ? a.oy - b.oy : a.ox - b.ox));
    const n = arr.length;
    arr.forEach((item, k) => {
      const frac = (k + 1) / (n + 1);
      const handleId = `${side}:${k}`;
      if (item.end === "s") sourceHandles[item.idx] = handleId;
      else targetHandles[item.idx] = handleId;
      const cfg = nodeHandles.get(nodeId) ?? {};
      const list = cfg[side] ?? [];
      list[k] = frac;
      cfg[side] = list;
      nodeHandles.set(nodeId, cfg);
    });
  });

  return { sourceHandles, targetHandles, nodeHandles };
}

export function FlowDiagram({
  nodes,
  edges,
  height = 400,
  caption,
  edgeType = "smoothstep",
}: FlowDiagramProps) {
  const isDark = useIsDark();

  const layout = useMemo(() => computeLayout(nodes, edges), [nodes, edges]);

  const rfNodes = useMemo<Node<FlowNode>[]>(
    () =>
      nodes.map((n) => ({
        id: n.id,
        type: "card",
        position: { x: n.x, y: n.y },
        data: { ...n, handleConfig: layout.nodeHandles.get(n.id) ?? {} },
      })),
    [nodes, layout]
  );

  const edgeColor = isDark ? "#3b82f6" : "#2563eb";

  const rfEdges = useMemo<Edge[]>(() => {
    return edges.map((e, i) => {
      return {
        id: `${e.from}-${e.to}-${i}`,
        source: e.from,
        target: e.to,
        sourceHandle: layout.sourceHandles[i] ?? "right:0",
        targetHandle: layout.targetHandles[i] ?? "left:0",
        label: e.label,
        animated: e.animated ?? false,
        type: edgeType,
        style: { stroke: edgeColor, strokeWidth: 1.5 },
        labelStyle: { fontSize: 12, fontWeight: 500, fill: isDark ? "#e4e4e7" : "#171717" },
        labelBgStyle: { fill: isDark ? "#111113" : "#ffffff" },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor, width: 16, height: 16 },
      };
    });
  }, [edges, edgeColor, isDark, layout, edgeType]);

  return (
    <figure className="my-6">
      <div
        className="overflow-hidden rounded-lg border border-border bg-[var(--color-bg-secondary)]"
        style={{ height: `min(${height}px, 60vh)` }}
      >
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch
          zoomOnDoubleClick
          colorMode={isDark ? "dark" : "light"}
          minZoom={0.4}
          maxZoom={2}
        >
          <Background gap={18} size={1} color={isDark ? "#2a2a2e" : "#e5e7eb"} />
          <Controls
            showInteractive={false}
            className="!shadow-none [&>button]:!border-border [&>button]:!bg-background [&>button]:!text-foreground"
          />
        </ReactFlow>
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-secondary">{caption}</figcaption>
      )}
    </figure>
  );
}
