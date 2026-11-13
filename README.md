# Event Project

| Part | Tech | Folder | URL |
|---|---|---|---|
| Admin side + API + Database | Laravel 13 + MySQL (`event_project`) | `backend/` | http://localhost:8000/admin |
| Client side | Vue 3 + Vite | `frontend/` | http://localhost:5173 |

## Flow
1. **Admin creates an event** – Laravel admin → Events → *Create Event*
2. **Client sees events** – Vue home page (`GET /api/events`)
3. **Client joins an event** – Vue event page → *Request to join* (`POST /api/events/{id}/join`), status = `pending`
4. **Admin approves / rejects** – Laravel admin → *Join Requests* (or the event page). The client sees the new status under **My Events**.

## Run locally (XAMPP)
Start **MySQL** in XAMPP, then open three terminals:

```bash
# Terminal 1 – backend
cd backend
C:\xampp\php\php.exe artisan serve --port=8000

# Terminal 2 – real-time WebSocket server (Laravel Reverb)
cd backend
C:\xampp\php\php.exe artisan reverb:start --port=8080

# Terminal 3 – frontend
cd frontend
npm run dev
```

## Real-time (WebSocket via Laravel Reverb + Echo)
| Action | Who sees it live |
|---|---|
| Client requests to join | Admin: toast 🔔, red badge on "Join Requests", lists refresh by themselves |
| Client cancels a request | Admin: toast, badge and lists update |
| Admin approves / rejects | Client: toast ✅/❌, status on *My Events* and the event page updates |
| Admin creates / edits / deletes an event | Everyone on the Vue site: the event list refreshes ("New event" toast) |
| Spots filled | Spot counts update for everyone |

Channels: `private-admin` (admins only), `private-App.Models.User.{id}` (each client), `events` (public).
If Reverb isn't running, everything still works; the pages just don't update by themselves.

First-time setup (already done on this machine):
```bash
cd backend
composer install
php artisan migrate --seed
php artisan storage:link
cd ../frontend
npm install
```

## Accounts (from the seeder)
| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | password |
| Client | client@example.com | password |

Clients can also sign up in the Vue app.

## Configuration
- `backend/.env` – `DB_DATABASE=event_project`, `DB_USERNAME=root`, `APP_URL=http://localhost:8000`
- `frontend/.env` – `VITE_API_URL=http://localhost:8000/api` (where the Vue app sends API requests)

## API
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/register` | – |
| POST | `/api/login` → returns `token` | – |
| GET | `/api/events?search=` | – |
| GET | `/api/events/{id}` (includes `my_registration` if a token is sent) | optional |
| POST | `/api/events/{id}/join` `{phone, note}` | Bearer |
| GET | `/api/my-registrations` | Bearer |
| DELETE | `/api/registrations/{id}` (cancel pending) | Bearer |
| GET | `/api/me`, POST `/api/logout` | Bearer |

## Deploying
- **Backend:** upload `backend/`, point the web root to `backend/public`, set `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, DB credentials in `.env`, then run `composer install --no-dev`, `php artisan migrate --force`, `php artisan storage:link`, `php artisan config:cache`.
- **Frontend:** set `VITE_API_URL=https://your-backend-domain/api` in `frontend/.env`, run `npm run build`, upload `frontend/dist/`. Configure the host to send every route to `index.html` (SPA fallback).
