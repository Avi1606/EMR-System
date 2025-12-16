"""
appointment_service.py
Backend service for Scheduling & Queue Microservice (3.3)
Simulates Aurora PostgreSQL database + AWS AppSync GraphQL API

This module contains:
1. Mock data simulating Aurora fetch
2. Query function: get_appointments(filters)
3. Mutation function: update_appointment_status(id, new_status)
"""

from datetime import datetime
import json

# =============================================================================
# MOCK DATA - Simulating Aurora PostgreSQL Database
# =============================================================================
# In production, this data would be fetched from Aurora PostgreSQL using queries like:
# SELECT * FROM appointments WHERE date = $date AND status = $status;

appointments_data = [
    {
        "id": 1,
        "name": "Sarah Johnson",
        "date": "2025-12-16",
        "time": "09:00",
        "duration": 30,
        "doctorName": "Dr. Rajesh Kumar",
        "status": "Confirmed",
        "mode": "In-Person",
        "reason": "Diabetes Management",
        "phone": "+91 98765 43210",
        "email": "sarah.j@email.com",
        "notes": "Patient needs prescription refill"
    },
    {
        "id": 2,
        "name": "Michael Chen",
        "date": "2025-12-16",
        "time": "10:00",
        "duration": 45,
        "doctorName": "Dr. Priya Sharma",
        "status": "Scheduled",
        "mode": "In-Person",
        "reason": "Annual Physical Examination",
        "phone": "+91 98765 43211",
        "email": "m.chen@email.com",
        "notes": ""
    },
    {
        "id": 3,
        "name": "Emily Rodriguez",
        "date": "2025-12-16",
        "time": "11:30",
        "duration": 30,
        "doctorName": "Dr. Rajesh Kumar",
        "status": "Confirmed",
        "mode": "Video Call",
        "reason": "Cold and Flu Symptoms",
        "phone": "+91 98765 43212",
        "email": "emily.r@email.com",
        "notes": "Video consultation requested"
    },
    {
        "id": 4,
        "name": "Rahul Sharma",
        "date": "2025-12-17",
        "time": "09:00",
        "duration": 30,
        "doctorName": "Dr. Priya Sharma",
        "status": "Upcoming",
        "mode": "In-Person",
        "reason": "General Checkup",
        "phone": "+91 98765 43213",
        "email": "rahul.s@email.com",
        "notes": ""
    },
    {
        "id": 5,
        "name": "Anita Desai",
        "date": "2025-12-17",
        "time": "14:00",
        "duration": 45,
        "doctorName": "Dr. Amit Patel",
        "status": "Upcoming",
        "mode": "Video Call",
        "reason": "Follow-up Consultation",
        "phone": "+91 98765 43214",
        "email": "anita.d@email.com",
        "notes": ""
    },
    {
        "id": 6,
        "name": "Vikram Singh",
        "date": "2025-12-15",
        "time": "10:00",
        "duration": 30,
        "doctorName": "Dr. Rajesh Kumar",
        "status": "Confirmed",
        "mode": "In-Person",
        "reason": "Blood Pressure Check",
        "phone": "+91 98765 43215",
        "email": "vikram.s@email.com",
        "notes": "Regular checkup"
    },
    {
        "id": 7,
        "name": "Priya Nair",
        "date": "2025-12-15",
        "time": "15:30",
        "duration": 45,
        "doctorName": "Dr. Amit Patel",
        "status": "Cancelled",
        "mode": "In-Person",
        "reason": "Skin Consultation",
        "phone": "+91 98765 43216",
        "email": "priya.n@email.com",
        "notes": "Patient cancelled"
    },
    {
        "id": 8,
        "name": "Deepak Malhotra",
        "date": "2025-12-18",
        "time": "09:30",
        "duration": 30,
        "doctorName": "Dr. Priya Sharma",
        "status": "Scheduled",
        "mode": "In-Person",
        "reason": "Vaccination",
        "phone": "+91 98765 43217",
        "email": "deepak.m@email.com",
        "notes": ""
    },
    {
        "id": 9,
        "name": "Sunita Verma",
        "date": "2025-12-18",
        "time": "11:00",
        "duration": 60,
        "doctorName": "Dr. Rajesh Kumar",
        "status": "Upcoming",
        "mode": "In-Person",
        "reason": "Complete Health Checkup",
        "phone": "+91 98765 43218",
        "email": "sunita.v@email.com",
        "notes": ""
    },
    {
        "id": 10,
        "name": "Kiran Joshi",
        "date": "2025-12-16",
        "time": "16:00",
        "duration": 30,
        "doctorName": "Dr. Amit Patel",
        "status": "Confirmed",
        "mode": "Phone Call",
        "reason": "Test Results Discussion",
        "phone": "+91 98765 43219",
        "email": "kiran.j@email.com",
        "notes": ""
    },
    {
        "id": 11,
        "name": "Neha Kapoor",
        "date": "2025-12-14",
        "time": "10:30",
        "duration": 30,
        "doctorName": "Dr. Amit Patel",
        "status": "Confirmed",
        "mode": "Phone Call",
        "reason": "Medication Review",
        "phone": "+91 98765 43220",
        "email": "neha.k@email.com",
        "notes": "Past appointment - completed"
    },
    {
        "id": 12,
        "name": "Amit Tiwari",
        "date": "2025-12-19",
        "time": "14:30",
        "duration": 45,
        "doctorName": "Dr. Priya Sharma",
        "status": "Scheduled",
        "mode": "Video Call",
        "reason": "Mental Health Consultation",
        "phone": "+91 98765 43221",
        "email": "amit.t@email.com",
        "notes": "First time patient"
    }
]


