# Inventory Management App

A simple full-stack Inventory Management project built as a Skillwise assignment.
Backend: **Node.js + Express + SQLite**
Frontend: **React + Axios**

---

## Table of contents

* [Project Overview](#project-overview)
* [Tech stack](#tech-stack)
* [Folder structure](#folder-structure)
* [Quick start (local)](#quick-start-local)

  * [Backend](#backend)
  * [Frontend](#frontend)
* [Environment variables (`.env`)](#environment-variables-env)
* [Database (SQLite) — init snippet](#database-sqlite---init-snippet)
* [Main API endpoints (examples)](#main-api-endpoints-examples)
* [Import / Export CSV](#import--export-csv)
* [Deployment notes (Render / Vercel / Netlify)](#deployment-notes-render--vercel--netlify)
* [Bonus / Next steps](#bonus--next-steps)
* [License & contact](#license--contact)

---

# Project overview

This app manages products and inventory history. Features include:

* CRUD for products (name, unit, category, brand, stock, status, image)
* Inventory change history tracking (old/new quantities, date, user info)
* CSV import (bulk insert with duplicate handling) and CSV export
* Simple React UI for listing, searching, filtering, inline editing, and viewing history

---

# Tech stack

* Backend: Node.js, Express, SQLite3, Multer, csv-parser, dotenv, cors, json2csv
* Frontend: React (create-react-app), axios, react-router-dom

---

# Folder structure

```
project-root/
├─ backend/
│  ├─ server.js
│  ├─ package.json
│  ├─ .env
│  ├─ config
|    |─ inventory.db (or configured path)
│ 
└─ frontend/
   ├─ package.json
   ├─ src/
   └─ public/
```

---

# Quick start (local)

## Backend

```bash
cd backend
npm install
npm run server
# or
npm start
```

If your deploy platform runs commands from root:

```bash
npm install --prefix backend
npm start --prefix backend
```

## Frontend

```bash
cd frontend
npm install
npm start
# build
npm run build
```

---

# Environment variables (`.env`)

Create a `.env` file inside **backend/**:

```
PORT=4000
DATABASE_PATH=./inventory.db
JWT_SECRET=your_jwt_secret_here
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...
```

Add to `.gitignore`:

```
node_modules/
.env
```

---

# Database (SQLite) — init snippet

```js
import sqlite3 from "sqlite3";
const db = new sqlite3.Database(process.env.DATABASE_PATH || './inventory.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    unit TEXT,
    category TEXT,
    brand TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    status TEXT,
    image TEXT
  )`);

  db.run(`CREATE TABLE IF NOT_EXISTS inventory_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    old_quantity INTEGER,
    new_quantity INTEGER,
    change_date TEXT,
    user_info TEXT,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);
});
```

---

# Main API endpoints (examples)

Base path: `/api/products`

* **GET** `/api/products` — get all products
* **GET** `/api/products/:id` — get product
* **PUT** `/api/products/:id` — update product
* **DELETE** `/api/products/:id` — delete product
* **POST** `/api/products/import` — upload CSV
* **GET** `/api/products/export` — download CSV
* **GET** `/api/products/:id/history` — get history

---

# Import / Export CSV

### Backend

```js
import multer from "multer";
const upload = multer({ dest: "uploads/" });
router.post("/import", upload.single("csvFile"), ...);
```

### Frontend

* Export: axios GET with `responseType: 'blob'`
* Import: FormData + file upload

---

# Deployment notes

## Render (backend)

If backend is inside `backend/` folder:

```
Build Command: npm install --prefix backend
Start Command: npm start --prefix backend
```

If backend at root:

```
Build Command: npm install
Start Command: npm start
```

SQLite note: Many hosts use ephemeral disks → DB resets on restart. Prefer PostgreSQL or use persistent path like `/var/data/inventory.db`.

---

# Bonus / Next steps

* Add pagination
* Add authentication
* Migrate to PostgreSQL
* Add tests

---

# License & contact

Project for learning. Modify as needed.
