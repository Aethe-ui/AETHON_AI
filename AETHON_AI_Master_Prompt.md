# AETHON AI — Frontend Master Prompt

> Paste this entire document as a single prompt to an AI assistant (Claude, etc.) whenever you want it to generate, extend, or fix any part of the AETHON AI frontend. It is the single source of truth for what the product is, how it should look, and how every screen and file should be structured. Keep it updated as decisions change — every future prompt should start from this file, not from memory.

---

## 1. What we are building

**AETHON AI** is the frontend for an AI-powered email threat detection, geolocation, and forensic intelligence platform (SIH 2026, PS ID 26106). It is used by SOC analysts and cyber security teams to:

1. Upload or paste a suspicious email (`.eml`, `.msg`, raw headers, or pasted text).
2. Watch it get parsed and analyzed (headers, sender, URLs, attachments, AI risk score).
3. Review an explainable verdict — not just "malicious," but *why*.
4. Investigate enriched evidence — IP/domain/URL reputation, geolocation with uncertainty, an evidence graph.
5. Turn the finding into a **case** with a timeline, analyst notes, and a shareable forensic report.

This is an **investigation console for professionals**, not a consumer inbox or a marketing site. Every design and copy decision should serve someone under time pressure trying to decide "is this real, and what do I do next."

## 2. Tech stack

```text
Framework:        React 19, TypeScript, Vite
Styling & UI:      Tailwind CSS, shadcn/ui, Radix UI, Lucide React,
                   class-variance-authority, clsx, tailwind-merge
Routing:           React Router
State management:  Zustand (client/UI state), TanStack Query (server/API state, caching, refetch)
API & realtime:    Axios, Socket.IO Client (live investigation-pipeline events)
Data viz:          Recharts (charts), React Flow (evidence graph)
Maps/geolocation:  Mapbox GL JS, react-map-gl
Forms/validation:  React Hook Form, Zod
Animation:         Framer Motion
Utilities:         date-fns, uuid
File handling:     react-dropzone
Notifications:     Sonner
Code quality:      ESLint, Prettier, TypeScript strict mode
Testing:           Vitest, React Testing Library, Playwright
Build/deploy:      Vite, Docker
```

- Single-page application with client-side routing (React Router), not separate `.html` files per screen.
- Tailwind + shadcn/ui + Radix for components; keep the design-token values from §3 as Tailwind theme extensions / CSS variables, not hardcoded hex values scattered through components.
- All server state (cases, dashboard stats, threat-intel lookups) goes through TanStack Query hooks calling the Axios client in `services/` — never `useEffect` + manual `fetch`. This gives free caching, loading/error states, and refetch-on-focus for an analyst tool where data can change mid-shift.
- Live investigation-pipeline progress (§5.3) is pushed over Socket.IO, not polled — the backend emits step-transition events as analysis runs; the frontend subscribes and updates pipeline UI state accordingly. Fall back to a single request/response if the backend doesn't yet support sockets, but design the component to accept either.
- The evidence graph (§5.4) is built with **React Flow**, not hand-rolled SVG — nodes for sender/domain/IP/URL/attachment, edges for relationships, laid out from the case's IOC list.
- The geolocation view (§5.4) uses **Mapbox GL JS** via `react-map-gl` — render the approximate marker plus a shaded accuracy-radius circle layer, never a precise pinpoint.
- **Important implementation rule:** the frontend never contains or runs any ML/threat-scoring logic — that lives entirely in the backend's Python AI/ML service. The frontend is strictly API-driven:
  ```text
  React Frontend → Axios/Socket.IO → Backend API → Python AI/ML Service → Trained Model
                                                                              ↓
  React Dashboard ← Backend ← Analysis Results ←───────────────────────────────
  ```
  Never hardcode a threat-analysis result, a risk score, or a verdict anywhere in frontend code — not even as a "temporary" default. Every value shown must come from a typed API response or an explicitly-labeled mock file (§8.3), so swapping mock data for the real backend never requires touching component code.
- Must be responsive down to a 375px-wide phone, but the primary target is a 1440px analyst desktop — this is a workstation tool, not a mobile app.

