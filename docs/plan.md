Implementation Plan: Zilly's Electronics Inventory & Verification System
This step-by-step plan outlines how we will build the inventory and verification system. Because building software can easily become overwhelming, we have broken the project down into 8 distinct, highly isolated, bite-sized phases.

We will focus on one phase at a time, ensuring it is complete and fully tested before moving to the next. This prevents overcomplicating things and keeps our development path extremely clear.

🧠 Approach for Neurodivergent Alignment
No Multi-tasking: We will focus entirely on a single piece of code or endpoint at a time.
Defined Boundaries: We will write backend APIs first (Phases 1-5) and then build the frontend UI (Phases 6-7). This "Backend-First" boundary prevents us from juggling visual design and database queries simultaneously.
Strict Order of Operations: We will not write code for Phase N until Phase N-1 is verified.
🚦 User Review Required
IMPORTANT

Key Database Decision: To ensure your free hosting (on Neon or Supabase) works correctly without losing data, we are initializing the database using SQLAlchemy with PostgreSQL compatibility from Day 1. This means local development will use SQLite, but swapping to a free cloud database later will require only a single line configuration change.

📅 Step-by-Step Implementation Phases
🛠️ Phase 1: Foundation & Project Bootstrap
Goal: Initialize the project folders, install packages, and set up a working database database engine.

[NEW] Directory Structure: Initialize /backend and /frontend directories.
[NEW] dependencies: Define requirements.txt with FastAPI, SQLAlchemy, Alembic, Pydantic, and Uvicorn.
[NEW] config.py: Set up environment configuration handling for local SQLite and cloud PostgreSQL.
[NEW] database.py: Set up SQLAlchemy engine and session management.
[NEW] base.py: Define common fields (id, created_at, updated_at) shared across models.
Verification: Run a small test script to verify successful connection to the local database file.





🔐 Phase 2: Multi-Tenant Authentication & Onboarding
Goal: Allow new business owners to register, log in securely, and create their first shop.

[NEW] user.py & shop.py Models: Create SQLAlchemy models. Ensure users.shop_id is nullable so owners can register before creating a shop.
[NEW] auth.py API Router: Implement secure password hashing (using bcrypt or passlib) and JWT generation.
[NEW] Onboarding Routes:
POST /auth/register (Register Owner or Staff)
POST /shops (Create a shop; associates owner with the shop)
[NEW] dependencies.py: Implement authentication security checks to isolate owner and staff capabilities.
Verification: Run automatic tests to verify that a staff member cannot access an owner-only resource, and that an owner can only access their own shops.






📦 Phase 3: Product Inventory Registry API
Goal: Allow owners to register products (with photo upload support) and let staff search for products.

[NEW] product.py Model: Create product tables. Add composite unique constraint UNIQUE(shop_id, serial_number).
[NEW] file_upload.py Service: Implement standard local multipart file uploads (structured under uploads/shop_{id}/).
[NEW] products.py API Router:
POST /products/register (Owner only: registers a product and handles file uploads)
GET /products/search (Staff/Owner: search products by serial number or model name, strictly isolated to the user's shop)
Verification: Verify that registering the same serial number twice in the same shop fails, while allowing the same serial number to exist in a completely different shop.








🛡️ Phase 4: Verification & Safe-Sale (Transactions) API
Goal: Implement the core serial matching checks and construct a lockproof idempotency key engine to prevent duplicate sales.

[NEW] transaction.py & idempotency.py Models: Establish transaction logs and idempotency tables.
[NEW] core/verification.py: Create pure, database-free matching business rules (e.g. alphanumeric text normalization).
[NEW] core/idempotency.py: Create the database interlock check to reject duplicate actions with matching idempotency keys.
[NEW] transactions.py API Router:
POST /transactions/verify (Staff scans and matches hardware serial with database)
POST /transactions/confirm-sale (Idempotent sale finalization; logs the sale and blocks duplicate runs)
Verification: Simulate two concurrent HTTP requests with the exact same idempotency key at the same millisecond to ensure one succeeds and the other receives a safe cached response.







📊 Phase 5: Owner Dashboard & Metrics API
Goal: Provide owners with daily sales summaries, transaction history, and error logs.

[NEW] owner.py API Router:
GET /owner/dashboard (Returns total sales count, revenue, and verification error metrics for the owner's shops)
GET /transactions (Returns paginated historical records, filtered strictly by owner)
Verification: Verify the dashboard correctly filters and aggregates data across multiple shops owned by the same user.








🎨 Phase 6: Frontend Shell & Glassmorphic UI System
Goal: Initialize Vite + React 19 and establish a custom modern CSS theme.

[NEW] Frontend Setup: Run Vite, set up React router and local storage handlers for JWT tokens.
[NEW] index.css: Create design system variables (colors, borders, glows, dark-mode styling, smooth animations).
[NEW] Navigation & Layout: Implement standard responsive dashboard layouts, login views, and onboarding forms.
Verification: Run local web dev server and ensure all layout containers scale correctly on desktop and mobile screens.








🏪 Phase 7: Frontend Page Assembly
Goal: Integrate backend endpoints into beautiful, responsive React dashboard pages.

[NEW] Login & Shop Setup: Create signup, login, and "Add Shop" forms.
[NEW] Product Registry: Add forms for product creation with image drag-and-drop.
[NEW] Live Verification Panel: Implement the staff scanner interface with green matching cards, red mismatch shake alerts, and a one-click "Confirm Sale" button.
Verification: Walk through a simulated staff workflow: logging in, searching for a TV, matching the serial number, and making the sale.









🚀 Phase 8: E2E Verification & Deployment Guide
Goal: Prepare the application for free deployment on Neon, Render, and Vercel.

[NEW] Deployment Guide: Write simple step-by-step instructions to configure Neon databases, import production env files, and deploy to Render and Vercel.
[NEW] database reset tools: Add a simple, optional command to wipe sample data and let testers start fresh.




Verification: Verify automated integration script successfully runs the build in a clean container.




🧪 Verification Plan
Automated Tests
FastAPI Tests: Use pytest and httpx.AsyncClient to automatically run API routes in Phase 1-5, validating boundaries, security roles, and idempotency.
Concurrent Testing: Write a lightweight script in scratch/test_concurrency.py that triggers multiple requests simultaneously to guarantee database-level safety.
Manual Verification
Walkthrough Verification: Perform live tests of the web interface to verify camera simulation, forms, dashboard statistics, and overall user flow.








MAKE SURE TO UPDATE DONE MD IF ANY PHASE HERE IN PLAN MD IS DONE