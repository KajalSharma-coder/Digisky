<div align="center">

# DigiSky IT

### Premium business technology website with lead capture, booking, admin analytics, and MySQL-powered backend.

[![React](https://img.shields.io/badge/React-Frontend-149eca?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-API-111111?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479a1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

</div>

---

## Overview

DigiSky IT is a premium service website built for a modern technology and communication business. It combines a polished React experience with a practical Express API, MySQL persistence, admin login, lead management, booking workflows, testimonials, reviews, analytics, and CSV export.

The experience is designed around high-intent visitors: service discovery, trust-building content, quick contact actions, consultation booking, and an admin dashboard for managing business enquiries.

## Signature Features

- Premium responsive landing experience with service-led hero slides.
- Dedicated service pages for WhatsApp Official API, IVR, RCS SMS, voice calls, websites, software development, SMS, studio setup, and digital visiting cards.
- Lead capture form with backend storage.
- Consultation booking flow with Google Calendar handoff.
- Admin dashboard with JWT login.
- Lead, booking, review, testimonial, service, and blog management APIs.
- Analytics counters for visitors, leads, bookings, reviews, and top services.
- CSV export for leads.
- MySQL auto-bootstrap for required tables.
- Vite proxy for local frontend-to-backend development.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express |
| Database | MySQL, mysql2 |
| Auth | JSON Web Tokens, bcryptjs |
| Utilities | dotenv, cors, json2csv, concurrently |

## Project Structure

```text
.
|-- index.html
|-- package.json
|-- vite.config.js
|-- src/
|   |-- main.jsx
|   `-- styles.css
|-- server/
|   |-- index.js
|   |-- mysql.js
|   `-- schema.sql
`-- .env.example
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and update the values for your local machine or hosting platform.

```env
PORT=4000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=digisky_it
JWT_SECRET=change-this-secret
ADMIN_EMAIL=admin@digiskyit.com
ADMIN_PASSWORD=admin123
```

For production, always set a strong `JWT_SECRET` and change the default admin credentials.

### 3. Start the full application

```bash
npm run dev:full
```

Frontend: `http://localhost:5173`

API: `http://localhost:4000`

### 4. Build for production

```bash
npm run build
```

### 5. Preview production build

```bash
npm run preview
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite frontend dev server. |
| `npm run server` | Starts the Express API server. |
| `npm run dev:full` | Runs frontend and backend together. |
| `npm run build` | Builds the frontend for production. |
| `npm run preview` | Serves the production build locally. |

## API Highlights

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check with database readiness. |
| `POST` | `/api/login` | Admin login and JWT creation. |
| `POST` | `/api/leads` | Store website leads. |
| `GET` | `/api/leads` | List leads for admin users. |
| `GET` | `/api/leads/export` | Export leads as CSV. |
| `POST` | `/api/bookings` | Store consultation bookings. |
| `GET` | `/api/analytics` | Return dashboard metrics. |
| `POST` | `/api/reviews` | Store customer reviews. |
| `GET` | `/api/testimonials` | List testimonials. |
| `GET` | `/api/services` | List active services. |

## Database

The backend creates the database and required tables automatically on startup using `server/mysql.js`. A manual SQL schema is also available in `server/schema.sql` for deployments where you prefer to initialize MySQL yourself.

## Admin Access

Open `#/admin` in the frontend to access the admin dashboard.

Default development credentials are defined through environment variables:

```text
ADMIN_EMAIL=admin@digiskyit.com
ADMIN_PASSWORD=admin123
```

Change them before deploying publicly.

## Deployment Notes

- Do not commit `.env`.
- Run `npm run build` before deploying the frontend.
- Host the Express API with access to a MySQL server.
- Set `VITE_API_URL` if the frontend and API are hosted on different domains.
- Use HTTPS and a strong `JWT_SECRET` in production.

## Brand Positioning

DigiSky IT presents a high-trust digital presence for communication, automation, software, and business growth services. The website is built to feel polished, fast, and conversion-ready while keeping operations manageable through a simple admin layer.

---

<div align="center">

Built for DigiSky IT - communication, automation, websites, software, and digital growth.

</div>
