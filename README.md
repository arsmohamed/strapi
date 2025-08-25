# OMS Mini – Strapi v5 + GraphQL + Vite React (Automation Demo)

[![CI](https://github.com/YOUR_USERNAME/oms-mini/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/oms-mini/actions)

A minimal **Order Management System slice** built with **Strapi v5 + GraphQL** backend and **Vite + React + TypeScript** frontend.  
Includes **Docker Compose for local dev** and **GitHub Actions CI** to prove end-to-end delivery (DB + API + client).

![screenshot](docs/screenshot.png)  
_(Replace with actual screenshot or gif of product list + create order flow)_

---

## 🚀 Quick Start

```bash
# 1. Clone repo
git clone https://github.com/YOUR_USERNAME/oms-mini.git
cd oms-mini

# 2. Setup environment
cp .env.example .env

# 3. Start backend services (Postgres + Strapi)
docker compose up -d

# 4. Install frontend deps and run dev server
cd web
npm install
npm run dev
```
