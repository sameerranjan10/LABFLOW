# LabFlow Backend REST API & Diagnostic Database

Dedicated backend server for **LabFlow LIMS & Diagnostic Operations Platform**.

## 🚀 Quick Start

### 1. Run Backend Server
No dependencies or heavy build steps needed — runs with native Node.js:
```bash
cd backend
npm start
# or directly:
node src/server.js
```
The server will start on **port 5000** (or `PORT` environment variable):
- Base URL: `http://localhost:5000`
- Health Check: `http://localhost:5000/api/health`

### 2. Run API Tests
```bash
npm test
# or:
node test/api-test.js
```

---

## 📡 REST API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | API status & endpoint directory |
| `GET` | `/api/health` | System health check & database record counts |
| `GET` | `/api/db/status` | Database file size, path, and version status |
| `GET` | `/api/orders` | Query laboratory orders (filter: `?stage=...`, `?priority=...`) |
| `POST` | `/api/orders` | Accession a new test order and generate barcode sample |
| `GET` | `/api/samples` | List specimen custody records (filter: `?stage=...`, `?barcode=...`) |
| `PATCH` | `/api/samples` | Advance sample stage (`COLLECTED` → `RECEIVED` → `PROCESSING` → `REVIEW` → `RELEASED`) or reject |
| `GET` | `/api/results` | Fetch diagnostic test parameters & values |
| `POST` | `/api/results` | Pathologist sign-off & digital verification |
| `GET` | `/api/reports` | Retrieve laboratory diagnostic reports |
| `POST` | `/api/reports` | Digitally sign and release diagnostic report |
| `GET` | `/api/reports/email` | View parent/guardian email delivery history |
| `POST` | `/api/reports/email` | **Email diagnostic report to parent** (configured for `niteshnemalpuri17@gmail.com`) |
| `GET` | `/api/alerts` | List operational and critical turnaround alerts |
| `POST` | `/api/alerts` | Acknowledge and dismiss operational alert |
| `GET` | `/api/team` | Staff roster & active personnel |
| `POST` | `/api/team` | Add staff member or update duty status (`Active`, `On Break`, `Offline`) |
| `GET` | `/api/settings` | Laboratory configuration, test catalog & collection centers |
| `POST` | `/api/settings` | Update test catalog panels or collection center info |
| `GET` | `/api/audit` | 21 CFR Part 11 electronic audit trail logs |

---

## 💾 Database Architecture

- **Path**: `backend/data/labflow_db.json`
- **Engine**: Persistent JSON file store with auto-timestamping and 21 CFR Part 11 compliant audit trail logging.
- **Collections**:
  - `orders`: Patient requisitions and priority status.
  - `samples`: Barcode specimen tracking and chain of custody timelines.
  - `results`: Clinical parameters (CBC, DLC, Metabolic, Lipid profile).
  - `reports`: Doctor verified diagnostic reports.
  - `sentEmails`: Logged dispatches to parent/guardian (`niteshnemalpuri17@gmail.com`).
  - `alerts`: STAT turnaround warnings and specimen rejection events.
  - `team`: Lab staff roster and active status.
  - `settings`: NABL/CAP accreditation, test pricing catalog, collection centers.
  - `auditLogs`: Tamper-evident immutable operational audit events.
