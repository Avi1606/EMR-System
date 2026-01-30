# EMR Appointment Management System

A modern appointment management system for Electronic Medical Records (EMR), built as part of the SDE Intern Assignment. This project implements **Feature B: Appointment Scheduling and Queue Management**.

---

## 🔗 Links

| Resource | Link |
|----------|------|
| **Live Demo** | [https://emrsys.netlify.app/](https://emrsys.netlify.app/) |
| **Git Repository** | [GitHub Repository](https://github.com/yourusername/emr-appointment-system) |
| **Frontend File** | `src/EMR_Frontend_Assignment.jsx` |
| **Backend File** | `appointment_service.py` |

---

## 📋 Submission Checklist

| Requirement | Status | Location |
|-------------|--------|----------|
| Single Repository | ✅ | This Git repository |
| Frontend File (.jsx) | ✅ | `src/EMR_Frontend_Assignment.jsx` |
| Backend File (Python) | ✅ | `appointment_service.py` |
| Live Link | ✅ | [https://emrsys.netlify.app/](https://emrsys.netlify.app/) |
| Technical Explanation | ✅ | See sections below |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  EMR_Frontend_Assignment.jsx                                │
│  - useState/useEffect for data management                   │
│  - Calendar Widget with date selection                      │
│  - Tab filtering (Upcoming, Today, Past, All)               │
│  - Status update buttons with optimistic UI                 │
└────────────────────────┬───────────────────────────────────┘
                         │ Simulated GraphQL API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend (Python)                              │
│  appointment_service.py                                     │
│  - get_appointments(date, status, doctorName) - Query       │
│  - update_appointment_status(id, status) - Mutation         │
│  - create_appointment(payload) - Mutation with validation   │
│  - delete_appointment(id) - Mutation                        │
│  - 12 mock appointments (simulating Aurora PostgreSQL)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Explanation

### 1. GraphQL Query Structure for `getAppointments`

The `get_appointments()` function is designed to simulate a GraphQL query that would be resolved by AWS AppSync. Here is the query structure:

```graphql
query GetAppointments($date: String, $status: String, $doctorName: String) {
    getAppointments(date: $date, status: $status, doctorName: $doctorName) {
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

**Query Design Rationale:**

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **Optional Parameters** | All filters (`date`, `status`, `doctorName`) are optional | Enables flexible filtering - fetch all or filter by any combination |
| **Date Filter** | Format: `YYYY-MM-DD` | Standard ISO format for consistent date handling |
| **Status Filter** | Enum: `Confirmed`, `Scheduled`, `Upcoming`, `Cancelled` | Maps directly to appointment lifecycle states |
| **Doctor Filter** | String match on `doctorName` | Enables per-doctor schedule views |
| **Combined Filters** | AND logic between filters | Supports complex queries like "all confirmed appointments for Dr. Kumar on 2026-01-30" |

**Backend Resolution (Simulated Aurora PostgreSQL):**
```sql
SELECT * FROM appointments
WHERE ($date IS NULL OR date = $date)
AND ($status IS NULL OR status = $status)
AND ($doctorName IS NULL OR doctor_name = $doctorName);
```

---

### 2. GraphQL Mutation Structure for `updateAppointmentStatus`

```graphql
mutation UpdateAppointmentStatus($id: ID!, $status: String!) {
    updateAppointmentStatus(id: $id, status: $status) {
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

---

### 3. Data Consistency Mechanisms in Python Functions

The Python backend (`appointment_service.py`) ensures data consistency through multiple mechanisms:

#### A. Transactional Writes (Simulated Aurora PostgreSQL)

All mutations are designed to execute as atomic transactions:

```sql
BEGIN TRANSACTION;

-- Update the appointment status
UPDATE appointments
SET status = $new_status, updated_at = NOW()
WHERE id = $appointment_id;

-- Log the status change for audit trail
INSERT INTO appointment_audit_logs (
    appointment_id, previous_status, new_status, changed_by, changed_at
) VALUES (
    $appointment_id, $old_status, $new_status, $current_user_id, NOW()
);

COMMIT;
```

**Consistency Guarantee:** Either both the UPDATE and INSERT succeed, or neither does (rollback on failure).

#### B. Time Conflict Detection (create_appointment)

Before creating a new appointment, the system checks for scheduling conflicts:

```python
# Overlap detection algorithm:
# Two time ranges overlap if: (new_start < existing_end) AND (existing_start < new_end)

for apt in appointments_data:
    if (apt['doctorName'] == new_doctor and
        apt['date'] == new_date and
        apt['status'] != 'Cancelled'):
        
        existing_start = time_to_minutes(apt['time'])
        existing_end = existing_start + apt['duration']
        
        if new_start < existing_end and existing_start < new_end:
            raise ValueError("Time conflict detected...")
```

**Consistency Guarantee:** Prevents double-booking a doctor for overlapping time slots.

#### C. Real-time Synchronization (Simulated AppSync Subscriptions)

```graphql
subscription OnAppointmentStatusChanged {
    onAppointmentStatusChanged {
        id
        status
        updatedAt
    }
}
```

- After any mutation, AppSync would broadcast updates to all subscribed clients
- Frontend receives real-time updates without polling
- Ensures all users see consistent data

#### D. Optimistic UI Updates

The frontend implements optimistic updates for immediate user feedback:

1. User clicks "Confirm" button
2. UI updates immediately (optimistic)
3. API call executes in background
4. If API fails, UI rolls back to previous state

---

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

---

## ✨ Features Implemented

### Task 1: Backend Service (`appointment_service.py`)

| Feature | Function | Description |
|---------|----------|-------------|
| Data Mocking | `appointments_data` | 12 hardcoded appointments simulating Aurora PostgreSQL |
| Query | `get_appointments(date, status, doctorName)` | Flexible filtering with optional parameters |
| Mutation | `update_appointment_status(id, new_status)` | Status updates with audit trail comments |
| Mutation | `create_appointment(payload)` | New appointments with conflict detection |
| Mutation | `delete_appointment(id)` | Soft/hard delete with audit logging |

### Task 2: Frontend Integration (`EMR_Frontend_Assignment.jsx`)

| Feature | Implementation |
|---------|----------------|
| Data Fetching | `useState` + `useEffect` hooks for loading and managing appointments |
| Calendar Filtering | Interactive calendar widget - click date to filter |
| Tab Filtering | Upcoming, Today, Past, All tabs filter by date relative to today |
| Search | Real-time search by patient name, doctor, or reason |
| Status Update | Confirm/Cancel buttons with immediate UI refresh |
| Create Appointment | Modal form with validation and conflict detection |

---

## 🎯 UI Components

| Component | Description |
|-----------|-------------|
| **Sidebar** | Navigation icons with Calendar highlighted |
| **Stats Cards** | Today's appointments, Confirmed, Upcoming, Virtual counts |
| **Calendar Widget** | Interactive month view with date selection |
| **Tab Navigation** | Upcoming, Today, Past, All filters |
| **Search Bar** | Search by patient name, doctor, or reason |
| **Filter Dropdowns** | Status and Doctor filter dropdowns |
| **Appointment Cards** | Patient details, doctor, time, mode, status, action buttons |
| **Create Modal** | Form for creating new appointments |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend Simulation | Python 3.x (simulating Aurora PostgreSQL + AWS AppSync) |
| Styling | Tailwind CSS for responsive design |
| Deployment | Netlify (Frontend) |

---

## 📁 Project Structure

```
emr-appointment-system/
├── appointment_service.py    # Backend service (Task 1) - Python functions
├── src/
│   ├── EMR_Frontend_Assignment.jsx  # Main UI component (Task 2)
│   ├── App.jsx               # App wrapper
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind CSS imports
├── index.html                # HTML entry point
├── package.json              # Node.js dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
└── README.md                 # This documentation file
```

---

## 📝 API Reference

### Query: `get_appointments(date?, status?, doctorName?)`

Fetches appointments with optional filtering.

**Parameters:**
- `date` (string, optional): Filter by date (format: YYYY-MM-DD)
- `status` (string, optional): Filter by status (Confirmed/Scheduled/Upcoming/Cancelled)
- `doctorName` (string, optional): Filter by doctor name

**Returns:** Array of appointment objects

### Mutation: `update_appointment_status(id, new_status)`

Updates an appointment's status.

**Parameters:**
- `id` (int): Appointment ID
- `new_status` (string): New status value

**Returns:** Updated appointment object or None

### Mutation: `create_appointment(payload)`

Creates a new appointment with validation.

**Parameters:**
- `payload` (dict): Appointment data with required fields:
  - `patientName`, `date`, `time`, `duration`, `doctorName`, `mode`

**Returns:** Created appointment object

**Raises:** `ValueError` if validation fails or time conflict exists

### Mutation: `delete_appointment(id)`

Deletes an appointment.

**Parameters:**
- `id` (int): Appointment ID to delete

**Returns:** Boolean indicating success

---

## 📄 License

This project is part of an SDE Intern Assignment.
