import { useId, type ReactNode } from "react";
import type { Workflow } from "../../api/types";

type Agent = Workflow["agents"][number];
type Step = Workflow["steps"][number];

function ownsLabel(owns: string): string {
  return `Owns ${/^(The|This)\s/.test(owns) ? owns.charAt(0).toLowerCase() + owns.slice(1) : owns}`;
}

function ArrowHead({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" className="rv-dg-head" />
      </marker>
    </defs>
  );
}

function Edges({ paths, marker, soft = false }: { paths: string[]; marker: string; soft?: boolean }) {
  return (
    <>
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          className={soft ? "rv-dg-edge rv-dg-edge--soft" : "rv-dg-edge"}
          markerEnd={`url(#${marker})`}
        />
      ))}
    </>
  );
}

function Node({
  x,
  y,
  w,
  h,
  title,
  tag,
  accent = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  tag?: string;
  accent?: boolean;
}) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g className={accent ? "rv-dg-node rv-dg-node--accent" : "rv-dg-node"}>
      <rect x={x} y={y} width={w} height={h} className="rv-dg-box" />
      <text x={cx} y={tag ? cy - 4 : cy + 5} textAnchor="middle" className="rv-dg-title">
        {title}
      </text>
      {tag ? (
        <text x={cx} y={cy + 15} textAnchor="middle" className="rv-dg-tag">
          {tag}
        </text>
      ) : null}
    </g>
  );
}

function splitHub(agents: Agent[]): { hub: Agent | undefined; others: Agent[] } {
  const hub = agents.find((agent) => agent.slug === "chief-of-staff") ?? agents[0];
  return { hub, others: agents.filter((agent) => agent !== hub) };
}

export function FleetDiagram({ agents }: { agents: Agent[] }) {
  const { hub, others } = splitHub(agents);
  if (!hub) return null;

  const cx = 480;
  const cy = 220;
  const positions = others.map((_, index) => {
    const angle = ((-90 + (index * 360) / Math.max(others.length, 1)) * Math.PI) / 180;
    return { x: cx + 340 * Math.cos(angle), y: cy + 158 * Math.sin(angle) };
  });
  const ring = positions.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const narrowHeight = 104 + others.length * 76;

  return (
    <figure className="rv-diagram rv-fleet">
      <svg className="rv-dg rv-dg--wide" viewBox="0 0 960 440" aria-hidden="true" focusable="false">
        {others.length > 2 ? <polygon points={ring} className="rv-dg-ring" /> : null}
        {positions.map((point, index) => (
          <line key={others[index].slug} x1={cx} y1={cy} x2={point.x} y2={point.y} className="rv-dg-edge" />
        ))}
        {others.map((agent, index) => (
          <Node
            key={agent.slug}
            x={positions[index].x - 98}
            y={positions[index].y - 30}
            w={196}
            h={60}
            title={agent.name}
            tag={ownsLabel(agent.owns)}
          />
        ))}
        <Node x={cx - 116} y={cy - 36} w={232} h={72} title={hub.name} tag={hub.summary} accent />
      </svg>
      <svg className="rv-dg rv-dg--narrow" viewBox={`0 0 360 ${narrowHeight}`} aria-hidden="true" focusable="false">
        {others.length > 0 ? (
          <line x1={40} y1={80} x2={40} y2={104 + (others.length - 1) * 76 + 30} className="rv-dg-edge" />
        ) : null}
        {others.map((agent, index) => {
          const y = 104 + index * 76;
          return (
            <g key={agent.slug}>
              <line x1={40} y1={y + 30} x2={72} y2={y + 30} className="rv-dg-edge" />
              <Node x={72} y={y} w={272} h={60} title={agent.name} tag={ownsLabel(agent.owns)} />
            </g>
          );
        })}
        <Node x={16} y={16} w={328} h={64} title={hub.name} tag={hub.summary} accent />
      </svg>
      <ol className="rv-sr" aria-label="Agent fleet">
        {[hub, ...others].map((agent) => (
          <li key={agent.slug}>
            {agent.name}. {ownsLabel(agent.owns)}. {agent.summary}
          </li>
        ))}
      </ol>
      <figcaption className="rv-diagram-caption">
        <span className="rv-legend-item">
          <span className="rv-legend-line" aria-hidden="true" />
          {hub.name} coordinates
        </span>
        <span className="rv-legend-item">
          <span className="rv-legend-line rv-legend-line--dashed" aria-hidden="true" />
          The agents coordinate with each other
        </span>
      </figcaption>
    </figure>
  );
}

const GLYPHS: Record<string, ReactNode> = {
  "grill-me": (
    <>
      <path d="M11.5 11.5a4.5 4.5 0 1 1 6.6 4c-1.3.7-2.1 1.6-2.1 3.1v1.2" />
      <circle cx="16" cy="24.5" r="0.6" />
    </>
  ),
  "to-spec": (
    <>
      <path d="M9 5.5h10l4 4v17H9z" />
      <path d="M19 5.5v4h4M12.5 14h7M12.5 18h7M12.5 22h4.5" />
    </>
  ),
  "to-tickets": (
    <>
      <rect x="6" y="12" width="15" height="13" />
      <path d="M10 8h15v13" />
      <path d="M9.5 16.5h8M9.5 20.5h5" />
    </>
  ),
  "implement-tdd": (
    <>
      <path d="M12 6.5c-2.5 0-3 1.3-3 3.5v2.5c0 1.8-.8 3-2.5 3.5 1.7.5 2.5 1.7 2.5 3.5V22c0 2.2.5 3.5 3 3.5" />
      <path d="M20 6.5c2.5 0 3 1.3 3 3.5v2.5c0 1.8.8 3 2.5 3.5-1.7.5-2.5 1.7-2.5 3.5V22c0 2.2-.5 3.5-3 3.5" />
      <path d="M13.5 16.5l2 2 3.5-4.5" />
    </>
  ),
  "code-review": (
    <>
      <circle cx="14" cy="14" r="7" />
      <path d="M19 19l6.5 6.5M11 14h6" />
    </>
  ),
  pr: (
    <>
      <circle cx="10" cy="8" r="2.5" />
      <circle cx="10" cy="24" r="2.5" />
      <circle cx="22" cy="24" r="2.5" />
      <path d="M10 10.5v11M10 13c0 5.5 12 3.5 12 8.5" />
    </>
  ),
};