## 3. Visual identity (design brief)

Do not default to generic "AI dashboard" styling — no warm cream background with a terracotta accent, no all-black background with a single neon accent and rounded SaaS cards with identical drop shadows, no tracked-out ALL-CAPS eyebrow labels over every heading, no middle-dot-separated meta strings, no arrow glyphs tacked onto every button. AETHON should look like it was designed by people who actually work in a SOC: dense, calm, evidence-first, quietly serious.

**Reference feeling:** the control room of an incident response team at 2am — legible in low light, nothing decorative, every pixel either data or navigation.

### Color tokens

```css
:root {
  --bg-base:        #0A0E14;  /* near-black, slightly blue, not pure #000 */
  --bg-surface:     #121826;  /* card/panel surface */
  --bg-surface-2:   #1A2233;  /* nested panel / hover state */
  --border-subtle:  #232B3D;
  --border-strong:  #34405A;

  --text-primary:   #E7ECF5;
  --text-secondary: #9AA7BD;
  --text-muted:     #5E6B85;

  --accent-signal:  #3FD0C9;  /* cyan — primary interactive accent, used sparingly */
  --accent-signal-dim: #1F6E68;

  --risk-critical:  #E5484D;
  --risk-high:      #F2994A;
  --risk-medium:    #E0B341;
  --risk-low:       #3FBF7F;
  --risk-info:      #5E8CE0;
}
```

Cyan is the *interactive* color (links, active nav, primary buttons, focus rings) — it should never be used for a threat severity. Severity always uses the red→orange→yellow→green scale above, applied consistently everywhere (badges, graph nodes, chart bars, timeline dots) so a color always means the same risk level throughout the app.

### Typography

- **UI text (headings, body, nav, buttons):** `Inter` or `IBM Plex Sans` — pick one and use it everywhere for UI chrome. Weight range 400–600; avoid heavy 700+ except a single hero number on the AI Verdict screen.
- **Technical/evidence text (IPs, hashes, domains, header dumps, case IDs, timestamps):** `IBM Plex Mono` or `JetBrains Mono`. This is a functional distinction, not decoration — it tells the analyst "this is raw evidence, copy it exactly" versus "this is UI."
- Base body size 14–15px (this is a data-dense professional tool, not a landing page). Line length under ~80 characters in text-heavy panels (notes, report preview).
- No single-word-in-italic headline accents, no all-caps section labels as a default reflex — use sentence case, and reserve caps only for true status codes (e.g., a severity chip like `CRITICAL`) where caps is itself meaningful signal.

### Layout concept

```
┌───────────────────────────────────────────────────────────────┐
│ AETHON   [search]                              🔔  case:AE-042│ ← 56px topbar
├───────────┬───────────────────────────────────────────────────┤
│ Dashboard │                                                   │
│ Investigate│                MAIN CONTENT                      │
│ Threat Intel│              (12-col grid, 24px gutter)         │
│ Cases     │                                                   │
│ Reports   │                                                   │
│ Settings  │                                                   │
└───────────┴───────────────────────────────────────────────────┘
  220px fixed sidebar, collapsible to icon-only at <1024px
```

Left-aligned content, not centered — this is a working tool with persistent navigation, not a marketing page. Panels use a single consistent border-radius (6–8px) and a single consistent border treatment (`1px solid var(--border-subtle)`); avoid mixing shadow styles and radii across cards.

**Motion:** one deliberate moment — the investigation pipeline (§5.3) animating step by step as analysis runs — plus functional transitions (panel expand/collapse, toast in/out). No fade-slide-up entrance on every card; no hover animation on every element "because it's there."

## 4. Information architecture

