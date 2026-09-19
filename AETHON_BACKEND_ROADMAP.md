# AETHON AI — Backend Roadmap & Future Development Plan

**Project:** AETHON AI  
**Purpose:** Long-term backend roadmap, implementation status, deployment plan, and post-deployment evolution.

---

## 1. Current Backend Architecture

AETHON's backend is built around a FastAPI-based email investigation pipeline.

```text
                    ┌─────────────────────┐
                    │      .EML Input     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Email Parser      │
                    │ headers/body/files  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐     ┌──────────┐    ┌──────────────┐
        │ ML Model │     │ IOC/URL  │    │   Header     │
        │ Detection│     │ Analysis │    │  Forensics   │
        └────┬─────┘     └────┬─────┘    └──────┬───────┘
             │                │                  │
             │                ▼                  ▼
             │          ┌────────────┐    ┌──────────────┐
             │          │ URL Risk   │    │ Header Risk  │
             │          └─────┬──────┘    └──────┬───────┘
             │                │                  │
             └────────────────┼──────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │    Risk Engine      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Received Chain +    │
                    │ Timing Analysis     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Supabase       │
                    │ persistence/storage │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Investigation    │
                    │       APIs          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Frontend       │
                    └─────────────────────┘
```

---

# 2. Backend Roadmap

The backend roadmap is organized into implementation phases.

## 4.1 — Backend Foundation

**Status: COMPLETE**

Core backend foundation:

- FastAPI application
- Project configuration
- Environment configuration
- Supabase integration
- Database connectivity
- Authentication foundation
- API routing
- Service-layer architecture
- Basic application startup

---

## 4.2 — Email Request Contract & Parsing

**Status: COMPLETE**

Responsibilities:

- Accept `.eml` input
- Validate incoming requests
- Parse MIME email structure
- Extract sender
- Extract recipients
- Extract subject
- Extract body
- Extract headers
- Detect attachments
- Create email/case records

Primary goal:

> Convert an uploaded email into a structured representation that the rest of AETHON can analyze.

---

## 4.3 — Raw Email & Attachment Storage

**Status: COMPLETE / FUNCTIONAL**

Responsibilities:

- Preserve original email data
- Store uploaded email information
- Store attachments
- Calculate attachment hashes
- Maintain case/email relationships
- Store metadata required for investigation

Important principle:

> The original evidence should remain available for forensic investigation.

---

## 4.4 — Email Header Analysis

**Status: COMPLETE**

Implemented capabilities include:

- From extraction
- Reply-To extraction
- Return-Path extraction
- Authentication-Results parsing
- SPF result extraction
- DKIM result extraction
- DMARC result extraction
- Received-header extraction
- Header anomaly detection

Detected examples:

```text
from_reply_to_mismatch
from_return_path_mismatch
spf_failure
dkim_failure
dmarc_failure
```

---

# 3. IOC & URL Intelligence

## 4.5 — IOC Extraction

**Status: COMPLETE**

The backend extracts indicators including:

- URLs
- Domains
- IP addresses
- Email addresses

These indicators are persisted for investigation.

---

## 4.6 — URL / Domain / Header / Received-Chain Analysis

**Status: NEAR COMPLETE**

This phase has already been implemented and tested incrementally.

### 4.6.1 — URL Risk Analysis

Implemented:

- IP-based URL detection
- HTTP detection
- Suspicious keyword detection
- `@` symbol detection
- URL risk score
- URL risk level
- URL risk signals

Example signals:

```text
IP address used instead of a domain name
Unencrypted HTTP connection
URL contains @ symbol
Suspicious URL keywords
```

### 4.6.2 — URL Risk Integration

URL analysis is integrated into the main email-analysis pipeline.

---

### 4.6.3 — IOC Risk Integration

IOC information contributes to the overall case risk.

---

### 4.6.4 — Header Forensics

Header forensic analysis provides:

- Sender
- Reply-To
- Return-Path
- Authentication status
- Received chain
- Originating IP
- Header anomalies
- Forensic findings

---

### 4.6.5 — Header Risk Engine

Header anomalies are converted into a risk score.

Example scoring currently used by the service:

```text
from_reply_to_mismatch    20
from_return_path_mismatch 15
spf_failure               25
dkim_failure              25
dmarc_failure             30
```

The resulting score is normalized into a risk level.

---

### 4.6.6 — Received Chain Analysis

