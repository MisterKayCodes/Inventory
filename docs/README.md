# Electronics Inventory & Verification System

## Overview
A FastAPI backend for managing shops, categories, and products with multi‑tenant authentication, and a planned verification & sales workflow. The project is structured to grow from a simple CRUD API (Phases 1‑3) to a full inventory‑verification system with idempotent transactions, admin dashboards, and a glass‑morphic React frontend.

---

## Project Structure
```
Inventory/
├─ backend/                     # FastAPI backend (current implementation)
│  ├─ app/
│  │  ├─ __init__.py
│  │  ├─ main.py               # uvicorn entry point, registers routers
│  │  ├─ api/                  # API routers
│  │  │   ├─ auth.py            # Register / login (JWT)
│  │  │   ├─ shops.py           # Shop onboarding & management
│  │  │   ├─ categories.py      # Category CRUD
│  │  │   └─ products.py        # Product CRUD
│  │  ├─ data/
│  │  │   ├─ __init__.py
│  │  │   ├─ base.py            # Base model with id, timestamps
│  │  │   ├─ database.py        # Engine & SessionLocal (SQLite & PostgreSQL switch)
│  │  │   └─ models/            # SQLAlchemy ORM models
│  │  │        ├─ user.py
│  │  │        ├─ shop.py
│  │  │        ├─ category.py
│  │  │        └─ product.py
│  │  ├─ dependencies.py        # auth helpers (get_current_user, role checks)
│  │  ├─ schemas/              # Pydantic v2 schemas for request/response
│  │  └─ services/             # Future services (e.g., Cloudinary, verification)
│  ├─ alembic/                # Migration scripts
│  ├─ config.py                # Env‑based config (SQLite dev, PostgreSQL prod)
│  ├─ requirements.txt
│  ├─ pytest.ini
│  └─ tests/                  # Pytest suite covering auth, shops, categories, products
├─ docs/                       # Documentation (this file, plan, done, future README updates)
│  ├─ plan.md                 # Full 8‑phase implementation plan (original)
│  └─ done.md                 # List of completed phases (auto‑updated)
├─ frontend/                  # **Future** React + Vite UI (Phases 6‑7)
│  └─ (to be created)
└─ .gitignore, README.md (root)   # will link to docs/README.md
```

---

## Installation (local development)
1. **Clone the repo** (once you push it to GitHub).
2. **Create a virtual environment**
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```
4. **Configure the database**
   - By default the app uses a local SQLite file `zilly.db`.
   - To switch to PostgreSQL set the environment variable `DATABASE_URL` (compatible with SQLAlchemy). Example:
     ```powershell
     $env:DATABASE_URL="postgresql://user:pwd@host:5432/dbname"
     ```
5. **Run migrations** (only needed after schema changes)
   ```powershell
   alembic upgrade head
   ```
6. **Start the server**
   ```powershell
   uvicorn app.main:app --reload
   ```
   The API will be reachable at `http://127.0.0.1:8000`.

---

## Running the Test Suite
```powershell
.\venv\Scripts\python.exe -m pytest
```
All tests currently pass (`4 passed`). Add new tests as you implement further phases.

---

## API Overview (current endpoints)
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/auth/register` | Register owner or staff (password hashed) | ❌ |
| POST | `/auth/login` | Obtain JWT access token | ❌ |
| POST | `/shops` | Create a shop (owner‑only) | ✅ (owner) |
| GET  | `/shops` | List shops owned by the user | ✅ (owner or staff) |
| POST | `/categories` | Create a new category for the owner's shop | ✅ (owner) |
| GET  | `/categories` | List categories (shop‑scoped) | ✅ |
| POST | `/products` | Register a product (owner‑only) | ✅ (owner) |
| GET  | `/products` | Search/list products (shop‑scoped) | ✅ |
| GET  | `/products/{id}` | Get product details | ✅ |
| PUT  | `/products/{id}` | Update product (owner‑only) | ✅ (owner) |
| DELETE| `/products/{id}` | Delete product (owner‑only) | ✅ (owner) |
| POST | `/transactions/verify` | Verify hardware serial | ✅ (staff) |
| POST | `/transactions/confirm-sale` | Idempotent sale finalization | ✅ (staff) |
| GET  | `/dashboard/overview` | Dashboard metrics for owner's shops | ✅ (owner) |
| GET  | `/transactions` | List transaction history (shop‑scoped) | ✅ (owner) |

Future endpoints (Phases 6-7) will cover the React frontend UI.

---

## Database Details
- **SQLite (dev)** – file `zilly.db` in the repo root.
- **PostgreSQL (prod)** – set `DATABASE_URL` env var; the same SQLAlchemy models work without change.
- **Migrations** – managed by Alembic (`alembic/` folder). Run `alembic revision --autogenerate -m "msg"` after model changes, then `alembic upgrade head`.

---

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Full SQLAlchemy database URL (PostgreSQL). If unset, falls back to SQLite. | `sqlite:///./inventory.db` |
| `SECRET_KEY` | JWT signing secret. Must be a long random string. | `"super-secret-key"` (change for production) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime. | `30` |

---

## Future Roadmap
| Phase | Goal | Status |
|------|------|--------|
| 1 | Foundation & Project Bootstrap | ✅ Done |
| 2 | Multi‑Tenant Authentication & Onboarding | ✅ Done |
| 3 | Product & Category CRUD (Inventory Registry API) | ✅ Done |
| 4 | Verification & Safe‑Sale (Transactions) API | ✅ Done |
| 5 | Owner Dashboard & Metrics API | ✅ Done |
| 6 | Frontend Shell & Glassmorphic UI (Vite + React) | ⏳ Not started |
| 7 | Frontend Page Assembly (connect UI to backend) | ⏳ Not started |
| 8 | E2E Verification & Deployment Guide | ⏳ Not started |

The README will be updated as each phase completes, expanding sections such as **API Overview**, **Database Details**, and **Frontend Build**.

---

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/xyz`).
3. Install the dev dependencies (already in `requirements.txt`).
4. Write/extend tests in `tests/`.
5. Ensure `pytest` passes.
6. Submit a Pull Request.

---

## License
MIT – feel free to use, modify, and share.

---

*This README lives in `docs/README.md` and will be the single source of truth for the project. Keep it up‑to‑date as you add new phases, endpoints, or deployment steps.*

## Mobile testing

When testing on a phone or other device, you need the frontend to listen on all interfaces and point to the backend via your local IP.

1. **Create a `.env` in `frontend/`** (already done) with:
   ```env
   VITE_API_URL=http://192.168.0.100:8000
   ```
2. **Run the backend** so it’s reachable from the network:
   ```powershell
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
3. **Start the Vite dev server** with host `0.0.0.0`:
   ```powershell
   cd frontend
   npm run dev -- --host 0.0.0.0
   ```
4. Open the URL shown (e.g., `http://192.168.0.100:5173`) on your phone’s browser.

Now the app will communicate with the backend using the correct IP, and you can test the full flow on a mobile device.

## Frontend Updates

- Added navigation to `/dashboard/overview` after a successful login using `useNavigate` from `react-router-dom`.
- Cleaned up import order in `src/pages/Login.jsx`: React import first, followed by custom hooks, then third‑party libraries, with a comment describing the ordering.
- Updated login button to show a loading state and retain the `.btn` class when disabled.

