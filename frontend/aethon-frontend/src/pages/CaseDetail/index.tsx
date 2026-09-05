import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  AlertTriangle,
  Clock,
  FileText,
  MapPin,
  Network,
  Shield,
  ChevronRight,
} from "lucide-react";
import { useCase } from "../../hooks/useCase";
import { submitAnalystAction } from "../../services/caseService";
import { generateReport } from "../../services/reportService";
import { AuthResultChips } from "../../components/investigation/AuthResultChips";
import { EvidenceCard } from "../../components/investigation/EvidenceCard";
import { GeoMap } from "../../components/maps/GeoMap";
import { SeverityBadge, StatusBadge } from "../../components/ui/Badge";
import { Card, CardHeader, CardTitle, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { riskColorVar } from "../../utils/riskColor";
import { formatDateTime, formatTimestamp } from "../../utils/formatDate";
import type { CaseSeverityType } from "../../types";

/** Build React Flow nodes and edges from case indicators */
function buildGraph(
  caseData: NonNullable<ReturnType<typeof useCase>["data"]>
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let x = 0;

  // Center: sender node
  nodes.push({
    id: "sender",
    data: { label: caseData.senderEmail ?? "Sender" },
    position: { x: 300, y: 0 },
    style: {
      background: "var(--bg-surface-2)",
      color: "var(--text-primary)",
      border: `2px solid ${riskColorVar("critical")}`,
      borderRadius: 6,
      fontSize: 12,
      fontFamily: "var(--font-mono)",
      padding: "6px 12px",
    },
  });

  // Domains
  caseData.indicators.domains.forEach((d, i) => {
    const id = `domain-${i}`;
    nodes.push({
      id,
      data: { label: d.value },
      position: { x: 60 + i * 220, y: 100 },
      style: {
        background: "var(--bg-surface-2)",
        color: "var(--text-primary)",
        border: `1px solid ${riskColorVar(d.risk)}`,
        borderRadius: 6,
        fontSize: 11,
        fontFamily: "var(--font-mono)",
      },
    });
    edges.push({ id: `e-sender-${id}`, source: "sender", target: id, animated: false, style: { stroke: riskColorVar(d.risk) } });
  });

  // IPs
  caseData.indicators.ips.forEach((ip, i) => {
    const id = `ip-${i}`;
    nodes.push({
      id,
      data: { label: ip.value },
      position: { x: 60 + i * 220, y: 220 },
      style: {
        background: "var(--bg-surface-2)",
        color: "var(--text-primary)",
        border: `1px solid ${riskColorVar(ip.risk)}`,
        borderRadius: 6,
        fontSize: 11,
        fontFamily: "var(--font-mono)",
      },
    });
    const parentId = caseData.indicators.domains[i] ? `domain-${i}` : "sender";
    edges.push({ id: `e-${parentId}-${id}`, source: parentId, target: id, style: { stroke: riskColorVar(ip.risk) } });
  });

  // URLs
  caseData.indicators.urls.forEach((u, i) => {
    const id = `url-${i}`;
    const short = u.value.length > 36 ? u.value.slice(0, 36) + "…" : u.value;
    nodes.push({
      id,
      data: { label: short },
      position: { x: 60 + i * 260, y: 340 },
      style: {
        background: "var(--bg-surface-2)",
        color: "var(--text-primary)",
        border: `1px solid ${riskColorVar(u.risk)}`,
        borderRadius: 6,
        fontSize: 10,
        fontFamily: "var(--font-mono)",
        maxWidth: 220,
      },
    });
    const parentDomain = caseData.indicators.domains[0];
    edges.push({ id: `e-domain-${id}`, source: parentDomain ? "domain-0" : "sender", target: id, style: { stroke: riskColorVar(u.risk) } });
  });

  // Attachments
  caseData.indicators.attachments.forEach((att, i) => {
    const id = `att-${i}`;
    nodes.push({
      id,
      data: { label: att.value },
      position: { x: 300 + i * 200, y: 460 },
      style: {
        background: "var(--bg-surface-2)",
        color: "var(--text-primary)",
        border: `1px solid ${riskColorVar(att.risk)}`,
        borderRadius: 6,
        fontSize: 11,
        fontFamily: "var(--font-mono)",
      },
    });
    edges.push({ id: `e-sender-${id}`, source: "sender", target: id, style: { stroke: riskColorVar(att.risk) } });
  });

  return { nodes, edges };
}

const WEIGHT_COLOR: Record<string, string> = {
  high: "var(--risk-critical)",
  medium: "var(--risk-medium)",
  low: "var(--risk-low)",
};

export function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { data: caseData, isLoading, error } = useCase(caseId);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  if (isLoading) {
    return <div className="page-loading" aria-busy="true" aria-label="Loading case…"><div className="page-loading__spinner" /></div>;
  }

  if (error || !caseData) {
    return (
      <div className="page-error" role="alert">
        <AlertTriangle size={20} />
        <p>Case not found or failed to load. <button className="link" onClick={() => navigate("/cases")}>Back to cases</button></p>
      </div>
    );
  }

  const { nodes, edges } = useMemo(() => buildGraph(caseData), [caseData]);
  const firstHop = caseData.receivedPath[0];

  async function handleAction(action: "confirm" | "mark_safe" | "needs_review") {
    setSubmitting(true);
    await submitAnalystAction(caseData!.caseId, { action, note });
    setActionDone(action);
    setSubmitting(false);
  }

  async function handleGenerateReport() {
    setReportGenerating(true);
    await generateReport(caseData!.caseId);
    setReportGenerating(false);
    navigate("/reports");
  }

  return (
    <div className="page case-detail-page">
      {/* Header row */}
      <div className="case-header">
        <div className="case-header__left">
          <button
            className="case-header__back"
            onClick={() => navigate("/cases")}
            aria-label="Back to cases list"
          >
            <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
            Cases
          </button>
          <div className="case-header__id">
            <span className="case-header__case-id">{caseData.caseId}</span>
            <SeverityBadge severity={caseData.severity} />
            <StatusBadge status={caseData.status} />
          </div>
          <p className="case-header__subject">{caseData.subject ?? caseData.classification}</p>
        </div>
        <div className="case-header__right">
          <div className="risk-gauge" aria-label={`Risk score: ${caseData.riskScore} out of 100`}>
            <svg viewBox="0 0 80 80" className="risk-gauge__svg" aria-hidden="true">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke={riskColorVar(caseData.severity)}
                strokeWidth="6"
                strokeDasharray={`${(caseData.riskScore / 100) * 213.6} 213.6`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div className="risk-gauge__value" style={{ color: riskColorVar(caseData.severity) }}>
              {caseData.riskScore}
            </div>
          </div>
          <div className="case-header__meta">
            <span className="case-header__classification">{caseData.classification}</span>
            <span className="case-header__confidence">{Math.round(caseData.confidence * 100)}% confidence</span>
          </div>
        </div>
      </div>

      {/* Why flagged */}
      <Card className="case-section">
        <CardHeader>
          <CardTitle>
            <AlertTriangle size={15} aria-hidden="true" />
            Why AETHON flagged this
          </CardTitle>
        </CardHeader>
        <CardBody>
          <ul className="explanation-list">
            {caseData.explanation.map((item, i) => (
              <li key={i} className="explanation-item">
                <span
                  className="explanation-item__dot"
                  style={{ background: WEIGHT_COLOR[item.weight] }}
                  aria-label={`${item.weight} weight signal`}
                />
                <span className="explanation-item__signal">{item.signal}</span>
                <span className="explanation-item__weight">{item.weight}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {/* Evidence cards */}
      <Card className="case-section">
        <CardHeader>
          <CardTitle>
            <Shield size={15} aria-hidden="true" />
            Evidence
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="evidence-grid">
            {caseData.indicators.domains.map((d) => (
              <EvidenceCard key={d.value} type="domain" value={d.value} risk={d.risk} note={d.note} />
            ))}
            {caseData.indicators.urls.map((u) => (
              <EvidenceCard key={u.value} type="url" value={u.value} risk={u.risk} />
            ))}
            {caseData.indicators.ips.map((ip) => (
              <EvidenceCard key={ip.value} type="ip" value={ip.value} risk={ip.risk} />
            ))}
            {caseData.indicators.attachments.map((att) => (
              <EvidenceCard key={att.value} type="attachment" value={att.value} risk={att.risk} />
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Authentication */}
      <Card className="case-section">
        <CardHeader>
          <CardTitle>
            <Shield size={15} aria-hidden="true" />
            Email authentication
          </CardTitle>
        </CardHeader>
        <CardBody>
          <AuthResultChips
            spf={caseData.authentication.spf}
            dkim={caseData.authentication.dkim}
            dmarc={caseData.authentication.dmarc}
          />
          <div className="received-path">
            <h4 className="received-path__title">Received path</h4>
            <ol className="received-path__list">
              {caseData.receivedPath.map((hop) => (
                <li key={hop.hop} className="received-path__hop">
                  <span className="received-path__hop-num">{hop.hop}</span>
                  <div className="received-path__hop-body">
                    <code className="received-path__ip">{hop.ip}</code>
                    {hop.server && <span className="received-path__server">{hop.server}</span>}
                    <span className="received-path__geo">
                      {hop.geo.city ? `${hop.geo.city}, ` : ""}{hop.geo.country ?? "Unknown"} · ~{hop.geo.accuracyRadiusKm} km
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </CardBody>
      </Card>

      {/* Evidence graph */}
      <Card className="case-section">
        <CardHeader>
          <CardTitle>
            <Network size={15} aria-hidden="true" />
            Evidence graph
          </CardTitle>
        </CardHeader>
        <CardBody className="evidence-graph-body">
          <div className="evidence-graph" aria-label="Interactive evidence relationship graph">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              proOptions={{ hideAttribution: true }}
              nodesDraggable={false}
            >
              <Background color="var(--border-subtle)" gap={20} size={1} />
              <Controls showInteractive={false} />
              <MiniMap
                nodeColor={(n) => n.style?.border?.toString().match(/#\w+|var\([^)]+\)/)?.[0] ?? "#888"}
                maskColor="rgba(10,14,20,0.8)"
                style={{ background: "var(--bg-surface-2)" }}
              />
            </ReactFlow>
          </div>
        </CardBody>
      </Card>

      {/* Geolocation */}
      {firstHop && (
        <Card className="case-section">
          <CardHeader>
            <CardTitle>
              <MapPin size={15} aria-hidden="true" />
              Geolocation — hop 1 origin
            </CardTitle>
          </CardHeader>
          <CardBody className="geomap-body">
            <GeoMap geo={firstHop.geo} label={`Hop 1: ${firstHop.ip}`} />
          </CardBody>
        </Card>
      )}

      {/* Timeline */}
      <Card className="case-section">
        <CardHeader>
          <CardTitle>
            <Clock size={15} aria-hidden="true" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardBody>
          <ol className="timeline">
            {caseData.timeline.map((event, i) => (
              <li key={i} className="timeline__event">
                <div className="timeline__dot" aria-hidden="true" />
                <time className="timeline__time" dateTime={event.time}>
                  {formatTimestamp(event.time)}
                </time>
                <span className="timeline__label">{event.event}</span>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>

      {/* Analyst actions */}
      <Card className="case-section">
        <CardHeader>
          <CardTitle>
            <FileText size={15} aria-hidden="true" />
            Analyst actions
          </CardTitle>
        </CardHeader>
        <CardBody>
          {actionDone ? (
            <p className="action-done" role="status">
              Action recorded: <strong>{actionDone.replace("_", " ")}</strong>
            </p>
          ) : (
            <>
              <div className="analyst-actions">
                <Button variant="danger" size="sm" onClick={() => handleAction("confirm")} disabled={submitting} loading={submitting}>
                  Confirm suspicious
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleAction("mark_safe")} disabled={submitting}>
                  Mark as safe
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleAction("needs_review")} disabled={submitting}>
                  Needs review
                </Button>
              </div>
              <div className="analyst-note">
                <label htmlFor="analyst-note-input" className="input-group__label">
                  Analyst notes
                </label>
                <textarea
                  id="analyst-note-input"
                  className="analyst-note__textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add investigation notes, context, or escalation details…"
                  rows={4}
                />
              </div>
            </>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateReport}
            disabled={reportGenerating}
            loading={reportGenerating}
            className="analyst-generate-btn"
          >
            Generate report
          </Button>
        </CardBody>
      </Card>

      {/* Analyst notes history */}
      {caseData.notes.length > 0 && (
        <Card className="case-section">
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardBody>
            {caseData.notes.map((n, i) => (
              <div key={i} className="note-item">
                <div className="note-item__header">
                  <span className="note-item__author">{n.author}</span>
                  <time className="note-item__time" dateTime={n.createdAt}>{formatDateTime(n.createdAt)}</time>
                </div>
                <p className="note-item__text">{n.text}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