Implemented capabilities:

- Hop counting
- IP extraction
- Private/public IP classification
- Hostname extraction
- Originating IP identification
- Suspicious chain signals
- Timestamp extraction
- Hop delay calculation
- Suspicious timing detection

Example output:

```text
hop_count
hops
all_ips
all_hostnames
originating_ip
suspicious_signals
timing_analysis
```

---

### 4.6.7 — End-to-End Investigation Integration

**NEXT IMMEDIATE DEVELOPMENT STAGE**

The objective is to make all existing analysis modules consistently available through the primary email-analysis endpoint and persisted investigation data.

The final analysis response should expose:

```text
caseId

analysis:
    classification
    confidence
    isMalicious

    riskScore
    riskLevel
    riskComponents
    riskFactors

    headerRisk
    headerForensics
    receivedChainAnalysis
```

This phase should focus on:

- API consistency
- Persistence consistency
- Error handling
- Duplicate email/message handling
- Data-model consistency
- Frontend-compatible response contracts
- Regression testing

Do not rewrite already-working analysis modules unless a concrete integration problem is found.

---

# 4. Threat Intelligence

## 4.7 — Threat Intelligence & Reputation

**Status: REMAINING**

This phase enriches extracted indicators with external intelligence.

Potential targets:

- Domain reputation
- IP reputation
- URL reputation
- Malware/phishing intelligence
- WHOIS/domain metadata where available
- DNS information
- Threat feeds
- IOC confidence
- Reputation sources

The architecture should allow multiple intelligence providers.

Recommended abstraction:

```text
ThreatIntelProvider
        │
        ├── URL lookup
        ├── Domain lookup
        ├── IP lookup
        └── IOC enrichment
```

Important:

External APIs should not become hard dependencies for the basic email-analysis pipeline.

If an intelligence provider is unavailable, AETHON should still be able to complete local analysis.

---

# 5. Attachment Security

## 4.8 — Attachment Analysis

**Status: REMAINING**

Current backend can store attachments, but full attachment threat analysis is a later stage.

Potential capabilities:

- File-type validation
- MIME/type mismatch detection
- Hash calculation
- File-size checks
- Suspicious extension detection
- Archive inspection
- Malware scanning
- Static file analysis
- IOC extraction from supported files
- Attachment risk score

Future architecture:

```text
Attachment
    │
    ├── Metadata
    ├── Hash
    ├── Type validation
    ├── Static analysis
    └── Malware/reputation scan
             │
             ▼
       Attachment Risk
```

---

# 6. Case & Investigation Intelligence

## 4.9 — Case Intelligence

**Status: REMAINING / PARTIALLY PRESENT**

AETHON should evolve from an email analyzer into a complete investigation system.

A case should connect:

```text
Case
 │
 ├── Email
 │    ├── Headers
 │    ├── Body
 │    └── Attachments
 │
 ├── IOCs
 │    ├── URLs
 │    ├── Domains
 │    ├── IPs
 │    └── Emails
 │
 ├── Risk Analysis
 │
 ├── Header Forensics
 │
 ├── Received Chain
 │
 └── Threat Intelligence
```

Potential future functionality:

- Case timeline
- Investigation notes
- Case status
- Analyst decisions
- Evidence relationships
- IOC relationships
- Case history
- Investigation summary

---

# 7. Investigation APIs

## 4.10 — Investigation API Layer

**Status: REMAINING / PARTIALLY IMPLEMENTED**

The backend should expose complete APIs for the frontend.

Expected functionality:

### Case listing

```http
GET /api/investigations
```

### Case detail

```http
GET /api/investigations/{case_id}
```

### Case status

```http
PATCH /api/investigations/{case_id}
```

### Analysis

```http
POST /api/emails/analyze
```

Additional APIs may later cover:

```text
/dashboard
/threat-intel
/reports
/attachments
/iocs
```

Exact routes should follow the current frontend contract rather than introducing duplicate APIs.

---

# 8. Redis — POST-DEPLOYMENT

## 4.11 — Redis Integration

**Status: INTENTIONALLY DEFERRED**

Redis is **not required for the first deployment**.

AETHON's core analysis pipeline works without Redis.

Current deployment plan:

```text
AETHON
  │
  ├── FastAPI
  ├── Supabase
  ├── ML model
  └── Analysis services

Redis
  └── Added later
```

Redis can later provide:

### Caching

