# LabFlow Enterprise Architecture, State Machine & Security Blueprint

**Document Version:** 3.2.0-Production  
**Platform:** LabFlow Universal Diagnostic Laboratory Operations & Sample Coordination Platform  
**Compliance Standard:** ISO 15189:2022 • NABL Medical Laboratories • 21 CFR Part 11 • ABDM / HL7 FHIR R4  
**Classification:** Technical Architecture & Regulatory Security Specification (Phase 3 Submission)

---

## 1. Executive Architecture Overview

LabFlow is architected as an **event-driven, multi-tier clinical laboratory information platform**. It decouples high-throughput specimen accessioning and instrument telemetry from heavy report rendering and asynchronous notification dispatch.

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Presentation Layer (Next.js 15 App Router)"]
        UI_Phleb["Phlebotomy & Collection Portal\n(Mobile / Tablet)"]
        UI_Bench["Laboratory Workbench & QC\n(Desktop Workstation)"]
        UI_Path["Pathology Sign-Off Queue\n(High-Res Clinical Display)"]
        UI_Patient["Patient & Guardian Portal\n(Responsive Mobile View)"]
    end

    subgraph APIGateway ["Edge & API Routing Layer"]
        GW["Next.js Route Handlers / REST Gateway\n(Rate Limiting • JWT Auth • Idempotency Guard)"]
        RBAC["RBAC & Role Guard Middleware\n(Admin • Doctor • Pathologist • Tech • Phleb • Patient)"]
    end

    subgraph CoreEngine ["Core Laboratory Execution Layer"]
        SM["Specimen State-Machine Engine\n(Custody Validation • Invariant Enforcement)"]
        QC["Westgard Multirule QC Engine\n(1-2s • 1-3s • 2-2s Statistical Analysis)"]
        CDSS["Clinical Decision Support System\n(Adversarial Drafter/Auditor • Drug Interaction)"]
        AUDIT["Immutable Audit Trail Engine\n(21 CFR Part 11 Append-Only Ledger)"]
    end

    subgraph AsyncBroker ["Asynchronous Message & Queue Broker (BullMQ / Redis)"]
        Q_Telemetry["analyzer-telemetry-queue\n(10 workers • 120 events/s)"]
        Q_PDF["pdf-render-queue\n(2 workers • Headless Engine)"]
        Q_Email["email-dispatch-queue\n(4 workers • Exponential Backoff)"]
        Q_WhatsApp["whatsapp-notify-queue\n(6 workers • Meta Cloud API)"]
        DLQ["Dead-Letter Queue (DLQ)\n(Failed Job Telemetry & Auto-Retry)"]
    end

    subgraph PersistenceLayer ["Persistent Storage & Data Fabric"]
        DB_JSON["Persistent LIMS Engine\n(src/data/labflow_db.json)"]
        DB_SQL["PostgreSQL / Supabase Fabric\n(Row-Level Security • Read Replicas)"]
        S3["Encrypted Object Store\n(AES-256 PDF Reports & Barcode Assets)"]
    end

    ClientLayer --> GW
    GW --> RBAC
    RBAC --> CoreEngine
    CoreEngine --> AsyncBroker
    CoreEngine --> PersistenceLayer
    AsyncBroker --> PersistenceLayer
    Q_Email -.->|Failure after 3 retries| DLQ
    Q_WhatsApp -.->|Failure after 3 retries| DLQ