```
AETHON AI
├── Login                          (/login)
├── Dashboard                      (/)
│   ├── KPI strip (emails analyzed, threats detected, critical, open cases)
│   ├── Threat detection trend (chart)
│   ├── Threat category breakdown (chart)
│   └── Recent investigations (table/list)
├── Investigate                    (/investigate)
│   ├── Upload / paste email
│   ├── Investigation pipeline (live progress via Socket.IO)
│   └── → navigates to Case Detail on completion
├── Case Detail                    (/cases/:caseId)
│   ├── Risk score + classification + confidence
│   ├── AI explanation ("why flagged")
│   ├── Evidence panel (sender, domain, URL, attachment cards)
│   ├── Header / auth results (SPF/DKIM/DMARC, Received path)
│   ├── Evidence graph (React Flow: sender–domain–IP–URL relationships)
│   ├── Geolocation map (Mapbox, with confidence/accuracy radius)
│   ├── Timeline
│   ├── Analyst notes + verify/override/escalate controls
│   └── Generate report
├── Threat Intelligence            (/threat-intel)
│   └── Search IP / domain / URL / hash → reputation, ASN, related cases
├── Cases                          (/cases)
│   └── Filterable table of all cases by status/severity/date
├── Reports                        (/reports)
│   └── List of generated reports, export as PDF
└── Settings                       (/settings)
    └── User/role management, API key config (admin only)
```

Every route except Login renders inside a shared `<AppShell>` layout (topbar + sidebar) via a React Router layout route — build it once in `components/layout/` and nest all protected routes under it (see §7), rather than repeating the shell per page.

## 5. Screen-by-screen behavior

### 5.1 Login
Single centered card on the base background. Fields: email, password, validated with React Hook Form + Zod. On submit, call `POST /api/auth/login` via the Axios service, store the returned token (see §8.2), navigate to `/` with React Router. Show inline error text on failure — no browser `alert()`.

### 5.2 Dashboard
- KPI strip: 4 stat cards (Emails Analyzed, Threats Detected, Critical Threats, Open Cases), each with a small trend indicator.
- Two charts side by side on desktop, stacked on mobile: detection trend over time (line), threat category breakdown (bar or donut).
- Recent investigations: last 5–8 cases as a compact list, each row clickable to Case Detail, with a severity-colored left border matching the risk scale.

### 5.3 Investigate
- Drop zone built with **react-dropzone** for `.eml`/`.msg`/`.txt`, plus a "paste raw email" textarea toggle.
- On submit, `POST /api/emails/analyze` (multipart, via Axios) kicks off analysis; subscribe to a Socket.IO room keyed by the new case ID and animate the step-by-step pipeline (Parsing → Header Analysis → Sender Intelligence → URL Analysis → Attachment Analysis → AI Threat Assessment) as `pending → running → done` events arrive. Use Framer Motion for the one deliberate step-transition animation (§3).
- On completion, navigate to `/cases/:caseId` with React Router.

### 5.4 Case Detail
- Header row: case ID, classification, status chip, severity chip, risk score as a large number with a ring/gauge.
- "Why AETHON flagged this" — a checklist of the top contributing signals (not a black-box label).
- Evidence cards: Sender, Domain, URL, Attachment — each with a risk tag and the specific finding (e.g., "92% visual similarity to paypal.com").
- Authentication results: SPF/DKIM/DMARC as pass/fail chips; Received path as an ordered hop list, each hop showing IP → geolocation (approximate) → server.
- Evidence graph: **React Flow** node-link diagram (sender, domain, IP(s), URL(s), attachment) generated from the case's `indicators` object — layout algorithm can be a simple radial/tree arrangement; nodes colored by risk (§3).
- Geolocation: **Mapbox GL JS** (via `react-map-gl`) showing an approximate marker with a shaded accuracy-radius circle layer and a "Country / Region / City / Confidence" readout — never render a pinpoint marker as if it were an exact address.
- Timeline: vertical list of timestamped events.
- Analyst actions: Confirm suspicious / Mark safe / Needs review, a notes textarea, and "Generate report."

### 5.5 Threat Intelligence
Single search bar (accepts IP, domain, URL, or hash — detect the type client-side), result panel showing reputation score, ASN/country, first/last seen, and related case count, each linking back to relevant cases.

### 5.6 Cases
Table with columns: Case ID, Subject/summary, Severity, Status, Analyst, Date. Filters for severity and status. Row click → Case Detail.

