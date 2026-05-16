"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/nav";
import { resources } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";
import type { ResourceType } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number; // radius
  color: string;
  type: ResourceType;
  name: string;
  slug: string;
  stars: number;
  tags: string[];
}

interface GraphEdge {
  source: string;
  target: string;
  sharedTags: number;
}

interface Tooltip {
  visible: boolean;
  x: number;
  y: number;
  node: GraphNode | null;
}

// ── Physics constants ─────────────────────────────────────────────────────────

const REPULSION = 3500;
const SPRING_LEN = 100;
const SPRING_K = 0.04;
const GRAVITY = 0.003;
const DAMPING = 0.85;
const MAX_TICKS = 250;
const MIN_R = 6;
const MAX_R = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function nodeRadius(stars: number, maxStars: number): number {
  const norm = Math.sqrt(stars / maxStars); // sqrt scale — fewer tiny nodes
  return MIN_R + norm * (MAX_R - MIN_R);
}

function buildGraph(width: number, height: number): { nodes: GraphNode[]; edges: GraphEdge[] } {
  // Pick top ~45 resources: featured + trending + hot, deduped
  const seen = new Set<string>();
  const subset: typeof resources = [];
  for (const r of resources) {
    if ((r.featured || r.trending || r.hot) && !seen.has(r.id)) {
      seen.add(r.id);
      subset.push(r);
    }
    if (subset.length >= 45) break;
  }
  // Pad if needed
  for (const r of resources) {
    if (subset.length >= 45) break;
    if (!seen.has(r.id)) {
      seen.add(r.id);
      subset.push(r);
    }
  }

  const maxStars = Math.max(...subset.map((r) => r.stars));

  const nodes: GraphNode[] = subset.map((r) => ({
    id: r.id,
    x: width / 2 + (Math.random() - 0.5) * width * 0.6,
    y: height / 2 + (Math.random() - 0.5) * height * 0.6,
    vx: 0,
    vy: 0,
    r: nodeRadius(r.stars, maxStars),
    color: TYPE_META[r.type].color,
    type: r.type,
    name: r.name,
    slug: r.slug,
    stars: r.stars,
    tags: r.tags,
  }));

  // Build edges: connect if ≥ 2 shared tags, OR same type + ≥ 1 shared tag
  const edges: GraphEdge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const shared = a.tags.filter((t) => b.tags.includes(t)).length;
      if (shared >= 2 || (a.type === b.type && shared >= 1)) {
        edges.push({ source: a.id, target: b.id, sharedTags: shared });
      }
    }
  }

  return { nodes, edges };
}