# =============================================================================
# QUERY FUNCTION: get_appointments(filters)
# =============================================================================
def get_appointments(date=None, status=None):
    """
    Fetches appointments with optional filtering.

    This function simulates a GraphQL query that would be handled by AWS AppSync.

    GraphQL Query Structure:
    ------------------------
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

    In production, AppSync would resolve this query by:
    1. Parsing the GraphQL request
    2. Executing a Lambda resolver that queries Aurora PostgreSQL:
       SELECT * FROM appointments
       WHERE ($date IS NULL OR date = $date)
       AND ($status IS NULL OR status = $status);
    3. Returning the formatted JSON response

    Args:
        date (str, optional): Filter by specific date (format: YYYY-MM-DD)
        status (str, optional): Filter by status (Confirmed/Scheduled/Upcoming/Cancelled)

    Returns:
        list: List of appointment dictionaries matching the filters
    """
    # Start with all appointments (simulating database fetch)
    result = appointments_data.copy()
    
    # Apply date filter if provided
    if date:
        result = [apt for apt in result if apt["date"] == date]
    
    # Apply status filter if provided
    if status:
        result = [apt for apt in result if apt["status"] == status]
    
    return result


# =============================================================================
# MUTATION FUNCTION: update_appointment_status(id, new_status)
# =============================================================================
def update_appointment_status(appointment_id, new_status):
    """
    Updates the status of an appointment.

    This function simulates a GraphQL mutation handled by AWS AppSync.

    GraphQL Mutation Structure:
    ---------------------------
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

    In production, this mutation would trigger:

    1. APPSYNC MUTATION RESOLVER (Lambda Function):
       - Validates the new status value
       - Executes Aurora transactional write

    2. AURORA POSTGRESQL TRANSACTIONAL WRITE:
       BEGIN TRANSACTION;

       -- Update the appointment status
       UPDATE appointments
       SET status = $new_status,
           updated_at = NOW()
       WHERE id = $appointment_id;

       -- Log the status change for audit trail
       INSERT INTO appointment_audit_logs (
           appointment_id,
           previous_status,
           new_status,
           changed_by,
           changed_at
       ) VALUES (
           $appointment_id,
           (SELECT status FROM appointments WHERE id = $appointment_id),
           $new_status,
           $current_user_id,
           NOW()
       );

       COMMIT;
    
    3. APPSYNC SUBSCRIPTION TRIGGER:
       After successful mutation, AppSync broadcasts to all subscribed clients:

       subscription OnAppointmentStatusChanged {
           onAppointmentStatusChanged {
               id
               status
               updatedAt
           }
       }

       This enables real-time UI updates across all connected frontend clients
       without requiring manual refresh.

    DATA CONSISTENCY GUARANTEE:
    - The transactional write ensures atomicity (all-or-nothing)
    - If either UPDATE or INSERT fails, the entire transaction rolls back
    - This prevents data inconsistency between appointments and audit logs

    Args:
        appointment_id (int): The ID of the appointment to update
        new_status (str): New status value (Confirmed/Scheduled/Upcoming/Cancelled)

    Returns:
        dict: Updated appointment object or None if not found
    """
    for apt in appointments_data:
        if apt["id"] == appointment_id:
            # Simulating the status update (in production: Aurora write)
            apt["status"] = new_status

            # NOTE: In production, after this point:
            # 1. AppSync Subscription would be triggered automatically
            # 2. All subscribed clients receive the update in real-time
            # 3. Frontend updates immediately without polling

            return apt
    
    return None


