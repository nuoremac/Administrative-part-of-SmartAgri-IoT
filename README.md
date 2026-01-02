
---

# 🌱 Smart Agro — Intelligent Agriculture Web Platform

Smart Agro is a modern web application designed to support **smart agriculture management** through a clean administrative dashboard.
The platform focuses on **parcels, sensors, users, and system monitoring**, with multilingual support and a scalable architecture ready for real IoT data.

This project is currently built with **mock data** to validate UX, architecture, and workflows before backend and hardware integration.

---

## 🚀 Tech Stack

* **Next.js 16 (App Router)**
* **React 19**
* **TypeScript**
* **Tailwind CSS v4**
* **Recharts** (data visualization)
* **LocalStorage (mock persistence)**
* **useSyncExternalStore** (hydration-safe global state)

---

## 🌍 Internationalization (i18n)

The application supports **English 🇬🇧 and French 🇫🇷** across **all pages**, including:

* Login
* Dashboard
* Parcels
* Sensors
* Users
* Modals, buttons, toasts, and table headers

### Key points

* One **global language provider**
* Language stored in `localStorage`
* No hydration mismatch
* `useT()` helper for translations
* Missing translations are logged (dev-friendly)

---

## 🔐 Authentication (Mocked)

* **Administrator login page**
* Email + security code
* Password visibility toggle
* “Forgot code” message
* Invalid credentials handling
* Language selector available on login screen
* Session stored locally (mock)

> ⚠️ Authentication is mocked for now.
> The structure is ready for real backend integration.

---

## 📊 Admin Dashboard

The admin dashboard provides a **system overview**, inspired by professional agri-tech platforms.

### Features

* KPI cards (users, parcels, sensors, etc.)
* Alerts with severity levels
* Sensor trends
* Dark / light mode (GitHub-style)
* Global search bar
* Responsive layout (desktop + mobile)

---

## 🌾 Parcels Management

### Parcels List

* Pagination (10 per page)
* Sorting (ID, owner, area, sensors)
* Global search integration
* “Consulter” button → parcel detail page
* Delete with **undo toast**

### Parcel Details

* Parcel information card
* Soil moisture line chart (24h / 7d)
* Associated sensors table
* Relative timestamps (“il y a 2h”)
* **Edit parcel modal**

  * Name
  * Owner
  * Area (m²)
  * Number of sensors
* Instant UI update + toast confirmation
* Hydration-safe rendering

---

## 📡 Sensors Management

### Sensors List

Columns:

* Sensor ID
* Sensor name
* Status (OK / Warning / Offline)
* Last measurement
* Associated parcels
* Actions

Features:

* Pagination
* Sorting
* Global search
* Status badges
* Delete + undo toast
* “Consulter” → sensor detail page

### Sensor Details

* Sensor information
* Status badge
* Last measurement + timestamp
* **List of associated parcels**
* “Consulter” button to navigate to parcel details

---

## 👥 Users (Admin)

* Users list with search, pagination, and sorting
* Add / edit user modal
* Mock CRUD operations
* Toast notifications
* Global search integration
* Ready for role-based permissions

---

## 🧠 Architecture Decisions

### Why `useSyncExternalStore`?

* Prevents hydration mismatches
* Safe for SSR + client state
* Avoids `useEffect` state loops
* Recommended for shared external state (React 18+)

### Why mock data?

* Validate UX and flows early
* Enable frontend-first development
* Easy replacement with API later

---

## 📁 Project Structure (Simplified)

```txt
src/
 ├─ app/
 │   └─ admin/
 │       ├─ dashboard/
 │       ├─ parcels/
 │       │   └─ [id]/
 │       ├─ sensors/
 │       │   └─ [id]/
 │       └─ users/
 ├─ components/
 │   ├─ admin/
 │   ├─ i18n/
 │   ├─ theme/
 │   └─ ui/
 ├─ lib/
 │   ├─ mockParcels.ts
 │   ├─ mockSensors.ts
 │   └─ mockUsers.ts
```

---

## 🧪 Current Limitations

* No real backend yet
* No real IoT data
* Authentication is mocked
* No role separation beyond admin

These are **intentional** and planned for future iterations.

---
## Project launch
```Bash
cd smart-agro
npm run dev
```
---

## 🔮 Next Steps

* Backend API 
* Real sensor ingestion (LoRaWAN / MQTT)
* Role-based access control
* Export & analytics
* Alerts automation

---

## 👨‍💻 Author

**Smart Agro**
Intelligent Agriculture Platform
Designed & developed for scalable agri-tech systems.

---

