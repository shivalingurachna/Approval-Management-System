# 🛡️ Approval Management System
### Enterprise Role-Based Authentication & Administrative Approval Portal

[![Live App](https://img.shields.io/badge/Live%20App-Online%20(Railway)-10b981?style=for-the-badge&logo=railway&logoColor=white)](https://approval-portal-production-9d74e9a4.up.railway.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shivalingurachna/Approval-Management-System)
[![Tech Stack](https://img.shields.io/badge/MERN-React%2019%20%7C%20Node%2024%20%7C%20Express%205%20%7C%20MongoDB-3b82f6?style=for-the-badge)](https://github.com/shivalingurachna/Approval-Management-System)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://github.com/shivalingurachna/Approval-Management-System)

> **🚀 Live Production Application:** [https://approval-portal-production-9d74e9a4.up.railway.app](https://approval-portal-production-9d74e9a4.up.railway.app)  
> **📦 GitHub Repository:** [https://github.com/shivalingurachna/Approval-Management-System](https://github.com/shivalingurachna/Approval-Management-System)

---

## 📸 Application Screenshots

### 1. Administration Console & Approval Workflow
The administrative dashboard allows privileged operators to review incoming user requests, monitor live status counters, and approve, decline, or revoke access with real-time feedback.

![Admin Console & Approvals](./docs/screenshots/admin-dashboard.svg)

---

### 2. Real-Time MongoDB Database Login Audit Logs
Every user and administrator login is automatically captured with client IP address, authenticated role, account status, and MongoDB server timestamp.

![Database Login Audit Logs](./docs/screenshots/login-logs.svg)

---

### 3. Role-Based Authentication & Registration Portal
Users can sign up for standard membership (automatically placed into `PENDING` review) or register designated administrative credentials.

![Auth & Registration Portal](./docs/screenshots/auth-portal.svg)

---

## 📊 Core Features & Workflow Charts

### 1. User Approval State Machine
Every standard user follows a strictly enforced lifecycle state machine:

```mermaid
stateDiagram-v2
    [*] --> PENDING: User Registers
    PENDING --> APPROVED: Admin Clicks "Accept"
    PENDING --> REJECTED: Admin Clicks "Reject"
    REJECTED --> APPROVED: Admin Clicks "Re-Approve"
    APPROVED --> REJECTED: Admin Clicks "Revoke Access"
    APPROVED --> LOGGED_IN: Successful Login (Writes Audit Log)
    PENDING --> LOGIN_BLOCKED: Login Denied ("Account Pending Approval")
    REJECTED --> LOGIN_BLOCKED: Login Denied ("Account Rejected")
```

---

### 2. Authentication & Authorization Security Flowchart
How incoming HTTP requests are processed through JWT authentication, role guards, and approval gates:

```mermaid
flowchart TD
    A["👤 User Submits Credentials (Email + Password)"] --> B["⚡ Express /api/auth/login"]
    B --> C["🔍 Query User in MongoDB"]
    C -->|User Not Found| D["❌ 400: Invalid Credentials"]
    C -->|User Found| E["🔐 Compare bcrypt Password Hash"]
    E -->|Hash Mismatch| D
    E -->|Hash Matches| F{"🛡️ Check Account Status"}
    F -->|PENDING| G["⚠️ 403: Account Pending Admin Approval"]
    F -->|REJECTED| H["🚫 403: Account Request Declined"]
    F -->|APPROVED| I["📜 Record Login in MongoDB 'loginlogs'"]
    I --> J["🎫 Generate Signed JWT Token"]
    J --> K{"👑 Check User Role"}
    K -->|ADMIN| L["⭐ Redirect: /admin (Admin Console & Logs)"]
    K -->|USER| M["🏠 Redirect: /home (Member Workspace)"]
```

---

### 3. Full-Stack System Architecture

```mermaid
graph LR
    subgraph Frontend["🎨 Frontend (React 19 + TypeScript + Vite)"]
        UI["Modern UI / Responsive Dashboard"]
        Store["Auth State (JWT Token / User Object)"]
        AxiosClient["Typed API Service Client"]
    end

    subgraph Backend["🚀 Backend (Node.js 24 + Express 5)"]
        Router["Express REST Routes"]
        AuthMiddleware["JWT Verification Middleware"]
        Controller["Auth & Admin Controllers"]
        Bcrypt["bcrypt Password Hasher"]
    end

    subgraph Database["🍃 Database (MongoDB Cloud / Local)"]
        UsersCol[("users Collection")]
        LogsCol[("loginlogs Collection")]
    end

    UI --> AxiosClient
    AxiosClient -->|"HTTP POST / GET + Bearer Token"| Router
    Router --> AuthMiddleware
    AuthMiddleware --> Controller
    Controller --> Bcrypt
    Controller -->|"Mongoose ODM"| UsersCol
    Controller -->|"Audit Logger"| LogsCol
```

---

## 🌟 Comprehensive Feature Matrix

| Feature | Description | Implementation Details |
| :--- | :--- | :--- |
| **Two-Tier Role Authentication** | Distinct permissions for `ADMIN` and `USER` roles. | Enforced via `authMiddleware.js` and JWT payload inspection. |
| **Approval Lifecycle** | Accounts transition between `PENDING`, `APPROVED`, and `REJECTED`. | Managed via `PATCH /api/admin/users/:id/status`. |
| **One-Click Authorization** | Instant `Accept`, `Reject`, `Re-Approve`, and `Revoke Access` controls. | Dedicated action buttons with optimistic UI updates. |
| **Live MongoDB Audit Trail** | Every successful login records name, email, role, status, IP, and timestamp. | Saved automatically into the `loginlogs` MongoDB collection. |
| **Interactive KPI Dashboard** | Live metric cards displaying counts for Pending, Approved, Rejected, and Total. | `GET /api/admin/stats` with instant card filters. |
| **Real-Time Directory Search** | Instant filter by user full name or email address. | Client-side reactive query pipeline. |
| **Security & Encryption** | Zero plain-text credentials; irreversible salted hashes. | `bcrypt.hash()` with 10 salt rounds + SHA-256 JWT tokens. |
| **Single-Service Cloud Deployment** | Frontend SPA and Backend API served from one container. | Express 5 static file server with client-side SPA fallback. |

---

## 🗄️ Database Schema Design

### 1. `users` Collection
```typescript
interface UserSchema {
  name: string;                   // User's full display name
  email: string;                  // Unique login identifier (lowercased)
  password: string;               // Salted bcrypt hash
  role: 'ADMIN' | 'USER';         // Access control tier
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; // Account authorization
  lastLogin?: Date;               // Most recent successful login timestamp
  createdAt: Date;                // Account creation timestamp
}
```

### 2. `loginlogs` Collection
```typescript
interface LoginLogSchema {
  userId: ObjectId;               // Reference to user document
  name: string;                   // User name snapshot
  email: string;                  // User email snapshot
  role: 'ADMIN' | 'USER';         // Role at login time
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; // Status at login time
  ipAddress: string;              // Client IP address (IPv4 / IPv6)
  loginAt: Date;                  // Indexed timestamp (loginAt: -1)
}
```

---

## 🔌 REST API Specification

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (`PENDING`) or admin (`APPROVED`) |
| `POST` | `/api/auth/login` | Public | Authenticate user, verify approval, write login log, return JWT |
| `GET` | `/api/auth/me` | Protected | Fetch currently authenticated user profile |

### Administrative Routes (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/admin/users` | Admin Only | List registered users with optional `?status=` query filter |
| `PATCH` | `/api/admin/users/:id/status` | Admin Only | Update user status (`APPROVED` or `REJECTED`) |
| `GET` | `/api/admin/stats` | Admin Only | Fetch aggregate counts for Pending, Approved, Rejected, Total |
| `GET` | `/api/admin/logs` | Admin Only | Retrieve real-time MongoDB login history ordered by latest |

---

## 💻 Local Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [MongoDB](https://www.mongodb.com/) (Local Community Server or MongoDB Atlas cloud URI)
- [Git](https://git-scm.com/)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/shivalingurachna/Approval-Management-System.git
cd Approval-Management-System
```

---

### Step 2: Install Dependencies
```bash
# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

---

### Step 3: Configure Environment Variables
Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/approval_system
JWT_SECRET=your_jwt_secret_key_here_min_64_chars
```

*(Optional: generate a cryptographic JWT secret using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)*

---

### Step 4: Run Locally

In Terminal 1 (Backend API):
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

In Terminal 2 (Frontend React App):
```bash
cd frontend
npm run dev
# Frontend running on http://localhost:5173
```

Open your browser to `http://localhost:5173`.

---

## ☁️ Production Deployment

This repository is pre-configured for automated cloud deployment on both **Railway** and **Render**:

### 1. Railway (Currently Active)
- **Production URL:** [https://approval-portal-production-9d74e9a4.up.railway.app](https://approval-portal-production-9d74e9a4.up.railway.app)
- **Deployment Type:** Full-Stack Node.js container with integrated MongoDB service linked over private networking.
- **CI/CD:** Pushing to the `main` branch automatically triggers zero-downtime builds.

### 2. Render Blueprint
Deploy directly to Render using the included [`render.yaml`](./render.yaml):
1. Create a new account at [render.com](https://render.com).
2. Connect your GitHub repository.
3. Select **Blueprints** and point to `render.yaml`.
4. Supply your `MONGO_URI` and `JWT_SECRET`.

---

## 👩‍💻 Author
**Rachana Shivalingu**  
- **GitHub:** [@shivalingurachna](https://github.com/shivalingurachna)  
- **Project:** [Approval-Management-System](https://github.com/shivalingurachna/Approval-Management-System)