# =============================================================================
# HELPER FUNCTION: get_appointments_by_period
# =============================================================================
def get_appointments_by_period(period):
    """
    Get appointments based on time period relative to today.

    This is a convenience function that wraps get_appointments()
    for common filtering scenarios.

    Args:
        period (str): One of 'today', 'upcoming', 'past', or 'all'

    Returns:
        list: Filtered list of appointments
    """
    today = datetime.now().strftime("%Y-%m-%d")
    
    if period == "today":
        return [apt for apt in appointments_data if apt["date"] == today]
    elif period == "upcoming":
        return [apt for apt in appointments_data if apt["date"] > today]
    elif period == "past":
        return [apt for apt in appointments_data if apt["date"] < today]
    else:
        return appointments_data.copy()


# =============================================================================
# EXPORT FOR FRONTEND (JSON format for JavaScript consumption)
# =============================================================================
def get_appointments_json(date=None, status=None):
    """
    Returns appointments as a JSON string for frontend consumption.
    """
    return json.dumps(get_appointments(date, status))


# =============================================================================
# TESTING / DEMONSTRATION
# =============================================================================
if __name__ == "__main__":
    print("=" * 60)
    print("EMR Appointment Service - Backend Simulation")
    print("=" * 60)

    print("\n1. All appointments:")
    all_apts = get_appointments()
    print(f"   Total count: {len(all_apts)}")
    for apt in all_apts[:3]:
        print(f"   - {apt['name']} on {apt['date']} at {apt['time']} ({apt['status']})")
    print("   ...")

    print("\n2. Today's appointments (2025-12-16):")
    today_apts = get_appointments(date="2025-12-16")
    print(f"   Count: {len(today_apts)}")
    for apt in today_apts:
        print(f"   - {apt['name']} at {apt['time']} with {apt['doctorName']}")

    print("\n3. Confirmed appointments:")
    confirmed_apts = get_appointments(status="Confirmed")
    print(f"   Count: {len(confirmed_apts)}")
    for apt in confirmed_apts:
        print(f"   - {apt['name']} on {apt['date']} ({apt['mode']})")

    print("\n4. Testing status update:")
    print("   Before: Appointment 1 status =", appointments_data[0]['status'])
    update_appointment_status(1, "Cancelled")
    print("   After:  Appointment 1 status =", appointments_data[0]['status'])

    print("\n" + "=" * 60)
    print("Backend service ready for frontend integration!")
    print("=" * 60)