function tick(nodes: GraphNode[], edges: GraphEdge[], width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist2 = dx * dx + dy * dy || 1;
      const dist = Math.sqrt(dist2);
      const force = REPULSION / dist2;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx -= fx;
      a.vy -= fy;
      b.vx += fx;
      b.vy += fy;
    }
  }

  // Spring attraction
  for (const edge of edges) {
    const a = nodeMap.get(edge.source);
    const b = nodeMap.get(edge.target);
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const stretch = dist - SPRING_LEN;
    const force = SPRING_K * stretch;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    a.vx += fx;
    a.vy += fy;
    b.vx -= fx;
    b.vy -= fy;
  }

  // Gravity toward center
  for (const node of nodes) {
    node.vx += (cx - node.x) * GRAVITY;
    node.vy += (cy - node.y) * GRAVITY;
  }

  // Integrate + damp + clamp to bounds
  for (const node of nodes) {
    node.vx *= DAMPING;
    node.vy *= DAMPING;
    node.x = clamp(node.x + node.vx, node.r + 8, width - node.r - 8);
    node.y = clamp(node.y + node.vy, node.r + 8, height - node.r - 8);
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

const ALL_TYPES = Object.keys(TYPE_META) as ResourceType[];

export default function GraphPage() {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const rafRef = useRef<number>(0);
  const tickCount = useRef(0);

  const [svgSize, setSvgSize] = useState({ w: 800, h: 600 });
  const [renderKey, setRenderKey] = useState(0); // forces re-render after sim
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<Tooltip>({ visible: false, x: 0, y: 0, node: null });
  const [activeTypes, setActiveTypes] = useState<Set<ResourceType>>(new Set(ALL_TYPES));
  const [simDone, setSimDone] = useState(false);

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSvgSize({ w: rect.width, h: rect.height });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Build + run simulation
  const runSim = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setSimDone(false);
    tickCount.current = 0;

    const { nodes, edges } = buildGraph(svgSize.w, svgSize.h);
    nodesRef.current = nodes;
    edgesRef.current = edges;

    const step = () => {
      if (tickCount.current >= MAX_TICKS) {
        setSimDone(true);
        setRenderKey((k) => k + 1);
        return;
      }
      tick(nodesRef.current, edgesRef.current, svgSize.w, svgSize.h);
      tickCount.current++;
      // Render every 5 ticks to keep UI updating
      if (tickCount.current % 5 === 0) setRenderKey((k) => k + 1);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [svgSize.w, svgSize.h]);

  useEffect(() => {
    if (svgSize.w > 100 && svgSize.h > 100) runSim();
    return () => cancelAnimationFrame(rafRef.current);
  }, [runSim]);

  // Derived — snapshot for render
  const nodes = nodesRef.current;
  const edges = edgesRef.current;

  // Build id→node map for edges
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const toggleType = (type: ResourceType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleNodeClick = (node: GraphNode) => {
    router.push(`/resources/${node.slug}`);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let hit: GraphNode | null = null;
    for (const node of nodes) {
      const dx = mx - node.x;
      const dy = my - node.y;
      if (dx * dx + dy * dy <= (node.r + 4) * (node.r + 4)) {
        hit = node;
        break;
      }
    }

    if (hit) {
      setHoveredId(hit.id);
      setTooltip({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        node: hit,
      });
    } else {
      setHoveredId(null);
      setTooltip((t) => ({ ...t, visible: false }));
    }
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    setTooltip((t) => ({ ...t, visible: false }));
  };

  return (
    <div className="flex flex-col h-screen bg-[#030712] overflow-hidden">
      <Nav />

      {/* Main canvas area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{ marginTop: 64 }}>
        <svg
          ref={svgRef}
          width={svgSize.w}
          height={svgSize.h}
          className="absolute inset-0 cursor-default"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {ALL_TYPES.map((type) => (
              <filter key={type} id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Edges */}
          {edges.map((edge) => {
            const a = nodeMap.get(edge.source);
            const b = nodeMap.get(edge.target);
            if (!a || !b) return null;
            const aActive = activeTypes.has(a.type);
            const bActive = activeTypes.has(b.type);
            const isHighlighted =
              hoveredId === a.id || hoveredId === b.id;
            const opacity = !aActive || !bActive ? 0.03 : isHighlighted ? 0.55 : 0.12;
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={a.color}
                strokeWidth={isHighlighted ? 1.5 : 1}
                strokeOpacity={opacity}
                style={{ transition: "stroke-opacity 0.2s" }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isActive = activeTypes.has(node.type);
            const isHovered = hoveredId === node.id;
            const opacity = isActive ? 1 : 0.15;
            return (
              <circle
                key={node.id}
                cx={node.x}
                cy={node.y}
                r={isHovered ? node.r + 3 : node.r}
                fill={node.color}
                fillOpacity={opacity * (isHovered ? 1 : 0.85)}
                stroke={node.color}
                strokeWidth={isHovered ? 2 : 1}
                strokeOpacity={opacity}
                filter={isHovered ? `url(#glow-${node.type})` : undefined}
                style={{
                  cursor: "pointer",
                  transition: "r 0.15s, fill-opacity 0.2s, stroke-opacity 0.2s",
                }}
                onClick={() => handleNodeClick(node)}
              />
            );
          })}
        </svg>

        {/* Floating controls — top right */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
          {/* Type filter chips */}
          <div className="glass-card rounded-xl p-3 flex flex-col gap-2 max-w-[200px]">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Filter by type
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TYPES.map((type) => {
                const meta = TYPE_META[type];
                const active = activeTypes.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all border"
                    style={{
                      borderColor: active ? meta.color + "60" : "rgba(255,255,255,0.08)",
                      backgroundColor: active ? meta.color + "18" : "transparent",
                      color: active ? meta.color : "#64748b",
                    }}
                  >
                    <span>{meta.icon}</span>
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={runSim}
            className="glass-card rounded-xl px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white transition-colors text-center"
          >
            ↺ Re-run simulation
          </button>
        </div>

        {/* Legend — bottom left */}
        <div className="absolute bottom-6 left-4 glass-card rounded-xl p-3 z-10">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Legend
          </p>
          <div className="flex flex-col gap-1.5">
            {ALL_TYPES.map((type) => {
              const meta = TYPE_META[type];
              return (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="rounded-full shrink-0"
                    style={{ width: 8, height: 8, backgroundColor: meta.color }}
                  />
                  <span className="text-[11px] text-slate-400">{meta.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/[0.06]">
            <p className="text-[10px] text-slate-600">Node size = ★ stars</p>
            <p className="text-[10px] text-slate-600">Edge = shared tags</p>
          </div>
        </div>

        {/* Sim running indicator */}
        {!simDone && (
          <div className="absolute top-4 left-4 glass-card rounded-lg px-3 py-1.5 z-10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-[11px] text-slate-400">Simulating…</span>
          </div>
        )}

        {/* Stats badge — bottom right */}
        {simDone && (
          <div className="absolute bottom-6 right-4 glass-card rounded-xl px-3 py-2 z-10 text-right">
            <p className="text-[11px] text-slate-400">{nodes.length} nodes · {edges.length} edges</p>
          </div>
        )}
      </div>

      {/* Tooltip — absolutely positioned over everything */}
      {tooltip.visible && tooltip.node && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          <div className="glass-card rounded-xl px-3 py-2.5 shadow-2xl border border-white/[0.10] min-w-[160px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{TYPE_META[tooltip.node.type].icon}</span>
              <span className="text-xs font-semibold text-slate-100 leading-tight">
                {tooltip.node.name}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  color: TYPE_META[tooltip.node.type].color,
                  backgroundColor: TYPE_META[tooltip.node.type].color + "20",
                }}
              >
                {TYPE_META[tooltip.node.type].label}
              </span>
              <span className="text-[10px] text-slate-500">★ {tooltip.node.stars.toLocaleString()}</span>
            </div>
            {tooltip.node.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {tooltip.node.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[9px] text-slate-600 bg-white/[0.04] px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-[9px] text-slate-600 mt-1.5">Click to open</p>
          </div>
        </div>
      )}
    </div>
  );
}
