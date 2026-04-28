# 🏫 Institute Partner Portal

A React + Node.js admin console for **partnered institutes** (PW, Aakash,
BYJU's, local coaching centers, colleges) to engage with students on the
**Atmanirbhar Bharat Rural Learning Platform**.

> **Important:** this portal **shares the same MongoDB database** as the
> student app. It does not maintain its own copy of student data — it reads
> directly from the `users`, `courses`, and `tests` collections. New
> portal-specific data lives in three new collections:
> `institute_admins`, `workshops`, and `schools`.

---

## ✨ Features

- 🔐 **Login-only auth** — pre-seeded institute admin accounts (no public registration)
- 📊 **Dashboard** — total / active students, average score, top performers, signups trend
- 🎓 **Student management** — searchable, filterable, sortable table of every learner
- 👤 **Student profile** — full details, test history, points-trend chart, weak areas, contact buttons (email + call)
- 🏆 **Leaderboard** — filter by course, city, or partner institute
- 🎤 **Workshops module** — create workshops / seminars / mentorship sessions, target by grade & course, **auto-invite** matching students
- 🏫 **Schools/colleges directory** — maintain your network of partner institutions
- 🔔 **Notifications** — auto-written to a `notifications` collection when invites go out (so the student app can surface them)

---

## 🗂️ Folder structure

```
institute-portal/
├── backend/
│   ├── server.js               # Express entry
│   ├── seed.js                 # Seed admins, workshops, schools
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js               # MongoDB native driver singleton
│   ├── middleware/
│   │   └── auth.js             # JWT sign + requireAuth
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentsController.js
│   │   ├── dashboardController.js   # stats + leaderboard
│   │   ├── workshopsController.js
│   │   ├── schoolsController.js
│   │   └── coursesController.js
│   ├── routes/
│   │   ├── auth.js   students.js   dashboard.js
│   │   ├── leaderboard.js   workshops.js   schools.js
│   │   └── courses.js
│   └── models/
│       └── schemas.js          # Schema reference doc (no mongoose)
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── services/api.js
        ├── hooks/useAuth.jsx
        ├── components/
        │   ├── AppShell.jsx    # Sidebar + topbar layout
        │   └── UI.jsx          # Reusable widgets (StatCard, Modal, Field…)
        └── pages/
            ├── LandingPage.jsx
            ├── LoginPage.jsx
            ├── DashboardPage.jsx
            ├── StudentsPage.jsx
            ├── StudentProfilePage.jsx
            ├── LeaderboardPage.jsx
            ├── WorkshopsPage.jsx
            └── SchoolsPage.jsx
```

---

## 🚀 Setup

### Prerequisites

- **MongoDB** running locally (the same instance the student app uses)
- **Node.js** 18+ and **npm**
- The student app's `seed.py` should already have populated the database
  (so you have real users and courses to look at). If you only run the
  portal seed, the dashboard will still work but the student list will be
  empty.

---

### 1️⃣ Backend

```bash
cd backend

# Install
npm install

# Configure
cp .env.example .env
# Edit .env if your Mongo URI / DB name / port differ from defaults

# Seed institute admins, sample workshops & schools
npm run seed

# Run dev server (with auto-reload)
npm run dev
# OR plain start
npm start
```

API will be on **http://localhost:5050**.

#### Demo admin accounts (created by `seed.js`)

| Email             | Password    | Linked institute       |
| ----------------- | ----------- | ---------------------- |
| `admin@pw.in`     | `admin1234` | Physics Wallah, Patna  |
| `admin@aakash.in` | `admin1234` | Aakash, Pune           |
| `admin@byjus.in`  | `admin1234` | BYJU's, Mysuru         |

The seed script links each admin to a real institute (looked up from
the existing `institutes` collection) when one matches by name, and falls
back to a default name otherwise.

---

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

App will be on **http://localhost:5173**.

API calls go to `/api/*` and are **proxied to `http://localhost:5050`** via
Vite's dev proxy (configured in `vite.config.js`), so you don't need to
worry about CORS during development.

#### Production build

```bash
npm run build      # outputs dist/
npm run preview    # serves dist/ on :4173 for testing
```

For production, set `VITE_API_BASE_URL=https://your-api-host/api` in a
`.env.production` file before building, or serve the React build behind
the same domain as the API and just keep `/api` as the base URL.

---

## 📡 API Reference

All endpoints require `Authorization: Bearer <token>` header except
`/api/auth/login` and `/api/health`.

### Auth
| Method | Path                | Body                  | Returns |
|--------|---------------------|-----------------------|---------|
| POST   | `/api/auth/login`   | `{ email, password }` | `{ token, admin }` |
| GET    | `/api/auth/me`      | —                     | `{ admin }` |

### Dashboard
| Method | Path                       | Returns |
|--------|----------------------------|---------|
| GET    | `/api/dashboard/stats`     | counts, top performers, signup trend, recent students |

### Students
| Method | Path                          | Query                         | Returns |
|--------|-------------------------------|-------------------------------|---------|
| GET    | `/api/students`               | `search, course, grade, performance, sort, page, limit` | `{ total, page, limit, students }` |
| GET    | `/api/students/:id`           | —                             | `{ student, test_history, point_trend }` |

`sort` accepts: `points_desc` (default), `points_asc`, `name_asc`, `name_desc`, `streak_desc`, `recent`.
`performance` accepts: `high` (≥500), `mid` (100–499), `low` (<100).

### Leaderboard
| Method | Path                | Query                          | Returns |
|--------|---------------------|--------------------------------|---------|
| GET    | `/api/leaderboard`  | `course, city, institute, limit` | `{ rows, filters }` |

### Workshops
| Method | Path                         | Body / Effect |
|--------|------------------------------|---------------|
| GET    | `/api/workshops`             | List all |
| POST   | `/api/workshops`             | Create one |
| PUT    | `/api/workshops/:id`         | Update |
| DELETE | `/api/workshops/:id`         | Delete |
| POST   | `/api/workshops/:id/invite`  | Auto-invite students matching `target_grades` and `target_courses`; pass `{ student_ids: [...] }` to override and invite specific users. Writes to `notifications` collection. |

### Schools
| Method | Path                  | Body / Effect |
|--------|-----------------------|---------------|
| GET    | `/api/schools`        | List all |
| POST   | `/api/schools`        | Create |
| PUT    | `/api/schools/:id`    | Update |
| DELETE | `/api/schools/:id`    | Delete |

### Courses
| Method | Path           | Returns |
|--------|----------------|---------|
| GET    | `/api/courses` | Flat course list for filter dropdowns |

---

## 🔌 How it integrates with the student app

The portal is **read-only** for student-app data (`users`, `courses`,
`tests`, `bookings`, `institutes`) and **read-write** only for collections
it owns (`institute_admins`, `workshops`, `schools`, `notifications`).

When an admin clicks "Send invites" on a workshop, the portal:

1. Finds students whose `grade` and `enrolled_courses` match the
   workshop's targeting filters.
2. Stores their `_id`s on `workshops.invited_students`.
3. Inserts one document per student into a `notifications` collection
   with shape `{ user_id, type: 'workshop_invite', workshop_id, title,
   message, read: false, created_at }`.

If the student app later adds a notifications screen, it can simply read
from this collection — no other coordination needed.

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| `MongoServerSelectionError` | MongoDB is not running, or `MONGO_URI` in `.env` is wrong. |
| `401 Unauthorized` on every API call | Token expired — sign out and back in. |
| Dashboard shows zeros | The `users` collection is empty. Run the **student app's** `seed.py` first. |
| Portal seed says "admin exists, skipped" | That's fine — re-running seed is non-destructive. To force a reset, drop the `institute_admins` / `workshops` / `schools` collections in Mongo and re-run. |
| `EADDRINUSE :5050` | Change `PORT` in `.env` and update Vite proxy in `vite.config.js`. |
| Frontend can't reach API | Make sure backend is running on port 5050 (or whatever you set), and that the Vite dev server proxy points there. |

---

## 🎨 Design notes

- **Tailwind-first** — every page styled with utility classes; no scattered CSS.
- **Brand-blue + accent-emerald** to differentiate from the saffron-green
  student app and signal "admin tool, not student app."
- **Recharts** for dashboard line/bar charts (zero extra config).
- **No mongoose** — the existing collections are owned by the Python
  backend, and forcing a JS schema on top would just lead to drift. The
  native MongoDB driver lets us read flexibly and write strictly only into
  the new collections.

---

**Built for the institutes shaping rural India's next generation of learners.** 🇮🇳