```

---

## 2. Sample & Result Lifecycle State Machine

The laboratory specimen undergoes an immutable **7-stage linear chain of custody**, governed by strict transition invariants. Samples cannot skip stages, ensuring total pre-analytical and analytical integrity.

### 2.1 State-Machine Transition Rules & Invariants

```mermaid
stateDiagram-v2
    [*] --> ORDERED : Physician / Clinical Order Created

    ORDERED --> COLLECTED : Specimen Drawn & Barcoded (LBF-XXXXX)
    COLLECTED --> IN_TRANSIT : Courier Custody Transfer (GPS Timestamp)
    IN_TRANSIT --> RECEIVED : Accessioning Reception & Centrifugation Check

    state RECEIVED {
        [*] --> VisualInspection
        VisualInspection --> PreAnalyticalPassed : Tube Clear
        VisualInspection --> REJECTED : Hemolyzed / Clotted / Insufficient (QNS)
    }

    REJECTED --> ORDERED : Automated Redraw Requisition (ORD-REDRAW-XX)

    RECEIVED --> PROCESSING : Robotic Rack Load & Auto-Analyzer Aspiration
    
    state PROCESSING {
        [*] --> AnalyzerRun
        AnalyzerRun --> QC_Verification : Parameters Computed
        QC_Verification --> RecheckRequired : Out-of-Range Sensor Drift
        RecheckRequired --> AnalyzerRun : Analyzer Rerun
        QC_Verification --> BenchReview : Valid Within Westgard ±2SD
    }

    PROCESSING --> REVIEW : Transmit HL7/ASTM to Pathologist Worklist

    state REVIEW {
        [*] --> PathologistInspection
        PathologistInspection --> Approved : Medical Sign-Off & Attestation
        PathologistInspection --> RerunRequested : Clinical Redraw/Rerun
    }
    RerunRequested --> PROCESSING : Rerun Ingestion

    REVIEW --> RELEASED : Digital Signature Attached (Report Published)
    
    state RELEASED {
        [*] --> PDF_Generation : Headless Render (NABL/ISO)
        PDF_Generation --> Email_Dispatch : SMTP / SendGrid Pool
        PDF_Generation --> WhatsApp_Dispatch : Meta Cloud API Gateway
        PDF_Generation --> FHIR_Push : HL7 FHIR R4 Bundle Export
    }

    RELEASED --> [*]
