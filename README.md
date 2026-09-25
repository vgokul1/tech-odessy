# RentalHub — Commercial & Heavy Equipment Rental Marketplace

RentalHub is a production-grade, full-stack MERN (MongoDB, Express, React, Node.js) equipment rental marketplace connecting industrial contractors, event coordinators, and DIY builders with certified fleet owners and rental businesses, supervised by platform administrators.

---

## 🏗️ System Architecture

```
rentalhub/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js       # Register, login, profiles, admin user role management
│   │   ├── bookingController.js    # Conflict prevention, booking lifecycle, checkout
│   │   ├── categoryController.js   # Equipment categories with live item count
│   │   ├── dashboardController.js  # Role-specific KPI metrics (GMV, revenue, rentals)
│   │   ├── equipmentController.js  # Search, multi-filtering, sorting, availability engine
│   │   ├── notificationController.js # Real-time notification alerts
│   │   └── reviewController.js     # Post-return customer ratings & owner responses
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification & role authorization (customer/owner/admin)
│   │   └── errorMiddleware.js      # Global error & duplicate key handlers
│   ├── models/
│   │   ├── Booking.js              # Booking schema, status timeline, pricing audit
│   │   ├── Category.js             # Category schema with auto-slugging
│   │   ├── Equipment.js            # Equipment schema, specs, condition, blocked dates
│   │   ├── Notification.js         # User activity notifications
│   │   ├── Review.js               # Customer ratings with average rating aggregation
│   │   └── User.js                 # User credentials, bcrypt hashing, JWT tokens
│   ├── routes/                     # Express REST route handlers
│   ├── utils/
│   │   └── seeder.js               # Rich realistic database seeder
│   ├── .env                        # Environment variables & secrets
│   ├── server.js                   # Main API entrypoint
│   └── test_e2e.js                 # 14-step automated end-to-end integration test
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── BookingModal.jsx        # Date range picker, conflict check, pricing breakdown
    │   │   ├── CategoryFormModal.jsx   # Admin category creation/editing
    │   │   ├── DemoLoginBar.jsx        # 1-Click quick tester persona switcher
    │   │   ├── EquipmentCard.jsx       # Card with condition badge, rating, rates
    │   │   ├── EquipmentFormModal.jsx  # Owner/Admin inventory management
    │   │   ├── Footer.jsx              # Marketplace footer with trust badges
    │   │   ├── Navbar.jsx              # Dynamic role-based navigation & notification bell
    │   │   ├── ProtectedRoute.jsx      # Role-based route guard
    │   │   ├── RatingStars.jsx         # 5-star visual rating component
    │   │   └── ReviewModal.jsx         # Rating & feedback modal for completed rentals
    │   ├── context/
    │   │   ├── AuthContext.jsx         # Persistent JWT auth, user state, demo logins
    │   │   └── NotificationContext.jsx # Notification polling, unread counters
    │   ├── pages/
    │   │   ├── AdminDashboardPage.jsx  # Global ledger, user role control, moderation
    │   │   ├── CustomerDashboardPage.jsx # My rentals, tracking, cancellations, reviews
    │   │   ├── EquipmentCatalogPage.jsx # Search, multi-filter sidebar, sorting, pagination
    │   │   ├── EquipmentDetailPage.jsx # Gallery, specs, owner card, booking widget
    │   │   ├── HomePage.jsx            # Hero search, categories, featured units, workflow
    │   │   ├── LoginPage.jsx           # Sign in with 1-click persona buttons
    │   │   └── RegisterPage.jsx        # Role-based customer vs fleet owner registration
    │   ├── services/
    │   │   └── api.js                  # Axios client with automatic Bearer token interceptor
    │   ├── App.jsx                     # Route definitions & providers
    │   ├── index.css                   # Responsive styling, badge palette, Bootstrap custom
    │   └── main.jsx                    # React 18 bootstrap
    ├── index.html
    ├── package.json
    └── vite.config.js                  # Dev server with backend API proxy
```

---

## ⚡ Quick Start Instructions

### Prerequisites
- **Node.js**: v16+ (tested on Node v24.21.0)
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017`
- **NPM**: v8+

### 1. Seed the Database with Realistic Fleet Data
Open a terminal in `backend`:
```bash
cd backend
npm run seed
```
*Seeds 5 users across all 3 roles, 6 industrial categories, 7 detailed machinery listings, 4 lifecycle bookings, reviews, and notifications.*

### 2. Start the Backend API Server
```bash
cd backend
npm start
```
*The API runs at `http://localhost:5000` with MongoDB connected.*

### 3. Start the React Frontend Application
Open a new terminal in `frontend`:
```bash
cd frontend
npm run dev
```
*The React UI runs at `http://localhost:3000`.*

---

## 🔑 One-Click Demo Personas

The application features a **Quick Switcher Bar** at the top of every page. You can switch between personas with a single click, or use standard credentials:

| Persona | Email | Password | Role Description |
|---|---|---|---|
| **Contractor (Customer)** | `customer@rentalhub.com` | `password123` | Searches equipment, checks availability, books machines, tracks rentals, leaves reviews. |
| **Fleet Owner (Apex Rentals)** | `apexrentals@equipment.com` | `password123` | Manages fleet inventory, sets pricing/specs, approves/dispatches rentals, marks returns. |
| **Platform Administrator** | `admin@rentalhub.com` | `password123` | Platform-wide oversight: GMV metrics, user role management, category controls, global ledger. |

---

## 🛡️ Core Functional Highlights

1. **Conflict-Free Double-Booking Prevention**:
   The booking engine strictly checks overlapping dates for all `pending`, `confirmed`, and `active` rentals:
   `startDate <= existingEnd && endDate >= existingStart`. Conflicting requests receive HTTP 409 Conflict.
2. **Transparent Rental Cost Calculation**:
   - `Daily Rate × Rental Days = Subtotal`
   - `Refundable Security Deposit` (returned upon inspection)
   - `Marketplace Platform Service Fee ($15)`
   - `Total Amount Due`
3. **Comprehensive Lifecycle Tracking**:
   `pending` ➔ `confirmed` (Approved by Owner) ➔ `active` (Dispatched to site) ➔ `returned` (Inspected and checked back into yard).
4. **Verified Post-Return Reviews**:
   Customers can only review equipment after the rental has successfully reached `returned` status. Reviews automatically recalculate the machine's overall rating.
5. **Role-Based Navigation & Access Control**:
   JWT Bearer tokens with client-side route protection and backend middleware authorization guards.

---

## 🧪 Automated End-to-End Verification
To execute the 14-step integration test verifying health, authentication, conflict prevention, status transitions, review locks, and admin statistics:
```bash
cd backend
node test_e2e.js
```
All 14 tests run against the live server and assert expected responses.
