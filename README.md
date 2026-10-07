# Agriiigo

Book the right agricultural equipment, right when you need it.

Agriiigo connects farmers with agricultural equipment owners. It provides equipment discovery, field-based booking, service pricing, owner verification, booking lifecycle tracking, manual payment records, reviews, notifications, and dispute management.

## Public demo mode

Use **Explore Demo** on the landing page or open `/demo`. This public, no-login prototype generates clearly labelled simulated machinery around Hyderabad, Delhi, Mumbai, Nirmal, Bengaluru, device coordinates, or manually entered coordinates. The same coordinates produce the same listings and approximate distances. Demo booking and owner workflow state stays in the page and browser memory; it does not call booking, payment, notification, or location APIs and does not change database records. The demo payment action is a local simulation only. A notice and DEMO labels identify the simulated listings, owners, prices, schedules, and status updates.

The demo does not require geolocation permission. If it is denied or unavailable, choose a city or enter coordinates. Selecting a custom location requires its coordinates; no geocoding provider is configured.

## Stack

- React, Vite, JavaScript, React Router
- Node.js, Express, MySQL 8, JWT, bcrypt
- Socket.IO real-time booking notifications and owner location updates
- Browser Geolocation API; distances and ETA are estimates based on Haversine distance

## Requirements and setup

Use Node.js 20+ and MySQL 8+. From this directory:

1. Create a MySQL database named `agriiigo` and load `server/database/schema.sql`.
2. Copy `server/.env.example` to `server/.env`, then set local MySQL credentials and a long random `JWT_SECRET`.
3. Run `npm install`, `npm --prefix client install`, and `npm --prefix server install`.
4. For local development only, run `npm run seed` to add demo users, services, fields, equipment, and 21 days of weekday availability. Seeding is blocked when `NODE_ENV=production`; never seed demo records into a live database.
5. Run `npm run dev`. The app opens at http://localhost:5173 and the API at http://localhost:5000.

For a frontend served from another device or host, copy `client/.env.example` to `client/.env` and set `VITE_API_URL` and `VITE_SOCKET_URL` to the reachable API host before starting Vite. The server accepts verification documents up to 5 MB and stores them outside the public client; set `EQUIPMENT_DOCUMENT_DIR` in `server/.env` to choose a private storage location.

If you already created the database from an earlier schema, apply `server/database/migrations/20261007_booking_operator.sql` once before starting the updated server. Fresh databases created from the current `server/database/schema.sql` already include these columns, so do not apply that migration to a fresh database.

Local-only farmer and owner test accounts (password `demo123`): `farmer1@demo.com`, `farmer2@demo.com`, `owner1@demo.com`, and `owner2@demo.com`. Do not deploy the seed dataset or use these accounts for production.

Forgot-password requests return a one-time reset link in the API response only in development mode; no email is claimed or sent. In production, connect a mail delivery provider before exposing password recovery.

## Capabilities

Farmers add fields, search verified nearby equipment after selecting a location, request a time within an owner's published availability, follow booking status, see who will arrive, view accepted contact details, record reviews, and open disputes. When accepting, owners choose whether they will operate the equipment or send a driver; driver name and phone are required for a driver assignment and are shared with the farmer. Quote-priced services require the owner to enter a final amount during acceptance. Owners manage listings, services, availability, verification documents, requests, journey/service status, live location sharing, and manual payment records. Admins review users, registration certificates, equipment verification, bookings, payments, and disputes.

## API overview

The Express API is rooted at `/api`. Authentication is under `/auth` (`register`, `login`, `me`, `forgot-password`, `reset-password`). Marketplace routes include `/equipment`, `/equipment/nearby`, `/services`, and `/fields`. Booking lifecycle actions are under `/bookings`; payments, reviews, notifications, and disputes have their own resource routes. Admin endpoints are under `/admin` for statistics, users, equipment verification, bookings, payments, and disputes. The API health check is `GET /api/health`.

Booking status progression is enforced server-side: REQUESTED → ACCEPTED/REJECTED/CANCELLED → OWNER_EN_ROUTE → ARRIVED → SERVICE_STARTED → PAYMENT_PENDING → COMPLETED. Service completion timestamps are recorded in `service_sessions`; an owner records manual payment after the service, which completes the booking. Supported methods are CASH and OTHER_MANUAL; there is no online payment integration.

## Security and data

Passwords are bcrypt hashed. API access uses signed JWTs; active-account status, role, booking ownership, and equipment ownership are checked on the server. SQL uses parameterized queries. Verification files are stored outside the public client directory; admins can review them after signing in. Never commit `.env`. Configure HTTPS, a production secret, an explicit CORS origin, database backups, and private object/file storage for deployment. The schema is in `server/database/schema.sql`; it creates only the `agriiigo` database. Review that database name before running schema or seed commands.

## Layout

`client/` React application · `server/src/` API, auth, database, sockets, and routes · `server/database/` schema and seed · `server/.env.example` local configuration template.

The admin help contact displayed in the product is B.Krishna Sai, 7032185496.