```

### 2.2 Transition Invariant Matrix

| From Stage | To Stage | Allowed Operator | Mandatory Validation Checklist |
|---|---|---|---|
| `ORDERED` | `COLLECTED` | Collection Staff / Phlebotomist | Vacuum tube type verified (EDTA, Serum, Heparin, Fluoride). Barcode printed. |
| `COLLECTED` | `IN_TRANSIT` | Phlebotomist / Courier | Cold-chain temperature verified (2°C–8°C for whole blood). Ambient transport cooler sealed. |
| `IN_TRANSIT` | `RECEIVED` | Accessioning Technologist | Barcode optical scan match, tube volume verified ($\ge 2.0\text{ mL}$), specimen integrity checked. |
| `RECEIVED` | `REJECTED` | Accessioning Technologist | Rejection category selected (Gross Hemolysis, Fibrin Clot, QNS). Redraw requisition automatically spawned. |
| `RECEIVED` | `PROCESSING` | Laboratory Technologist | Pre-analytical centrifugation complete (3,500 RPM, 10m). Analyzer barcode rack loaded. |
| `PROCESSING` | `REVIEW` | Auto-Analyzer / Tech | Parameter values populated with standard units. Westgard multirules passed. |
| `REVIEW` | `RELEASED` | MD Pathologist | Critical panic limits verified. Pathologist electronic signature applied. |

---

## 3. Security Architecture & Threat Model

### 3.1 Role-Based Access Control (RBAC) Matrix

LabFlow implements zero-trust role segregation compliant with HIPAA and ABDM guidelines:

| Action / Resource | Administrator | MD Pathologist | Attending Doctor | Lab Technologist | Phlebotomist | Patient |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Create Lab Order** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Print Tube Barcode** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Centrifuge & Run Analyzer** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Verify & Sign Off Results** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Release Official PDF** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Inspect 21 CFR Audit Trail** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Simulate Chaos Scenarios** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Billing & Quotas** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **View Own Patient Report** | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |

### 3.2 STRIDE Threat Model & Mitigations

| Threat Class | Attack Vector | Potential Impact | LabFlow Defensive Mitigation |
|---|---|---|---|
| **Spoofing** | Adversary attempts unauthorized report sign-off posing as Pathologist. | Unverified medical reports released to public. | Cryptographic session tokens, server-side role verification, and electronic signature hash stored in audit log. |
| **Tampering** | Modification of test parameter values (e.g. altering Troponin I from 0.85 to 0.02). | Erroneous clinical diagnosis; patient harm. | Tamper-evident parameter snapshots; hash verification on report generation; immutable audit logging. |
| **Repudiation** | Pathologist denies having authorized an abnormal result. | Legal liability; compliance violation. | 21 CFR Part 11 compliant audit records capturing Pathologist identity, IP address, timestamp, and signed hash. |
| **Information Disclosure** | Interception of unencrypted patient reports in transit. | Breach of Protected Health Information (PHI). | TLS 1.3 encryption across all REST endpoints; AES-256 encryption on disk; automated PHI de-identification. |
| **Denial of Service** | Flooding of order creation API with duplicate requests. | Laboratory backlog; STAT turnaround-time delay. | Idempotency Key deduplication middleware (`Idempotency-Key` header) with 5-minute sliding window cache. |
| **Elevation of Privilege** | Phlebotomist attempts to approve results via direct API PATCH. | Unauthorized release of diagnostic data. | Strict server-side `RoleGuard` middleware denying mutations outside assigned RBAC permissions. |

---

## 4. Audit Strategy & Tamper-Evident Ledger

Every transactional event writes an append-only audit record into `db.auditLogs` conforming to **21 CFR Part 11** and **ISO 15189 §8.4**:

```typescript
interface AuditRecord {
  id: string;               // Unique transaction ID (e.g., AUD-1741648291000)
  timestamp: string;        // ISO 8601 UTC timestamp (e.g., 2026-09-11T04:20:00.000Z)
  action: string;           // Standardized clinical verb (e.g., RESULT_VERIFIED_SIGN_OFF)
  user: string;             // Authenticated practitioner name (e.g., Dr. Arvind Swaminathan)
  role: string;             // Operating role (e.g., Pathologist)
  details: string;          // Human and machine-readable description
  location?: string;        // Facility / Physical bench identifier
  checksum?: string;        // SHA-256 cryptographic hash of the record payload
}
```

---

## 5. Failure Scenarios, Edge Cases & Automated Recovery Matrix

LabFlow features an active **Resilience & Chaos Engineering Suite** (`/api/resilience`) validating 6 real-world failure modes:

| # | Failure Mode | Trigger / Symptom | Automated Defensive Response | Recovery Action |
|---|---|---|---|---|
| **1** | **Analyzer Sensor Drift** | Optical flow detector exceeds $\pm 2.5\text{ SD}$ on Sysmex XN-1000. | Ingestion queue halted. Pending specimens routed to backup workstation. Alert flagged `Critical`. | Optical prime sequence + 2-point recalibration restores analyzer to `RUNNING`. |
| **2** | **Pre-Analytical Rejection** | Gross in-vitro hemolysis (Index $> 500\text{ mg/dL}$) or clotted tube. | Tube marked `Rejected`. Rejection event logged in custody timeline. Automated redraw order (`ORD-REDRAW-...`) generated. | Phlebotomist dispatches new tube draw; original accessioning closed. |
| **3** | **Turnaround-Time Breach** | STAT test elapsed $73\text{m}$ against $45\text{m}$ SLA target. | Priority escalated to `STAT OVERDUE`. Tube moved to front of testing rack. Attending doctor alerted. | Bench supervisor expedites verification; SLA breach alert cleared. |
| **4** | **Duplicate Test Requisition** | Identical patient & test payload received within $5\text{m}$ window. | Idempotency guard intercepts request. Returns HTTP 409 Conflict. Zero duplicate charges created. | Request deduplicated; existing order requisition returned. |
| **5** | **Illegal State Jump** | Attempt to transition specimen directly from `ORDERED` to `RELEASED`. | State machine invariant blocks transaction. Throws HTTP 400 Invariant Violation. Security audit alert logged. | Request rejected. Specimen forced through standard clinical chain of custody. |
| **6** | **Notification Gateway Drop** | External SMTP server timeout ($421\text{ Connection timeout}$). | Job placed in Dead-Letter Queue (DLQ). Exponential backoff scheduled ($2\text{s}, 4\text{s}, 8\text{s}$). Alert generated. | Background worker auto-retries, or operator clicks *"Retry DLQ Job"* in UI. |

---

## 6. Asynchronous Messaging Queues & Worker Topology

To guarantee sub-second UI responsiveness, background workloads are decoupled using **BullMQ over Redis 7.2**:

```
[ LIMS API Event ] 
        │
        ├──> (Push Job) ──> [ Redis Queue Broker ]
                                   │
         ┌─────────────────────────┼─────────────────────────┬─────────────────────────┐
         ▼                         ▼                         ▼                         ▼