- Threat-intelligence responses
- Repeated URL lookups
- Repeated domain/IP reputation checks
- Dashboard statistics

### Rate limiting

Protect public APIs from excessive requests.

### Background jobs

Potentially handle:

- Threat-intelligence enrichment
- Attachment scanning
- Report generation
- Long-running investigations

### Temporary state

Useful for:

- Job status
- Progress tracking
- Short-lived analysis state

### Scaling

Redis can help when multiple backend workers or distributed processing are introduced.

**Decision:**

> Do not block deployment on Redis.

Redis will be implemented after the functional backend is deployed and the real performance requirements are known.

---

# 9. Authentication & Authorization Hardening

## 4.12 — Security Hardening

**Status: REMAINING**

The authentication foundation exists, but production hardening should include:

- User ownership checks
- Case ownership checks
- Email ownership checks
- Attachment access control
- Investigation authorization
- Proper JWT validation
- Resource-level authorization
- Input validation
- Upload limits
- File-size limits
- Request limits
- Secure error responses

Important rule:

> Authentication proves who the user is. Authorization determines what that user can access.

---

# 10. Error Handling & Reliability

## 4.13 — Production Error Handling

**Status: REMAINING**

Known classes of errors already encountered during development include:

### Duplicate message IDs

Example:

```text
duplicate key value violates unique constraint
emails_message_id_key
```

Future behavior should decide whether the API should:

- Return the existing case
- Reject duplicate submissions cleanly
- Generate a new message ID for test data

### Database type mismatch

Example:

```text
invalid input syntax for type integer
```

The application and database schema must agree on:

- risk scores
- confidence values
- timestamps
- IDs
- JSON fields

### General reliability

Add:

- Structured error responses
- Proper HTTP status codes
- Logging
- Validation
- Graceful external-service failure
- Database error handling
- Upload failure handling
- Transaction-aware operations where needed

---

# 11. Frontend Integration

## 4.14 — Backend ↔ Frontend Integration

**Status: REMAINING / PARTIALLY IMPLEMENTED**

The backend must match the current frontend rather than an older UI contract.

Integration areas:

```text
Dashboard
Investigations
Investigation Detail
Threat Intelligence
Reports
Email Analysis
Attachments
```

The goal is:

```text
Frontend
    │
    ▼
FastAPI
    │
    ▼
Analysis Services
    │
    ▼
Supabase / Storage / External Intelligence
```

No frontend page should depend on hardcoded fake analysis data once the integration phase is complete.

---

# 12. Testing

## 4.15 — Backend Testing

**Status: REMAINING**

Testing should happen at three levels.

### Unit tests

Test individual services:

```text
URL analyzer
IOC extractor
Header forensics
Header risk
Received chain
Timing analysis
Risk engine
ML service
```

### Integration tests

Test:

```text
EML
  ↓
/api/emails/analyze
  ↓
database
  ↓
complete response
```

### Edge cases

Test:

- Empty email
- Malformed `.eml`
- Missing headers
- Missing Authentication-Results
- Missing Received headers
- Multiple Received headers
- Private IP
- Public IP
- Suspicious URLs
- No URLs
- Duplicate message ID
- Multiple attachments
- Unsupported attachment
- Very large email
- Malformed MIME
- External service unavailable

---

# 13. Deployment

## 4.16 — Production Deployment

**Status: REMAINING**

Before production deployment:

### Configuration

- Production environment variables
- Secret management
- Supabase production project
- CORS configuration
- Allowed origins
- API configuration

### Application

- Production ASGI server
- Health endpoint
- Logging
- Error monitoring
- Request limits
- Upload limits

### Security

- HTTPS
- Secure authentication
- Authorization
- Storage policies
- Database policies
- No secrets in repository

### Operational

- Database backups
- Monitoring
- Deployment documentation
- Rollback strategy

---

# 14. Post-Deployment Roadmap

After the first stable deployment, development can continue in stages.

## Stage A — Stability

```text
Production feedback
       ↓
Bug fixes
       ↓
Error monitoring
       ↓
Performance measurements
       ↓
API improvements
```

---

## Stage B — Redis

Introduce Redis based on actual requirements.

```text
FastAPI
  │
  ├── Supabase
  │
  └── Redis
       ├── Cache
       ├── Rate limiting
       └── Background jobs
```

---

## Stage C — Advanced Threat Intelligence

