# EMR Appointment Management System

A modern appointment management system for Electronic Medical Records (EMR), built as part of the SDE Intern Assignment.


## 🔗 Live Demo

**🌐 [Live Demo: https://emrsys.netlify.app/](https://emrsys.netlify.app/)**

---

## 📋 Assignment Overview

This project implements **Feature B: Appointment Scheduling and Queue Management**, including:
- Backend service with data mocking, query functions, and mutation functions
- Frontend integration with React hooks for data fetching and state management
- Calendar-based filtering and tab navigation
- Real-time status updates

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  EMR_Frontend_Assignment.jsx                                │
│  - useState/useEffect for data management                   │
│  - Calendar Widget with date selection                      │
│  - Tab filtering (Upcoming, Today, Past, All)               │
│  - Status update buttons                                    │
└────────────────────────┬───────────────────────────────────┘
                         │ Simulated GraphQL API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend (Python)                              │
│  appointment_service.py                                     │
│  - get_appointments(date, status) - Query function          │
│  - update_appointment_status(id, status) - Mutation         │
│  - 12 mock appointments (simulating Aurora PostgreSQL)      │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Technical Explanation

### GraphQL Query Structure for `getAppointments`

The `get_appointments()` function is designed to simulate a GraphQL query that would be resolved by AWS AppSync:

```graphql
query GetAppointments($date: String, $status: String) {
    getAppointments(date: $date, status: $status) {
        id
        name
        date
        time
        duration
        doctorName
        status
        mode
        reason
        phone
        email
        notes
    }
}
```

**Query Features:**
- **Optional Parameters:** Both `date` and `status` are optional, allowing flexible filtering
- **Date Filter:** Format `YYYY-MM-DD` to filter appointments by specific date
- **Status Filter:** Accepts `Confirmed`, `Scheduled`, `Upcoming`, or `Cancelled`
- **Combined Filters:** Both can be used together for precise filtering

### GraphQL Mutation Structure for `updateAppointmentStatus`

```graphql
mutation UpdateAppointmentStatus($id: ID!, $status: String!) {
    updateAppointmentStatus(id: $id, status: $status) {
        id
        name
        date
        time
        doctorName
        status
        mode
    }
}
```

### Data Consistency Mechanism

The Python backend ensures data consistency through the following approach:

1. **Transactional Writes (Simulated Aurora PostgreSQL):**
   ```sql
   BEGIN TRANSACTION;
   
   UPDATE appointments 
   SET status = $new_status, updated_at = NOW()
   WHERE id = $appointment_id;
   
   INSERT INTO appointment_audit_logs (
       appointment_id, previous_status, new_status, changed_at
   ) VALUES ($appointment_id, $old_status, $new_status, NOW());
   
   COMMIT;
   ```

2. **Atomic Operations:** Either both the update and audit log insert succeed, or neither does

3. **Real-time Synchronization (Simulated AppSync Subscription):**
   ```graphql
   subscription OnAppointmentStatusChanged {
       onAppointmentStatusChanged {
           id
           status
           updatedAt
       }
   }
   ```
   - After status update, all connected clients receive updates automatically
   - Frontend refreshes local state immediately to reflect changes

4. **Optimistic UI Updates:** The frontend updates immediately after mutation, providing instant feedback

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.x (for backend service testing)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/emr-appointment-system.git
cd emr-appointment-system

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Testing Backend Service

```bash
# Run the Python backend simulation
python appointment_service.py
```

## ✨ Features Implemented

### Task 1: Backend Service (appointment_service.py)
- ✅ **Data Mocking:** 12 hardcoded appointments with all required fields
- ✅ **Query Function:** `get_appointments(date, status)` with optional filters
- ✅ **Mutation Function:** `update_appointment_status(id, new_status)` with AppSync/Aurora comments

### Task 2: Frontend Integration (EMR_Frontend_Assignment.jsx)
- ✅ **Data Fetching:** useState/useEffect to load data from simulated backend
- ✅ **Calendar Filtering:** Click date → filter appointments by selected date
- ✅ **Tab Filtering:** Upcoming, Today, Past, All tabs filter by date relative to today
- ✅ **Status Update:** Confirm/Cancel buttons call mutation and refresh UI immediately

## 🎯 UI Components

| Component | Description |
|-----------|-------------|
| **Sidebar** | Navigation icons (Calendar highlighted) |
| **Stats Cards** | Today's appointments, Confirmed, Upcoming, Virtual counts |
| **Calendar Widget** | Interactive month view with date selection |
| **Tab Navigation** | Upcoming, Today, Past, All filters |
| **Search Bar** | Search by patient name, doctor, or reason |
| **Filter Dropdowns** | Status and Doctor filters |
| **Appointment Cards** | Patient details, doctor, time, mode, status, actions |

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend Simulation:** Python 3.x (simulating Aurora PostgreSQL + AWS AppSync)
- **Styling:** Tailwind CSS for responsive design

## 📁 Project Structure

```
emr-appointment-system/
├── appointment_service.py    # Backend service (Task 1)
├── src/
│   ├── EMR_Frontend_Assignment.jsx  # Main UI component (Task 2)
│   ├── App.jsx               # App wrapper
│   ├── main.jsx              # Entry point
│   └── index.css             # Tailwind imports
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md                 # This file
```

