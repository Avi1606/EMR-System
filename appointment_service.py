"""
appointment_service.py
Backend service for Scheduling & Queue Microservice (3.3)
Simulates Aurora PostgreSQL database + AWS AppSync GraphQL API

This module contains:
1. Mock data simulating Aurora fetch
2. Query function: get_appointments(filters)
3. Mutation function: update_appointment_status(id, new_status)
4. Create function: create_appointment(payload) - with conflict detection
5. Delete function: delete_appointment(id)

API Contract:
-------------
get_appointments(filters: { date?: string, status?: string, doctorName?: string }) -> Appointment[]
create_appointment(input: CreateAppointmentInput) -> Appointment
update_appointment_status(id: string, new_status: string) -> Appointment
delete_appointment(id: string) -> boolean
"""

from datetime import datetime
import json

# =============================================================================
# MOCK DATA - Simulating Aurora PostgreSQL Database
# =============================================================================
# In production, this data would be fetched from Aurora PostgreSQL using queries like:
# SELECT * FROM appointments WHERE date = $date AND status = $status;

# Auto-increment counter for generating unique IDs
_next_id = 13

appointments_data = [
    {
        "id": 1,
        "name": "Sarah Johnson",
        "date": "2026-01-30",
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
        "date": "2026-01-30",
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
        "date": "2026-01-30",
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
        "date": "2026-01-31",
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
        "date": "2026-01-31",
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
        "date": "2026-01-29",
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
        "date": "2026-01-29",
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
        "date": "2026-02-01",
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
        "date": "2026-02-01",
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
        "date": "2026-01-30",
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
        "date": "2026-01-28",
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
        "date": "2026-02-02",
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
def get_appointments(date=None, status=None, doctorName=None):
    """
    Fetches appointments with optional filtering.

    This function simulates a GraphQL query that would be handled by AWS AppSync.

    GraphQL Query Structure:
    ------------------------
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

    In production, AppSync would resolve this query by:
    1. Parsing the GraphQL request
    2. Executing a Lambda resolver that queries Aurora PostgreSQL:
       SELECT * FROM appointments
       WHERE ($date IS NULL OR date = $date)
       AND ($status IS NULL OR status = $status)
       AND ($doctorName IS NULL OR doctor_name = $doctorName);
    3. Returning the formatted JSON response

    Args:
        date (str, optional): Filter by specific date (format: YYYY-MM-DD)
        status (str, optional): Filter by status (Confirmed/Scheduled/Upcoming/Cancelled)
        doctorName (str, optional): Filter by doctor name

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
    
    # Apply doctor filter if provided
    if doctorName:
        result = [apt for apt in result if apt["doctorName"] == doctorName]

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
# CREATE FUNCTION: create_appointment(payload)
# =============================================================================
def create_appointment(payload):
    """
    Creates a new appointment with validation and time conflict detection.

    This function simulates a GraphQL mutation handled by AWS AppSync.

    GraphQL Mutation Structure:
    ---------------------------
    mutation CreateAppointment($input: CreateAppointmentInput!) {
        createAppointment(input: $input) {
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

    In production, this mutation would:

    1. VALIDATION LAYER (Lambda Resolver):
       - Validates required fields exist
       - Validates date/time format
       - Checks for time conflicts

    2. AURORA POSTGRESQL TRANSACTIONAL WRITE:
       BEGIN TRANSACTION;

       -- Check for time conflicts (overlap detection)
       SELECT COUNT(*) FROM appointments
       WHERE doctor_name = $doctorName
       AND date = $date
       AND status != 'Cancelled'
       AND (
           (time <= $time AND time + duration_interval > $time) OR
           ($time <= time AND $time + $duration_interval > time)
       );

       -- If no conflicts, insert new appointment
       INSERT INTO appointments (
           id, name, date, time, duration,
           doctor_name, status, mode, reason,
           phone, email, notes, created_at
       ) VALUES (
           gen_random_uuid(), $name, $date, $time, $duration,
           $doctorName, $status, $mode, $reason,
           $phone, $email, $notes, NOW()
       ) RETURNING *;

       COMMIT;

    3. APPSYNC SUBSCRIPTION TRIGGER:
       After successful creation, AppSync broadcasts:

       subscription OnAppointmentCreated {
           onAppointmentCreated {
               id
               name
               date
               time
               doctorName
               status
           }
       }

    Args:
        payload (dict): Appointment data containing:
            - patientName (str): Required - Name of the patient
            - date (str): Required - Appointment date (YYYY-MM-DD)
            - time (str): Required - Appointment time (HH:MM)
            - duration (int): Required - Duration in minutes
            - doctorName (str): Required - Name of the doctor
            - mode (str): Required - Appointment mode (In-Person/Video Call/Phone Call)
            - status (str): Optional - Status (defaults to 'Scheduled')
            - reason (str): Optional - Reason for visit
            - phone (str): Optional - Patient phone
            - email (str): Optional - Patient email
            - notes (str): Optional - Additional notes

    Returns:
        dict: Created appointment object with generated ID
        None: If validation fails or time conflict exists

    Raises:
        ValueError: If required fields are missing or time conflict detected
    """
    global _next_id

    # =========================================================================
    # STEP 1: Validate required fields
    # =========================================================================
    required_fields = ['patientName', 'date', 'time', 'duration', 'doctorName', 'mode']
    missing_fields = [field for field in required_fields if field not in payload or not payload[field]]

    if missing_fields:
        raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")

    # =========================================================================
    # STEP 2: Check for time conflicts (overlap detection)
    # =========================================================================
    # Get the new appointment's time window
    new_date = payload['date']
    new_time = payload['time']
    new_duration = int(payload['duration'])
    new_doctor = payload['doctorName']

    # Convert time string to minutes for easier comparison
    def time_to_minutes(time_str):
        """Convert HH:MM to total minutes"""
        hours, minutes = map(int, time_str.split(':'))
        return hours * 60 + minutes

    new_start = time_to_minutes(new_time)
    new_end = new_start + new_duration

    # Check for conflicts with existing appointments for the same doctor on the same date
    for apt in appointments_data:
        if (apt['doctorName'] == new_doctor and
            apt['date'] == new_date and
            apt['status'] != 'Cancelled'):  # Don't check cancelled appointments

            existing_start = time_to_minutes(apt['time'])
            existing_end = existing_start + apt['duration']

            # Check for overlap: two time ranges overlap if one starts before the other ends
            # Overlap condition: (new_start < existing_end) AND (existing_start < new_end)
            if new_start < existing_end and existing_start < new_end:
                raise ValueError(
                    f"Time conflict detected: {new_doctor} already has an appointment "
                    f"on {new_date} from {apt['time']} for {apt['duration']} minutes "
                    f"(Patient: {apt['name']})"
                )

    # =========================================================================
    # STEP 3: Generate unique ID and create appointment
    # =========================================================================
    # In production, the ID would be generated by PostgreSQL (UUID or SERIAL)
    # Here we simulate with an auto-incrementing integer
    new_id = _next_id
    _next_id += 1

    # Create the new appointment object
    new_appointment = {
        "id": new_id,
        "name": payload['patientName'],  # Map patientName to name for consistency
        "date": payload['date'],
        "time": payload['time'],
        "duration": int(payload['duration']),
        "doctorName": payload['doctorName'],
        "status": payload.get('status', 'Scheduled'),  # Default to 'Scheduled' if not provided
        "mode": payload['mode'],
        "reason": payload.get('reason', ''),
        "phone": payload.get('phone', ''),
        "email": payload.get('email', ''),
        "notes": payload.get('notes', '')
    }

    # =========================================================================
    # STEP 4: Insert into mock database
    # =========================================================================
    # In production: Aurora transactional write
    appointments_data.append(new_appointment)

    # NOTE: In production, after this point:
    # 1. AppSync Subscription (onAppointmentCreated) would be triggered
    # 2. All subscribed clients receive the new appointment in real-time
    # 3. Frontend updates immediately without polling

    return new_appointment


# =============================================================================
# DELETE FUNCTION: delete_appointment(id)
# =============================================================================
def delete_appointment(appointment_id):
    """
    Deletes an appointment from the system.

    This function simulates a GraphQL mutation handled by AWS AppSync.

    GraphQL Mutation Structure:
    ---------------------------
    mutation DeleteAppointment($id: ID!) {
        deleteAppointment(id: $id)
    }

    In production, this mutation would:

    1. APPSYNC MUTATION RESOLVER (Lambda Function):
       - Validates the appointment exists
       - Performs soft delete or hard delete based on business rules

    2. AURORA POSTGRESQL TRANSACTIONAL WRITE:
       BEGIN TRANSACTION;

       -- Option A: Soft Delete (recommended for audit purposes)
       UPDATE appointments
       SET deleted_at = NOW(),
           deleted_by = $current_user_id
       WHERE id = $appointment_id
       AND deleted_at IS NULL;

       -- Option B: Hard Delete
       DELETE FROM appointments WHERE id = $appointment_id;

       -- Log the deletion for audit trail
       INSERT INTO appointment_audit_logs (
           appointment_id,
           action,
           performed_by,
           performed_at
       ) VALUES (
           $appointment_id,
           'DELETED',
           $current_user_id,
           NOW()
       );

       COMMIT;

    3. APPSYNC SUBSCRIPTION TRIGGER:
       After successful deletion, AppSync broadcasts:

       subscription OnAppointmentDeleted {
           onAppointmentDeleted {
               id
           }
       }

    Args:
        appointment_id (int): The ID of the appointment to delete

    Returns:
        bool: True if deletion was successful, False if appointment not found
    """
    global appointments_data

    # Find the appointment index
    for i, apt in enumerate(appointments_data):
        if apt["id"] == appointment_id:
            # Remove the appointment from the list
            # In production: This would be a transactional DELETE or soft-delete UPDATE
            appointments_data.pop(i)

            # NOTE: In production, after this point:
            # 1. AppSync Subscription (onAppointmentDeleted) would be triggered
            # 2. All subscribed clients receive notification to remove the appointment
            # 3. Frontend removes the item immediately without polling

            return True

    return False


# =============================================================================
# DATA CONSISTENCY EXPLANATION
# =============================================================================
"""
DATA CONSISTENCY IN A REAL SYSTEM
=================================

In a production Aurora PostgreSQL environment, data consistency would be
enforced through the following mechanisms:

1. TRANSACTIONS
   -------------
   All write operations (INSERT, UPDATE, DELETE) are wrapped in transactions
   to ensure atomicity. If any part of the operation fails, the entire
   transaction rolls back:

   BEGIN TRANSACTION;
       -- Multiple related operations
       INSERT INTO appointments ...;
       INSERT INTO appointment_audit_logs ...;
       UPDATE doctor_schedules ...;
   COMMIT;  -- All succeed or all fail

2. UNIQUE CONSTRAINTS
   ------------------
   Database-level constraints prevent duplicate data:

   -- Prevent double-booking: unique constraint on doctor + date + time
   ALTER TABLE appointments
   ADD CONSTRAINT unique_doctor_slot
   UNIQUE (doctor_id, date, time_slot);

   -- Unique appointment reference number
   ALTER TABLE appointments
   ADD CONSTRAINT unique_reference
   UNIQUE (reference_number);

3. IDEMPOTENCY KEY
   ---------------
   To prevent duplicate submissions (e.g., user clicking submit twice):

   -- Client generates a unique idempotency key for each request
   CREATE TABLE idempotency_keys (
       key VARCHAR(255) PRIMARY KEY,
       response JSONB,
       created_at TIMESTAMP DEFAULT NOW(),
       expires_at TIMESTAMP
   );

   -- Lambda resolver checks idempotency key before processing:
   -- 1. If key exists and not expired, return cached response
   -- 2. If key doesn't exist, process request and store result
   -- 3. Key expires after X minutes to allow retries for failed requests

   Example idempotency implementation in Lambda:
   
   def create_appointment_with_idempotency(idempotency_key, payload):
       # Check for existing key
       existing = db.query("SELECT response FROM idempotency_keys WHERE key = $1", idempotency_key)
       if existing:
           return existing.response

       # Process the request
       result = create_appointment(payload)

       # Store the result with the idempotency key
       db.execute(
           "INSERT INTO idempotency_keys (key, response, expires_at) VALUES ($1, $2, NOW() + INTERVAL '24 hours')",
           idempotency_key, json.dumps(result)
       )

       return result

4. FOREIGN KEY CONSTRAINTS
   -----------------------
   Maintain referential integrity between related tables:

   ALTER TABLE appointments
   ADD CONSTRAINT fk_doctor
   FOREIGN KEY (doctor_id) REFERENCES doctors(id);

   ALTER TABLE appointments
   ADD CONSTRAINT fk_patient
   FOREIGN KEY (patient_id) REFERENCES patients(id);

5. CHECK CONSTRAINTS
   -----------------
   Validate data integrity at the database level:

   ALTER TABLE appointments
   ADD CONSTRAINT valid_status
   CHECK (status IN ('Scheduled', 'Confirmed', 'Upcoming', 'Cancelled', 'Completed'));

   ALTER TABLE appointments
   ADD CONSTRAINT valid_duration
   CHECK (duration > 0 AND duration <= 480);  -- Max 8 hours

6. OPTIMISTIC LOCKING
   ------------------
   Prevent race conditions when multiple users update the same record:

   -- Add version column to appointments
   ALTER TABLE appointments ADD COLUMN version INT DEFAULT 1;

   -- Update only if version matches
   UPDATE appointments
   SET status = $new_status,
       version = version + 1
   WHERE id = $id AND version = $expected_version;

   -- If no rows affected, another user modified the record

7. ROW-LEVEL LOCKING
   -----------------
   For critical operations requiring exclusive access:

   SELECT * FROM appointments
   WHERE id = $id
   FOR UPDATE;  -- Locks the row until transaction completes

These mechanisms work together to ensure:
- Data integrity across concurrent operations
- Prevention of duplicate entries
- Audit trail for compliance
- Graceful handling of network issues and retries
"""


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
    print("=" * 70)
    print("EMR Appointment Service - Backend Simulation")
    print("=" * 70)

    # Use current date for testing
    TODAY = datetime.now().strftime("%Y-%m-%d")
    print(f"\nCurrent date: {TODAY}")

    print("\n1. All appointments:")
    all_apts = get_appointments()
    print(f"   Total count: {len(all_apts)}")
    for apt in all_apts[:3]:
        print(f"   - {apt['name']} on {apt['date']} at {apt['time']} ({apt['status']})")
    print("   ...")

    print("\n2. Today's appointments (2026-01-30):")
    today_apts = get_appointments(date="2026-01-30")
    print(f"   Count: {len(today_apts)}")
    for apt in today_apts:
        print(f"   - {apt['name']} at {apt['time']} with {apt['doctorName']}")

    print("\n3. Confirmed appointments:")
    confirmed_apts = get_appointments(status="Confirmed")
    print(f"   Count: {len(confirmed_apts)}")
    for apt in confirmed_apts[:3]:
        print(f"   - {apt['name']} on {apt['date']} ({apt['mode']})")

    print("\n4. Filter by doctor (Dr. Rajesh Kumar):")
    doctor_apts = get_appointments(doctorName="Dr. Rajesh Kumar")
    print(f"   Count: {len(doctor_apts)}")
    for apt in doctor_apts:
        print(f"   - {apt['name']} on {apt['date']} at {apt['time']}")

    print("\n5. Testing status update:")
    print("   Before: Appointment 1 status =", appointments_data[0]['status'])
    update_appointment_status(1, "Cancelled")
    print("   After:  Appointment 1 status =", appointments_data[0]['status'])
    # Restore original status
    update_appointment_status(1, "Confirmed")

    print("\n6. Testing create_appointment (valid):")
    try:
        new_apt = create_appointment({
            "patientName": "Test Patient",
            "date": "2026-02-05",
            "time": "10:00",
            "duration": 30,
            "doctorName": "Dr. Rajesh Kumar",
            "mode": "In-Person",
            "reason": "General Checkup",
            "phone": "+91 98765 99999",
            "email": "test@email.com"
        })
        print(f"   Created: ID={new_apt['id']}, {new_apt['name']} on {new_apt['date']} at {new_apt['time']}")
        print(f"   Status: {new_apt['status']} (default)")
    except ValueError as e:
        print(f"   Error: {e}")

    print("\n7. Testing create_appointment (time conflict):")
    try:
        conflicting_apt = create_appointment({
            "patientName": "Another Patient",
            "date": "2026-01-30",  # Same date as Sarah Johnson
            "time": "09:15",       # Overlaps with Sarah's 09:00-09:30 appointment
            "duration": 30,
            "doctorName": "Dr. Rajesh Kumar",  # Same doctor
            "mode": "In-Person",
            "reason": "Checkup"
        })
        print(f"   Created (unexpected): {conflicting_apt}")
    except ValueError as e:
        print(f"   Conflict detected (expected): {e}")

    print("\n8. Testing create_appointment (missing fields):")
    try:
        invalid_apt = create_appointment({
            "patientName": "Incomplete Patient"
            # Missing required fields
        })
        print(f"   Created (unexpected): {invalid_apt}")
    except ValueError as e:
        print(f"   Validation error (expected): {e}")

    print("\n9. Testing delete_appointment:")
    initial_count = len(appointments_data)
    print(f"   Before deletion: {initial_count} appointments")
    if new_apt:
        result = delete_appointment(new_apt['id'])  # Delete the test appointment we created
        print(f"   Delete result: {result}")
        print(f"   After deletion: {len(appointments_data)} appointments")
    else:
        print("   Skipped - no appointment was created")

    print("\n10. Testing delete non-existent appointment:")
    result = delete_appointment(9999)
    print(f"   Delete result: {result} (expected: False)")

    print("\n" + "=" * 70)
    print("Backend service ready for frontend integration!")
    print("=" * 70)
    print("\nAPI Contract:")
    print("  get_appointments(filters: { date?, status?, doctorName? }) -> Appointment[]")
    print("  create_appointment(input: CreateAppointmentInput) -> Appointment")
    print("  update_appointment_status(id, new_status) -> Appointment")
    print("  delete_appointment(id) -> boolean")
    print("=" * 70)
