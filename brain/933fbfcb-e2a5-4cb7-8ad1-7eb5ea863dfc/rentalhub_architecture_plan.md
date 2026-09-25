# RentalHub Architecture & Implementation Plan

RentalHub is a full-featured, production-style equipment rental marketplace platform built on the MERN stack (MongoDB, Express.js, React.js, Node.js, Bootstrap 5).

---

## 1. System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React + Bootstrap 5)"]
        UI_Guest["Public Marketplace & Landing"]
        UI_Customer["Customer Portal & Booking Engine"]
        UI_Owner["Owner Dashboard & Inventory Manager"]
        UI_Admin["Admin Management Dashboard"]
        Contexts["Auth, Notification & Comparison Contexts"]
    end

    subgraph API_Gateway ["Backend REST API (Node.js + Express)"]
        Router["Express Router & Middleware"]
        AuthMid["JWT & RBAC Middleware (Customer/Owner/Admin)"]
        ValidationMid["Input & Date Conflict Validation"]
        Controllers["Controllers (Equipment, Booking, Review, Admin, etc.)"]
    end

    subgraph Database ["MongoDB & Mongoose"]
        UsersCol[("Users Collection")]
        EquipCol[("Equipment Collection")]
        BookCol[("Bookings Collection")]
        RevCol[("Reviews Collection")]
        CatCol[("Categories Collection")]
        NotifCol[("Notifications Collection")]
    end

    Client -->|Axios REST / JSON| Router
    Router --> AuthMid
    AuthMid --> ValidationMid
    ValidationMid --> Controllers
    Controllers --> UsersCol
    Controllers --> EquipCol
    Controllers --> BookCol
    Controllers --> RevCol
    Controllers --> CatCol
    Controllers --> NotifCol
```

---

## 2. Core User Roles & Matrix

| Capability | Guest | Customer | Owner / Business | Administrator |
|---|:---:|:---:|:---:|:---:|
| Browse & Search Equipment | ✅ | ✅ | ✅ | ✅ |
| Compare Equipment Options | ✅ | ✅ | ✅ | ✅ |
| View Real-time Availability | ✅ | ✅ | ✅ | ✅ |
| Book Equipment with Conflict Prevention | ❌ | ✅ | ❌ | ❌ |
| Booking History & Return Tracking | ❌ | ✅ | ❌ | ❌ |
| Leave Equipment Reviews | ❌ | ✅ (Rented) | ❌ | ❌ |
| List & Manage Equipment Inventory | ❌ | ❌ | ✅ | ✅ (Supervise) |
| Manage Blocked Dates / Maintenance | ❌ | ❌ | ✅ | ✅ |
| Approve / Reject / Fulfill Bookings | ❌ | ❌ | ✅ | ✅ |
| Manage Categories | ❌ | ❌ | ❌ | ✅ |
| Manage Users & Moderation | ❌ | ❌ | ❌ | ✅ |
| Global Analytics & Oversight | ❌ | ❌ | ❌ | ✅ |

---

## 3. Database Schema & Relationships

### `Users`
- `_id`, `name`, `email` (unique), `password` (bcrypt hash), `role` (`'customer' | 'owner' | 'admin'`), `phone`, `address`, `companyName`, `avatar`, `isActive`, `createdAt`, `updatedAt`

### `Categories`
- `_id`, `name`, `slug` (unique), `description`, `icon`, `image`, `createdAt`

### `Equipment`
- `_id`, `owner` (Ref -> User), `title`, `slug`, `category` (Ref -> Category), `description`, `condition` (`'New' | 'Like New' | 'Good' | 'Fair'`), `dailyRate`, `weeklyRate`, `securityDeposit`, `specifications` (`[{ key, value }]`), `images` (`[String]`), `location` (`{ address, city, state, zip }`), `isAvailable`, `blockedDates` (`[{ startDate, endDate, reason }]`), `rating`, `numReviews`, `isFeatured`, `createdAt`

### `Bookings`
- `_id`, `equipment` (Ref -> Equipment), `customer` (Ref -> User), `owner` (Ref -> User), `startDate`, `endDate`, `totalDays`, `dailyRate`, `rentAmount`, `securityDeposit`, `totalAmount`, `status` (`'pending' | 'confirmed' | 'active' | 'returned' | 'cancelled' | 'rejected'`), `deliveryMethod` (`'pickup' | 'delivery'`), `deliveryAddress`, `notes`, `cancellationReason`, `createdAt`

### `Reviews`
- `_id`, `equipment` (Ref -> Equipment), `customer` (Ref -> User), `booking` (Ref -> Booking), `rating` (1-5), `comment`, `createdAt`

### `Notifications`
- `_id`, `recipient` (Ref -> User), `sender` (Ref -> User), `title`, `message`, `type` (`'booking' | 'status' | 'review' | 'system'`), `link`, `isRead`, `createdAt`

---

## 4. Key Workflows

### A. Double-Booking Prevention Algorithm
```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant API as Booking Controller
    participant DB as MongoDB
    
    Customer->>API: POST /api/bookings (equipmentId, startDate, endDate)
    API->>DB: Query Equipment blockedDates
    API->>DB: Query Bookings where status in ['pending', 'confirmed', 'active'] AND (startDate < requestedEnd AND endDate > requestedStart)
    alt Overlap Detected
        API-->>Customer: 409 Conflict ("Equipment already booked for these dates")
    else Available
        API->>DB: Create Booking (status: 'pending')
        API->>DB: Create Notification for Equipment Owner
        API-->>Customer: 201 Created (Booking details & summary)
    end
```

### B. Booking Lifecycle & Transitions
- `pending`: Created by customer, awaiting owner confirmation.
- `confirmed`: Accepted by owner. Equipment is reserved.
- `active`: Equipment picked up or delivered to customer.
- `returned`: Equipment returned by customer, inspected, security deposit released.
- `cancelled`: Cancelled by customer before start date.
- `rejected`: Declined by owner (e.g. equipment under unexpected repair).

---

## 5. Technology Stack & Directory Structure
- **Backend**: Node.js v24, Express 4.x, Mongoose 8.x, JSON Web Token (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`.
- **Frontend**: React 18, React Router v6, Bootstrap 5.3, Bootstrap Icons, Axios.
- **Path**: `C:\Users\DELL USER\.gemini\antigravity\scratch\rentalhub`
