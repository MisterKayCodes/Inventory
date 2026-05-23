
# 📦 Inventory

A secure, multi-tenant inventory and serial verification system designed specifically for retail business owners to stop inventory leakage and staff errors.

## ✨ Features

- **My Products:** Register high-value items by their exact serial number. Price formatting and Cloudinary photo uploads included.
- **Manage Shops:** Create new shop branches and issue staff accounts instantly.
- **Check Serial:** Staff must type in the exact serial number to clear an item. Prevents fake sales and stock swapping.
- **Sales History:** Owners get a God's-eye view of all completed and failed sales from home.
- **Demo Mode:** Click "Try the Demo" on login to instantly access a populated test environment.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start (Local Development)](#-quick-start-local-development)
- [Mobile/LAN Testing](#-mobilelan-testing)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [🚀 Deployment Guide (Production)](#-deployment-guide-production)
- [Testing](#-testing)
- [Maintenance](#-maintenance)
- [License](#-license)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI (Python) |
| Frontend | React + Vite |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT |
| Styling | Glassmorphic Dark UI |
| Deployment | Vercel (frontend) + VPS (backend) |

---

## 📁 Project Structure

```
Inventory/
├─ backend/                        # FastAPI backend
│  ├─ app/
│  │  ├─ main.py                   # Uvicorn entry point, registers all routers
│  │  ├─ api/                      # Route handlers
│  │  │   ├─ auth.py               # Register / login (JWT)
│  │  │   ├─ shops.py              # Shop onboarding & management
│  │  │   ├─ categories.py         # Category CRUD
│  │  │   ├─ products.py           # Product CRUD
│  │  │   ├─ transactions.py       # Serial verification & sale confirmation
│  │  │   └─ dashboard.py          # Owner metrics & overview
│  │  ├─ data/
│  │  │   ├─ base.py               # Base model (id, timestamps)
│  │  │   ├─ database.py           # Engine & SessionLocal
│  │  │   └─ models/               # SQLAlchemy ORM models
│  │  │        ├─ user.py
│  │  │        ├─ shop.py
│  │  │        ├─ category.py
│  │  │        ├─ product.py
│  │  │        └─ transaction.py
│  │  ├─ dependencies.py           # Auth helpers (get_current_user, role checks)
│  │  ├─ schemas/                  # Pydantic v2 request/response schemas
│  │  └─ services/                 # Cloudinary & other service integrations
│  ├─ alembic/                     # Alembic migration scripts
│  ├─ alembic.ini
│  ├─ config.py                    # Env-based config
│  ├─ requirements.txt
│  ├─ pytest.ini
│  ├─ wipe_demo.py                 # Script to wipe/reset demo data
│  └─ tests/                       # Pytest suite
│
├─ frontend/                       # React + Vite frontend
│  ├─ public/
│  ├─ src/
│  │  ├─ main.jsx                  # React DOM entry point
│  │  ├─ App.jsx                   # Router config (public + protected routes)
│  │  ├─ index.css                 # Global glassmorphic styles & animations
│  │  ├─ context/
│  │  │   └─ AuthContext.jsx       # Auth state, shop list, active shop
│  │  ├─ components/
│  │  │   ├─ DashboardLayout.jsx   # Sidebar nav, shop switcher, mobile drawer
│  │  │   ├─ LoadingButton.jsx     # Reusable button with loading spinner
│  │  │   └─ RequireAuth.jsx       # Route guard for protected pages
│  │  └─ pages/
│  │      ├─ Login.jsx             # Login page with demo mode
│  │      ├─ Register.jsx          # Account registration (owner or staff)
│  │      ├─ Dashboard.jsx         # Owner overview & metrics
│  │      ├─ Inventory.jsx         # Product & category management
│  │      ├─ Shops.jsx             # Shop management & staff invite codes
│  │      ├─ Verification.jsx      # Serial number checker for staff
│  │      └─ Transactions.jsx      # Paginated sales history for owners
│  ├─ .env                         # VITE_API_URL (set to backend URL)
│  ├─ package.json
│  └─ vite.config.js
│
├─ docs/
│  ├─ README.md                    # ← You are here
│  ├─ plan.md                      # Original implementation plan
│  └─ done.md                      # Completed phase log
└─ .gitignore
```

---

##  Quick Start (Local Development)

### Backend Setup

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run migrations
alembic upgrade head

# 5. Start the dev server
uvicorn app.main:app --reload --port 8000
```

The API will be reachable at `http://127.0.0.1:8000`  
Interactive docs: `http://127.0.0.1:8000/docs`

### Frontend Setup

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Set the backend URL (create .env file)
echo "VITE_API_URL=http://localhost:8000" > .env

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📱 Mobile/LAN Testing

To test on a phone or tablet on the same Wi-Fi network:

1. **Find your local IP address:**
   - Windows: Run `ipconfig` and look for `IPv4 Address`
   - Mac/Linux: Run `ifconfig` or `ip addr`

2. **Update frontend `.env` file:**
   ```env
   VITE_API_URL=http://YOUR_LOCAL_IP:8000
   ```

3. **Start backend with host binding:**
   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Start frontend with host binding:**
   ```bash
   cd frontend
   npm run dev -- --host 0.0.0.0
   ```

5. **Open on your mobile device:**  
   `http://YOUR_LOCAL_IP:5173`

> **Note:** `YOUR_LOCAL_IP` should be replaced with your actual local IP (e.g., `192.168.1.100`). These are private IP addresses safe to use on your local network.

---

## 📡 API Reference

### Public Endpoints (No Auth Required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register owner or staff account |
| POST | `/auth/login` | Obtain JWT access token |

### Protected Endpoints (Staff & Owners)

| Method | Path | Description | Required Role |
|--------|------|-------------|---------------|
| GET | `/shops` | List shops for current user | Any |
| GET | `/categories` | List categories (shop-scoped) | Any |
| GET | `/products` | Search / list products | Any |
| GET | `/products/{id}` | Get single product details | Any |
| POST | `/transactions/verify` | Verify a product serial number | Staff |
| POST | `/transactions/confirm-sale` | Idempotent sale confirmation | Staff |

### Protected Endpoints (Owners Only)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/shops` | Create a shop |
| POST | `/categories` | Create a category |
| POST | `/products` | Register a product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |
| GET | `/transactions` | List transaction history (shop-scoped) |
| GET | `/dashboard/overview` | Dashboard metrics for owner's shops |

---

## 🔧 Environment Variables

### Backend (create `.env` in `/backend`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Full SQLAlchemy DB URL (PostgreSQL) | `sqlite:///./inventory.db` |
| `SECRET_KEY` | JWT signing secret (use long random string in production) | `"super-secret-key"` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token lifetime in minutes | `30` |

### Frontend (create `.env` in `/frontend`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL pointing to the FastAPI backend | `http://localhost:8000` |

---

## 🚀 Deployment Guide (Production)

This project is split into two parts: a **React (Vite) Frontend** and a **Python (FastAPI) Backend**.

### Step 1: Push to GitHub

```bash
# From the root Inventory folder
git add .
git commit -m "feat: complete UI/UX overhaul, simplify inventory terms, and prepare for production launch"
git push
```

### Step 2: Deploy Frontend to Vercel (Free & Automatic)

1. Go to [Vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **"Add New Project"** and import your `Inventory` repository.
3. Under **Framework Preset**, select **Vite**.
4. Under **Root Directory**, click Edit and select the `frontend` folder.
5. Click **Deploy**. Vercel will give you a live URL automatically.

### Step 3: Deploy Backend to your VPS (using PM2)

1. **SSH into your VPS:**
   ```bash
   ssh user@your-vps-ip
   ```

2. **Clone or pull your GitHub repository:**
   ```bash
   git clone https://github.com/yourusername/Inventory.git
   # Or if already cloned:
   cd Inventory && git pull origin main
   ```

3. **Navigate to the backend folder:**
   ```bash
   cd Inventory/backend
   ```

4. **Set up Python environment and install dependencies:**
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Set up environment variables (create `.env` file):**
   ```bash
   echo "SECRET_KEY=your-very-secret-key-change-this" > .env
   echo "DATABASE_URL=postgresql://user:password@localhost:5432/inventory" >> .env
   ```

6. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

7. **Start the backend with PM2:**
   ```bash
   pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name "inventory-backend"
   ```

8. **Save the PM2 state (restarts automatically if server reboots):**
   ```bash
   pm2 save
   pm2 startup  # Optional: ensures PM2 starts on system boot
   ```

### Step 4: Connect Frontend to Backend

1. Go back to your Vercel dashboard.
2. Go to **Settings → Environment Variables**.
3. Add a new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `http://YOUR_VPS_IP_ADDRESS:8000` *(Replace with your actual VPS IP address)*
4. Go to the **Deployments** tab in Vercel.
5. Click the three dots (`...`) on your latest deployment and click **Redeploy**.

### Step 5: Configure CORS on Backend (if needed)

Edit `backend/app/main.py` to add your frontend domain:

```python
origins = [
    "https://your-frontend.vercel.app",
    "http://localhost:5173",
]
```

Then restart the backend:

```bash
pm2 restart inventory-backend
```

### ✅ Your app is now completely live! 🎉

- **Frontend URL:** `https://your-project.vercel.app`
- **Backend API:** `http://your-vps-ip:8000`
- **API Docs:** `http://your-vps-ip:8000/docs`

---

## 🧪 Testing

### Run the Test Suite

```bash
cd backend
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
python -m pytest
```

### Demo Data Reset

To wipe and reset demo/test data without dropping the whole database:

```bash
cd backend
source venv/bin/activate
python wipe_demo.py
```

---

## 🔄 Maintenance

### Database Migrations

```bash
cd backend
source venv/bin/activate

# Create a new migration
alembic revision --autogenerate -m "description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

### View Backend Logs (PM2)

```bash
pm2 logs inventory-backend
pm2 monit  # Interactive monitoring
```

### Update Production Code

```bash
# On your VPS
cd Inventory
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
pm2 restart inventory-backend
```

---

## 📄 License

MIT — Feel free to use, modify, and share.

---

## 🙏 Acknowledgments

Built with FastAPI, React, and a whole lot of ☕

---

*This README is the single source of truth for the Inventory project.*
```