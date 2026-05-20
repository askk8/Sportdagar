# Sportdagar

En modern svensk webbplattform där föräldrar kan anmäla sina barn till lokala sportprova-på-dagar och aktivitetsveckor.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS, shadcn/ui |
| Backend | FastAPI (Python) |
| Database | Supabase Postgres |
| Auth | Supabase Auth |
| Deploy | Docker + docker-compose |

## Project Structure

```
Sportdagar/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/routes/   # auth, children, sessions, bookings, admin
│   │   ├── core/         # config, auth middleware
│   │   ├── db/           # Supabase client
│   │   └── schemas/      # Pydantic models
│   ├── main.py
│   └── requirements.txt
├── frontend/             # Next.js frontend
│   └── src/
│       ├── app/          # Pages (App Router)
│       ├── components/   # UI components
│       ├── hooks/        # React hooks
│       ├── lib/          # API client, utils
│       └── types/        # TypeScript types
├── database/
│   ├── schema.sql        # Full DB schema + RLS + stored procedures
│   └── seed.sql          # Example data
└── docker-compose.yml
```

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. In the **SQL Editor**, run `database/schema.sql`
3. Then run `database/seed.sql` for example data
4. Copy your **Project URL**, **anon key**, and **service_role key** from Settings → API

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your Supabase credentials in .env

# Local development
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your Supabase credentials in .env.local

npm install
npm run dev
```

Frontend runs at: http://localhost:3000

### 4. Docker (Full stack)

```bash
# Copy and fill env files first
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
# Edit both files with your credentials

docker compose up --build
```

## Making a User Admin

After creating an account, run this in Supabase SQL Editor:

```sql
UPDATE user_profiles SET is_admin = TRUE WHERE id = 'your-user-uuid';
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/register` | Register new parent |
| `POST /api/v1/auth/login` | Login |
| `GET /api/v1/auth/me` | Get current user |
| `GET /api/v1/children/` | List my children |
| `POST /api/v1/children/` | Add a child |
| `GET /api/v1/sessions/` | List sessions (filterable) |
| `GET /api/v1/sessions/weeks/` | List sport weeks |
| `GET /api/v1/sessions/sports/` | List sports |
| `GET /api/v1/bookings/` | My bookings |
| `POST /api/v1/bookings/` | Create booking (safe transaction) |
| `DELETE /api/v1/bookings/{id}` | Cancel booking |
| `GET /api/v1/admin/stats` | Admin dashboard stats |
| `POST /api/v1/admin/weeks` | Create sport week |
| `POST /api/v1/admin/sessions` | Create session |
| `GET /api/v1/admin/bookings` | All bookings |

## Key Features

### Booking Safety
- All bookings go through a PostgreSQL stored procedure (`create_booking`)
- Row-level locking prevents race conditions and overbooking
- Age validation enforced in the database
- Overlap detection prevents double-booking same child on same day

### Row Level Security (RLS)
- Parents can only see/manage their own children and bookings
- Sessions and sport weeks are public (published only)
- Admins have full access via service role key

### Swedish UI
- All user-facing text in Swedish
- Family-friendly, modern Scandinavian design
- Mobile-first responsive layout

## Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel deploy
# Set env vars in Vercel dashboard
```

### Railway / Render (Backend)
- Point to `/backend` directory
- Set `PORT=8000` and all env vars
- Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`

## Sports Supported
⚽ Fotboll · 🤾 Handboll · 🏒 Innebandy · 🏓 Bordtennis · 🏐 Volleyboll  
🏑 Hockey · ⛸️ Konståkning · 🎾 Padel · 🥊 Boxning · 🏀 Basket
