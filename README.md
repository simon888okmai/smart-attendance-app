# 📋 Attendance System — Face Recognition

ระบบลงเวลาเข้า-ออกงานด้วยการสแกนใบหน้า พร้อมตรวจสอบ GPS พัฒนาแบบ Full-Stack ด้วย React Native + Bun + AI (DeepFace)

## 🏗️ Tech Stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| **Frontend** | React Native (Expo), NativeWind, Axios  |
| **Backend**  | Bun, Elysia (Hono-like), Drizzle ORM   |
| **AI**       | Python, FastAPI, DeepFace               |
| **Database** | PostgreSQL (Supabase)                   |
| **Auth**     | Supabase Auth (JWT)                     |

## 📁 Project Structure

```
Test_Fullstack-Developer/
├── frontend/               # React Native (Expo) Mobile App
│   ├── src/
│   │   ├── presentation/   # Screens, Components, Hooks, Navigation
│   │   ├── services/       # API service layer (Axios)
│   │   └── utils/          # Utility functions
│   └── .env.example
│
├── backend/                # Node.js API Server (Bun + Elysia)
│   ├── src/
│   │   ├── controllers/    # Business logic (auth, attendance)
│   │   ├── db/             # Database schema & connection (Drizzle)
│   │   ├── lib/            # Supabase client
│   │   ├── middlewares/    # JWT auth middleware
│   │   └── routes/         # API route definitions
│   ├── ai-service/         # Python AI Microservice (FastAPI + DeepFace)
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env.example
│
└── .gitignore
```

## ✨ Features

- **Face Recognition** — ลงทะเบียนและยืนยันตัวตนด้วยใบหน้า (DeepFace AI)
- **GPS Geo-fencing** — ตรวจสอบว่าอยู่ในรัศมีที่กำหนดก่อนลงเวลา
- **Session Management** — แบ่งช่วงเวลาทำงาน (เช้า, กลางวัน, บ่าย, เย็น)
- **Late Detection** — ตรวจจับการมาสาย
- **Absent Detection** — ระบบตรวจจับว่าหมดเวลาแล้วยังไม่ลงเวลา
- **Early Checkout Prevention** — ป้องกันการลงเวลาออกก่อนกำหนด
- **Attendance History** — ดูประวัติการลงเวลาย้อนหลัง

## 🚀 Getting Started (Local Development)

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Python](https://www.python.org/) (v3.10+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Supabase account (for Database & Auth)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Test_Fullstack-Developer
```

### 2. Backend Setup

```bash
cd backend

# Copy environment template and fill in your values
cp .env.example .env

# Install dependencies
bun install

# Start the server
bun src/index.ts
```

### 3. AI Service Setup

```bash
cd backend/ai-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start AI service
python3 main.py
```

### 4. Frontend Setup

```bash
cd frontend

# Copy environment template
cp .env.example .env
# Edit .env and set EXPO_PUBLIC_API_URL to your backend URL (e.g., http://192.168.x.x:3001)

# Install dependencies
bun install

# Start Expo
bun start
```

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable           | Description                                |
| ------------------ | ------------------------------------------ |
| `DATABASE_URL`     | PostgreSQL connection string (Supabase)    |
| `SUPABASE_URL`     | Supabase project URL                       |
| `SUPABASE_ANON_KEY`| Supabase anonymous/public key              |
| `AI_SERVICE_URL`   | URL of the AI service (default: `http://localhost:8000`) |

### Frontend (`frontend/.env`)

| Variable               | Description                         |
| ---------------------- | ----------------------------------- |
| `EXPO_PUBLIC_API_URL`  | Backend API URL (e.g., `http://your-server-ip:3001`) |

> ⚠️ **Never commit `.env` files to Git.** Use `.env.example` as a template.

## 🐳 Docker Deployment

The backend and AI service can be deployed together using Docker Compose.

### Build & Run

```bash
cd backend

# Create .env file with your production values
cp .env.example .env
nano .env  # Fill in DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY

# Build and start all services
docker compose up -d --build

# Check logs
docker compose logs -f
```

This will start:
- **Backend API** on port `3001`
- **AI Service** on port `8000` (internal, accessed by backend via Docker network)

## 📄 License

This project is for educational and portfolio purposes.