Add richer enrichment:

```text
IOC
 │
 ├── Reputation
 ├── DNS
 ├── WHOIS
 ├── Threat feeds
 ├── Historical sightings
 └── Confidence
```

---

## Stage D — Advanced Attachment Analysis

Potential future capabilities:

- Sandboxing
- Malware scanning
- Archive analysis
- Macro detection
- Script detection
- File reputation
- Behavioral analysis

---

## Stage E — Investigation Graph

Build relationships between evidence:

```text
                 CASE
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
     EMAIL       IOC      ATTACHMENT
       │          │
       ▼          ▼
    HEADER     DOMAIN/IP
       │          │
       └────┬─────┘
            ▼
       THREAT ACTOR
       / CAMPAIGN
```

This can eventually become a major investigation feature of AETHON.

---

## Stage F — Automated Investigation

Long-term goal:

```text
Email
  ↓
Detection
  ↓
Evidence extraction
  ↓
Threat intelligence
  ↓
Risk correlation
  ↓
Timeline
  ↓
Case generation
  ↓
Analyst-ready investigation
```

The system should remain explainable: every major risk conclusion should be traceable to evidence.

---

# 15. Final Target Architecture

The long-term AETHON architecture can evolve toward:

```text
                         AETHON AI
                            │
                    ┌───────▼────────┐
                    │    FastAPI     │
                    └───────┬────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
      Analysis          Intelligence       Storage
      Services          Services           Services
          │                 │                 │
    ┌─────┼─────┐      ┌────┼────┐       ┌───┼────┐
    │     │     │      │    │    │       │   │    │
   ML    IOC   Header   URL  IP  Domain  DB Files Cases
    │     │     │      │    │    │
    └─────┴─────┴──────┴────┴────┘
                 │
                 ▼
             Risk Engine
                 │
                 ▼
          Investigation Layer
                 │
          ┌──────┴──────┐
          ▼             ▼
       Frontend       Reports
```

Later:

```text
                 ┌──────────────┐
                 │    Redis     │
                 │ cache/queue  │
                 └──────┬───────┘
                        │
                  ┌─────▼─────┐
                  │ FastAPI   │
                  └───────────┘
```

---

# 16. Development Priority

The practical order is:

```text
CURRENT
  │
  ▼
4.6.7  Finish end-to-end integration
  │
  ▼
4.7    Threat Intelligence
  │
  ▼
4.8    Attachment Security
  │
  ▼
4.9    Case Intelligence
  │
  ▼
4.10   Investigation APIs
  │
  ▼
4.12   Security / Authorization hardening
  │
  ▼
4.13   Error handling / reliability
  │
  ▼
4.14   Frontend integration
  │
  ▼
4.15   Testing
  │
  ▼
4.16   Deployment
  │
  ▼
🚀 FIRST PRODUCTION DEPLOYMENT
  │
  ▼
POST-DEPLOYMENT
  │
  ├── Redis
  ├── Advanced Threat Intel
  ├── Advanced Attachment Analysis
  ├── Investigation Graph
  ├── Background Processing
  └── Automated Investigation
```

---

# 17. Important Development Principle

AETHON should be developed incrementally.

Do **not** introduce infrastructure merely because it may be useful later.

The first production version should prioritize:

1. Correct analysis
2. Reliable persistence
3. Secure access
4. Complete investigation data
5. Frontend integration
6. Testing
7. Deployment stability

Then optimize.

**Redis is therefore deliberately deferred.**

The same principle applies to advanced threat intelligence, distributed processing, sandboxing, and other expensive infrastructure.

---

# 18. Current Milestone

At the time this roadmap was created:

```text
Core email ingestion             COMPLETE
ML phishing detection            COMPLETE
IOC extraction                   COMPLETE
URL risk analysis                COMPLETE
Header forensics                 COMPLETE
Header risk engine               COMPLETE
Received-chain analysis          COMPLETE
Timing analysis                  COMPLETE
Main analysis API                FUNCTIONAL
Supabase persistence             FUNCTIONAL

Next:
4.6.7 End-to-end integration
4.7   Threat Intelligence
4.8   Attachment Security
4.9   Case Intelligence
4.10  Investigation APIs
...
```

This document should be updated as each milestone is completed.

**Rule for future updates:** do not mark a component complete merely because code exists. Mark it complete after it has been integrated, tested, and verified through the actual AETHON API where applicable.