### 5.7 Reports
List of generated reports with case ID, date, and a "Download PDF" / "View" action. The backend produces the PDF; the frontend just requests and links to it.

## 6. Data model reference (match backend response shapes exactly)

Define every resource as a **Zod schema** in `schemas/`, infer the TypeScript type from it, and use the schema to validate/parse every API response at the network boundary (in the `services/` Axios call or a TanStack Query `select`). This means a malformed or changed backend response fails loudly during development instead of silently rendering `undefined` in the UI.

```ts
// schemas/case.ts
import { z } from "zod";

export const CaseSeverity = z.enum(["low", "medium", "high", "critical"]);
export const CaseStatus = z.enum(["open", "needs_review", "confirmed", "closed"]);

export const GeoSchema = z.object({
  country: z.string().nullable(),
  city: z.string().nullable(),
  confidence: z.enum(["low", "medium", "high"]),
  accuracyRadiusKm: z.number(),
});

export const CaseSchema = z.object({
  caseId: z.string(),
  status: CaseStatus,
  severity: CaseSeverity,
  riskScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  classification: z.string(),
  createdAt: z.string().datetime(),
  analyst: z.string().nullable(),
  explanation: z.array(z.object({ signal: z.string(), weight: z.enum(["low", "medium", "high"]) })),
  authentication: z.object({
    spf: z.enum(["pass", "fail", "none"]),
    dkim: z.enum(["pass", "fail", "none"]),
    dmarc: z.enum(["pass", "fail", "none"]),
  }),
  receivedPath: z.array(z.object({
    hop: z.number(),
    ip: z.string(),
    server: z.string().nullable(),
    geo: GeoSchema,
  })),
  indicators: z.object({
    domains: z.array(z.object({ value: z.string(), risk: CaseSeverity, note: z.string().optional() })),
    urls: z.array(z.object({ value: z.string(), risk: CaseSeverity })),
    ips: z.array(z.object({ value: z.string(), risk: CaseSeverity })),
    attachments: z.array(z.object({ value: z.string(), risk: CaseSeverity })),
  }),
  timeline: z.array(z.object({ time: z.string(), event: z.string() })),
  notes: z.array(z.object({ author: z.string(), text: z.string(), createdAt: z.string() })),
});

export type Case = z.infer<typeof CaseSchema>;
```

Create the equivalent for `DashboardStats`, `ThreatIntelResult`, and `Report` in the same `schemas/` folder. Every hook in `hooks/` and every component prop type in `types/` should reference these inferred types — never redeclare a shape ad hoc in a component file.

## 7. File/folder structure to generate

```
aethon-frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── dashboard/       # StatCard, TrendChart, CategoryChart, RecentCasesList
│   │   ├── email/           # UploadDropzone, PasteEmailForm
│   │   ├── threat/          # ReputationPanel, IOCSearchBar
│   │   ├── investigation/   # PipelineStepper, EvidenceCard, AuthResultChips
│   │   ├── analytics/       # (future) trend/analytics widgets
│   │   ├── maps/            # GeoMap (Mapbox wrapper)
│   │   └── layout/          # AppShell, Topbar, Sidebar
│   ├── pages/
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Investigate/
│   │   ├── CaseDetail/
│   │   ├── ThreatIntelligence/
│   │   ├── Cases/
│   │   ├── Reports/
│   │   └── Settings/
│   ├── hooks/               # useCases(), useCase(id), useDashboardStats(), useThreatIntel(query)
│   ├── stores/              # Zustand: authStore, uiStore (sidebar collapsed, active filters)
│   ├── services/            # Axios instance + one file per resource: caseService.ts, authService.ts...
│   ├── api/                 # raw endpoint path constants, shared request/response typing helpers
│   ├── types/               # types re-exported/derived from schemas/ for component props
│   ├── schemas/             # Zod schemas (§6) — the single source of truth for shapes
│   ├── utils/               # formatDate, riskColor(severity), classNames helpers
│   ├── lib/                 # socket.ts (Socket.IO client setup), mapbox.ts config
│   ├── routes/              # React Router route tree, protected-route wrapper
│   ├── App.tsx
│   └── main.tsx
├── mock/
│   ├── dashboard.json
│   ├── case.json
│   ├── cases.json
│   └── threat-intel.json
├── public/
│   └── icons/               # static SVG assets
├── .env.example             # VITE_API_BASE_URL, VITE_MAPBOX_TOKEN, VITE_SOCKET_URL
├── tailwind.config.ts
├── vite.config.ts
└── Dockerfile
```