[ email-dispatch-queue ]  [ whatsapp-notify-queue ]  [ analyzer-telemetry-queue ]  [ pdf-render-queue ]
• Concurrency: 4          • Concurrency: 6           • Concurrency: 10             • Concurrency: 2
• Rate: 25 jobs/s         • Rate: 80 jobs/s          • Rate: 120 events/s          • Rate: 10 renders/s
• SendGrid / SMTP Pool    • Meta Cloud API Gateway   • Serial/ASTM TCP Bridge      • Headless Renderer
         │                         │                         │                         │
         └─────────────────────────┴─────────────────────────┴─────────────────────────┘
                                   │
                        (Failure after 3 retries)
                                   ▼
                       [ Dead-Letter Queue (DLQ) ]
                       • Exponential backoff (2s, 4s, 8s)
                       • Interactive UI re-dispatch hook
```

---

## 7. Deployment, Disaster Recovery & Scalability Strategy

### 7.1 Production Deployment Topology

```mermaid
graph TD
    User([End Users / Browsers / Mobile]) --> CDN[Cloudflare Edge CDN / WAF]
    CDN --> LB[Kubernetes Ingress / Application Load Balancer]
    
    subgraph K8s_Cluster ["Kubernetes Production Cluster (EKS / GKE)"]
        subgraph Frontend_Pods ["Frontend / API Web Tier (Autoscaling 3–20 Pods)"]
            Pod1[Next.js App Server 1]
            Pod2[Next.js App Server 2]
            Pod3[Next.js App Server N]
        end
        
        subgraph Worker_Pods ["Asynchronous Worker Tier (Autoscaling 2–15 Pods)"]
            W_Email[Email Worker Pool]
            W_WhatsApp[WhatsApp Worker Pool]
            W_PDF[PDF Render Worker Pool]
            W_Telemetry[ASTM Telemetry Worker]
        end

        subgraph Redis_Cluster ["In-Memory State & Queue Fabric"]
            Redis_Primary[(Redis 7.2 Primary)]
            Redis_Replica[(Redis Replica)]
        end
    end

    subgraph Data_Tier ["Managed Database Tier (Multi-AZ)"]
        PG_Primary[(PostgreSQL Primary - Read/Write)]
        PG_Replica[(PostgreSQL Read-Replica 1)]
        S3_Storage[(Encrypted S3 / Cloud Storage)]
    end

    LB --> Frontend_Pods
    Frontend_Pods --> Redis_Primary
    Frontend_Pods --> PG_Primary
    Frontend_Pods --> PG_Replica
    Worker_Pods --> Redis_Primary
    Worker_Pods --> PG_Primary
    Worker_Pods --> S3_Storage
```

### 7.2 Disaster Recovery Targets

| Metric | Target SLA | Strategy |
|---|---|---|
| **RPO (Recovery Point Objective)** | $< 1\text{ minute}$ | Synchronous multi-AZ database replication + automated point-in-time WAL archiving. |
| **RTO (Recovery Time Objective)** | $< 5\text{ minutes}$ | Containerized Kubernetes pod auto-restart + automated DNS failover to secondary region. |
| **System Uptime** | $99.99\%$ | Zero-downtime rolling updates, health probe liveness/readiness checks, automated circuit breakers. |
