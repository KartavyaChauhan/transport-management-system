# Transportation Management System (TMS) - Proof of Concept

A full-stack logistics dashboard designed to manage shipments, track vehicle fleets, and provide real-time financial analytics. This project serves as a Proof of Concept (POC) for a modern, open-access Control Center application.

## 🚀 Live Demo

* **Frontend (Vercel):** (https://transport-management-system-ivory.vercel.app/)
* **Backend (Render):**  (https://transport-management-system-2-fyvz.onrender.com/)

---

## 🛠️ Tech Stack

### Frontend (Client)
* **Framework:** React (Vite)
* **Language:** TypeScript
* **UI Library:** Material UI (MUI)
* **Data Grid:** MUI X Data Grid
* **GraphQL Client:** URQL
* **Charts:** Recharts
* **Styling:** Emotion (Styled Components)

### Backend (Server)
* **Runtime:** Node.js
* **Framework:** Apollo Server (GraphQL)
* **Database:** MongoDB (via Mongoose)
* **Language:** TypeScript
* **Tools:** `ts-node` for execution

---

## 📂 Project Structure

This project uses a monorepo-style structure separating the client and server.

```text
/root
├── client/                  # Frontend Application
│   ├── src/
│   │   ├── components/      # Shared UI Components (Layout, Charts)
│   │   ├── graphql/         # GraphQL Queries & Mutations
│   │   ├── pages/           # Main Pages (Dashboard, Shipments, Vehicles)
│   │   └── App.tsx          # Main Entry Point
│   └── package.json
│
├── server/                  # Backend API
│   ├── src/
│   │   ├── graphql/         # TypeDefs & Resolvers
│   │   ├── models/          # Mongoose Schemas (Shipment, Vehicle)
│   │   └── index.ts         # Server Entry Point
│   └── package.json
│
└── README.md                # Project Documentation
```

## 🔑 Key Decisions & Architecture

1.  **"Smart Page" Architecture**
    * Instead of fragmenting logic into many small components, main pages (`Shipments.tsx`, `Vehicles.tsx`) are self-contained. They handle their own data fetching, modals, and logic. This makes the code easier to read and maintain for a POC.

2.  **Open Access Design**
    * **Decision:** Authentication was intentionally removed to fulfill the "No access limitations" requirement.
    * **Result:** The app is plug-and-play. No login required; any user can Create, Read, Update, and Delete (CRUD) data instantly.

3.  **Robust Data Handling**
    * **Issue:** Early testing showed dashboard crashes due to "dirty data" (strings vs numbers) in the database.
    * **Solution:** Implemented a "Bulletproof" JavaScript resolver in the backend that safely cleans and parses data before returning it, ensuring the dashboard never crashes on `$0` values.

4.  **Performance**
    * Used Server-Side Pagination for data grids to ensure scalability.
    * Used `.lean()` in Mongoose queries to return plain JSON objects, significantly speeding up read operations.

---

## ⚠️ Known Issues / Limitations

* **Financial Calculation:** Total revenue is calculated on the fly in JavaScript. For a dataset larger than 100,000 records, this should be moved to a MongoDB Aggregation Pipeline.
* **Image Duplication:** The driver images are generated using a deterministic ID based on the row index. This ensures unique images for the first 100 drivers but may repeat if the fleet grows beyond that.

---

## 💻 How to Run Locally

### Prerequisites
* Node.js (v16 or higher)
* MongoDB (Running locally or a cloud URI)

### 1. Setup Backend
Open a terminal in the root folder:
```bash
cd server
npm install
# Create a .env file with your DB connection: MONGODB_URI=...
npm run dev
```
*Server runs at: `http://localhost:4000`*

### 2. Setup Frontend
Open a **new** terminal in the root folder:

```bash
cd client
npm install
npm run dev
```
*Client runs at: `http://localhost:5173`*

---

## ☁️ Deployment Guide

### Backend (Render)
* **Build Command:** `npm install && npx tsc`
* **Start Command:** `node dist/index.js`
* **Environment Variables:**
    * `MONGODB_URI`: Your MongoDB connection string.
    * `JWT_SECRET`: Any dummy value (required for safety check).

### Frontend (Vercel)
* **Framework Preset:** Vite
* **Build Command:** `vite build` (Strict Type Checking Disabled)
* **Environment Variables:**
    * `VITE_API_URL`: The URL of your deployed Render backend.

---

## 🎨 Features Overview

### 📊 Dashboard Analytics
- Real-time financial widgets (e.g., **Total Revenue**, **Active Shipments**)
- Interactive data visualizations powered by **Recharts**
- Live system alerts and operational health monitoring

---

### 📦 Shipment Management (CRUD)
- **Create:** Add new shipments with origin, destination, and cost details
- **Read:** View all shipments in a paginated and sortable data grid
- **Update:** Modify shipment status (e.g., *In Transit* → *Delivered*)
- **Delete:** Permanently remove shipment records from the database

---

### 🚚 Fleet Management
- Track vehicles and driver availability in real time
- Clear visual status indicators (e.g., **Active**, **Maintenance**)

---

## 🤖 AI Usage & Acknowledgment

This project was developed with the assistance of an AI tool (Google Gemini Pro-3) during the prototyping and development process. The AI was used as a supportive aid to speed up development, explore solutions, and resolve implementation challenges.

AI assistance was used for:
- Exploring architectural approaches and implementation options
- Generating initial scaffolding and boilerplate code
- Debugging errors and resolving configuration or deployment issues
- Refining and optimizing existing logic for correctness and performance

The final project represents an iterative collaboration between the developer and AI tooling, where generated outputs were adapted, modified, and integrated as needed rather than used verbatim.