## 8. Backend integration contract

### 8.1 Endpoints (align with the FastAPI backend)
```
POST   /api/auth/login
POST   /api/emails/analyze
GET    /api/investigations
GET    /api/investigations/:id
GET    /api/threat-intel/ip/:ip
GET    /api/threat-intel/domain/:domain
GET    /api/threat-intel/url
GET    /api/dashboard/stats
POST   /api/reports/generate
GET    /api/reports
```
Plus a Socket.IO channel emitting pipeline-step events during `/api/emails/analyze` processing (event name and payload shape to be confirmed with the backend team — document it here once agreed, e.g. `investigation:step` → `{ caseId, step, status }`).

### 8.2 Auth
Store the JWT returned by `/api/auth/login` in a **Zustand `authStore`** backed by `sessionStorage` (not `localStorage`, so it clears when the analyst closes the tab — appropriate for a security tool). A single Axios instance in `services/apiClient.ts` attaches `Authorization: Bearer <token>` via a request interceptor reading from `authStore`. A response interceptor catches 401s, clears the store, and redirects to `/login` via the router.

### 8.3 Mock-to-live switch
`.env` exposes:
```
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-backend.example.com
VITE_SOCKET_URL=https://your-backend.example.com
VITE_MAPBOX_TOKEN=pk.xxxxx
```
Every `services/*.ts` function checks `import.meta.env.VITE_USE_MOCK` and, when true, resolves from the matching `/mock/*.json` file instead of calling Axios — parsed through the same Zod schema either way, so a component never knows or cares which source it's getting data from. No component or hook should import Axios or read `import.meta.env` directly; everything goes through `services/` and `hooks/`.

### 8.4 Typed API layer discipline
Every `services/` function has an explicit input type and returns a Zod-validated, schema-derived type from §6. TanStack Query hooks in `hooks/` wrap these calls and are the only thing components import — e.g. `const { data, isLoading, error } = useCase(caseId)`. This is what lets mock data be swapped for real backend responses (§8.3) without redesigning any UI, and is what prevents a hardcoded threat-analysis value from ever silently surviving into a component (§2).

## 9. Content and tone

Write for someone mid-investigation, not a first-time visitor. Use plain, specific language: "SPF authentication failed," not "Authentication anomaly detected." Buttons name the action they perform ("Generate report," "Mark as confirmed") and the resulting state uses the same word (a report list item that was just generated says "Generated," not "Complete"). Empty and error states explain what happened and what to do next ("No cases yet — analyze an email to create your first case" / "Threat intelligence lookup failed — retry or continue without enrichment"), never a bare "Error" or "No data."

## 10. Accessibility & quality floor

- Visible keyboard focus outline on every interactive element (use `--accent-signal` for the focus ring).
- Sufficient contrast for all text against `--bg-base`/`--bg-surface` (verify critical/high/medium/low colors pass contrast on dark backgrounds, adjusting lightness if needed — don't just use pure red/orange/yellow as-is).
- Respect `prefers-reduced-motion` — disable the pipeline step animation and swap to an instant state change.
- All severity/status information must not rely on color alone — always pair color with a text label or icon.

---

**How to use this prompt:** give an AI coding assistant this whole document plus "scaffold the Vite + React + TypeScript project per §2 and §7" for the first pass, then per feature: "build the `Dashboard` page — `pages/Dashboard/`, its `hooks/useDashboardStats.ts`, and `schemas/dashboardStats.ts` — using the mock data pattern from §8.3." It has everything needed to produce output consistent with every other screen. Repeat per page/feature, or ask for the whole first pass at once if the assistant's environment can produce multiple files in one turn.