export function StepGlyph({ slug }: { slug: string }) {
  return <g className="rv-glyph">{GLYPHS[slug] ?? <circle cx="16" cy="16" r="3" />}</g>;
}

export function WorkflowRail({ steps }: { steps: Step[] }) {
  const markerId = `rv-wf-${useId().replace(/:/g, "")}`;
  const width = Math.max(steps.length, 1) * 200;
  return (
    <figure className="rv-diagram rv-workflow">
      <svg className="rv-dg rv-dg--wide rv-rail" viewBox={`0 0 ${width} 96`} aria-hidden="true" focusable="false">
        <ArrowHead id={markerId} />
        {steps.slice(0, -1).map((step, index) => (
          <line
            key={step.slug}
            x1={index * 200 + 48 + 46}
            y1={48}
            x2={(index + 1) * 200 + 48 - 50}
            y2={48}
            className="rv-dg-edge"
            markerEnd={`url(#${markerId})`}
          />
        ))}
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          return (
            <g key={step.slug} className={last ? "rv-dg-step rv-dg-step--accent" : "rv-dg-step"}>
              <circle cx={index * 200 + 48} cy={48} r={40} className="rv-dg-disc" />
              <g transform={`translate(${index * 200 + 28} 28) scale(1.25)`}>
                <StepGlyph slug={step.slug} />
              </g>
            </g>
          );
        })}
      </svg>
      <ol className="rv-steps" aria-label="Coding workflow" style={{ ["--rv-steps" as string]: steps.length }}>
        {steps.map((step, index) => (
          <li key={step.slug} className={index === steps.length - 1 ? "rv-step rv-step--last" : "rv-step"}>
            <span className="rv-step-node" aria-hidden="true">
              <svg viewBox="0 0 32 32" focusable="false">
                <StepGlyph slug={step.slug} />
              </svg>
            </span>
            <span className="rv-step-index">{String(index + 1).padStart(2, "0")}</span>
            <h4 className="rv-step-name">{step.name}</h4>
            <p className="rv-step-summary">{step.summary}</p>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function DealRadarSchematic() {
  const markerId = `rv-dr-${useId().replace(/:/g, "")}`;
  const narrowMarker = `${markerId}-n`;
  return (
    <>
      <svg className="rv-dg rv-dg--wide" viewBox="0 0 640 372" aria-hidden="true" focusable="false">
        <ArrowHead id={markerId} />
        <Edges marker={markerId} paths={["M170 62H241", "M395 62H466", "M545 88V156", "M545 212V280"]} />
        <Edges marker={markerId} paths={["M170 186H466", "M170 310H466"]} soft />
        <text x="318" y="176" textAnchor="middle" className="rv-dg-tag">
          price context
        </text>
        <Node x={20} y={36} w={150} h={52} title="Blocket.se" tag="listings" />
        <Node x={245} y={36} w={150} h={52} title="Scraper" tag="scrape" />
        <Node x={470} y={36} w={150} h={52} title="PostgreSQL" tag="track listings" />
        <Node x={20} y={160} w={150} h={52} title="Tradera" tag="market prices" />
        <Node x={470} y={160} w={150} h={52} title="Model" tag="score 1 to 10" />
        <Node x={20} y={284} w={150} h={52} title="Deal requests" tag="subscriptions" />
        <Node x={470} y={284} w={150} h={52} title="Notification" tag="scores well" accent />
      </svg>
      <svg className="rv-dg rv-dg--narrow" viewBox="0 0 360 404" aria-hidden="true" focusable="false">
        <ArrowHead id={narrowMarker} />
        <Edges marker={narrowMarker} paths={["M112 68V92", "M112 148V172", "M112 228V252", "M112 308V332"]} />
        <Edges marker={narrowMarker} paths={["M228 282H212", "M228 362H212"]} soft />
        <Node x={16} y={16} w={192} h={52} title="Blocket.se" tag="listings" />
        <Node x={16} y={96} w={192} h={52} title="Scraper" tag="scrape" />
        <Node x={16} y={176} w={192} h={52} title="PostgreSQL" tag="track listings" />
        <Node x={16} y={256} w={192} h={52} title="Model" tag="score 1 to 10" />
        <Node x={228} y={256} w={116} h={52} title="Tradera" tag="market prices" />
        <Node x={16} y={336} w={192} h={52} title="Notification" tag="scores well" accent />
        <Node x={228} y={336} w={116} h={52} title="Requests" tag="subscriptions" />
      </svg>
      <p className="rv-sr">
        Pipeline: Blocket.se listings are scraped and tracked in PostgreSQL. A model scores each listing from 1 to 10,
        with Tradera market prices as price context. Listings that score well trigger a notification. People create
        deal requests and subscriptions.
      </p>
    </>
  );
}
