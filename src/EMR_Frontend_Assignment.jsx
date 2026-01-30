import React, { useState, useEffect } from 'react';

/**
 * EMR_Frontend_Assignment.jsx
 *
 * This file implements the Appointment Management View for the EMR system.
 * It integrates with the Python backend service (appointment_service.py) by
 * simulating the API calls that would normally go through AWS AppSync/GraphQL.
 *
 * In production, these functions would be replaced with actual GraphQL queries:
 * - getAppointments() -> Apollo Client query
 * - updateAppointmentStatus() -> Apollo Client mutation
 * - createAppointment() -> Apollo Client mutation
 * - deleteAppointment() -> Apollo Client mutation
 *
 * API Contract (mirrors appointment_service.py):
 * - get_appointments(filters: { date?, status?, doctorName? }) -> Appointment[]
 * - create_appointment(input: CreateAppointmentInput) -> Appointment
 * - update_appointment_status(id, new_status) -> Appointment
 * - delete_appointment(id) -> boolean
 */

// =============================================================================
// SIMULATED BACKEND DATA (Mirrors appointment_service.py)
// =============================================================================
// This mock data represents what would be returned from the Python backend
// via GraphQL API. In a real implementation, this would be fetched from:
// appointment_service.get_appointments()

// Auto-increment counter for generating unique IDs (simulates backend)
let _nextId = 13;

let mockAppointments = [
  {
    id: 1,
    name: "Sarah Johnson",
    date: "2026-01-30",
    time: "09:00",
    duration: 30,
    doctorName: "Dr. Rajesh Kumar",
    status: "Confirmed",
    mode: "In-Person",
    reason: "Diabetes Management",
    phone: "+91 98765 43210",
    email: "sarah.j@email.com",
    notes: "Patient needs prescription refill"
  },
  {
    id: 2,
    name: "Michael Chen",
    date: "2026-01-30",
    time: "10:00",
    duration: 45,
    doctorName: "Dr. Priya Sharma",
    status: "Scheduled",
    mode: "In-Person",
    reason: "Annual Physical Examination",
    phone: "+91 98765 43211",
    email: "m.chen@email.com",
    notes: ""
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    date: "2026-01-30",
    time: "11:30",
    duration: 30,
    doctorName: "Dr. Rajesh Kumar",
    status: "Confirmed",
    mode: "Video Call",
    reason: "Cold and Flu Symptoms",
    phone: "+91 98765 43212",
    email: "emily.r@email.com",
    notes: "Video consultation requested"
  },
  {
    id: 4,
    name: "Rahul Sharma",
    date: "2026-01-31",
    time: "09:00",
    duration: 30,
    doctorName: "Dr. Priya Sharma",
    status: "Upcoming",
    mode: "In-Person",
    reason: "General Checkup",
    phone: "+91 98765 43213",
    email: "rahul.s@email.com",
    notes: ""
  },
  {
    id: 5,
    name: "Anita Desai",
    date: "2026-01-31",
    time: "14:00",
    duration: 45,
    doctorName: "Dr. Amit Patel",
    status: "Upcoming",
    mode: "Video Call",
    reason: "Follow-up Consultation",
    phone: "+91 98765 43214",
    email: "anita.d@email.com",
    notes: ""
  },
  {
    id: 6,
    name: "Vikram Singh",
    date: "2026-01-29",
    time: "10:00",
    duration: 30,
    doctorName: "Dr. Rajesh Kumar",
    status: "Confirmed",
    mode: "In-Person",
    reason: "Blood Pressure Check",
    phone: "+91 98765 43215",
    email: "vikram.s@email.com",
    notes: "Regular checkup"
  },
  {
    id: 7,
    name: "Priya Nair",
    date: "2026-01-29",
    time: "15:30",
    duration: 45,
    doctorName: "Dr. Amit Patel",
    status: "Cancelled",
    mode: "In-Person",
    reason: "Skin Consultation",
    phone: "+91 98765 43216",
    email: "priya.n@email.com",
    notes: "Patient cancelled"
  },
  {
    id: 8,
    name: "Deepak Malhotra",
    date: "2026-02-01",
    time: "09:30",
    duration: 30,
    doctorName: "Dr. Priya Sharma",
    status: "Scheduled",
    mode: "In-Person",
    reason: "Vaccination",
    phone: "+91 98765 43217",
    email: "deepak.m@email.com",
    notes: ""
  },
  {
    id: 9,
    name: "Sunita Verma",
    date: "2026-02-01",
    time: "11:00",
    duration: 60,
    doctorName: "Dr. Rajesh Kumar",
    status: "Upcoming",
    mode: "In-Person",
    reason: "Complete Health Checkup",
    phone: "+91 98765 43218",
    email: "sunita.v@email.com",
    notes: ""
  },
  {
    id: 10,
    name: "Kiran Joshi",
    date: "2026-01-30",
    time: "16:00",
    duration: 30,
    doctorName: "Dr. Amit Patel",
    status: "Confirmed",
    mode: "Phone Call",
    reason: "Test Results Discussion",
    phone: "+91 98765 43219",
    email: "kiran.j@email.com",
    notes: ""
  },
  {
    id: 11,
    name: "Neha Kapoor",
    date: "2026-01-28",
    time: "10:30",
    duration: 30,
    doctorName: "Dr. Amit Patel",
    status: "Confirmed",
    mode: "Phone Call",
    reason: "Medication Review",
    phone: "+91 98765 43220",
    email: "neha.k@email.com",
    notes: "Past appointment - completed"
  },
  {
    id: 12,
    name: "Amit Tiwari",
    date: "2026-02-02",
    time: "14:30",
    duration: 45,
    doctorName: "Dr. Priya Sharma",
    status: "Scheduled",
    mode: "Video Call",
    reason: "Mental Health Consultation",
    phone: "+91 98765 43221",
    email: "amit.t@email.com",
    notes: "First time patient"
  }
];

// =============================================================================
// SIMULATED BACKEND FUNCTIONS (Mirrors appointment_service.py)
// =============================================================================

/**
 * Simulates: appointment_service.get_appointments(date, status, doctorName)
 *
 * In production, this would be a GraphQL query:
 * query GetAppointments($date: String, $status: String, $doctorName: String) {
 *   getAppointments(date: $date, status: $status, doctorName: $doctorName) {
 *     id, name, date, time, duration, doctorName, status, mode, reason, phone, email, notes
 *   }
 * }
 */
const getAppointments = (date = null, status = null, doctorName = null) => {
  // Simulate fetching from Python backend
  let result = [...mockAppointments];

  if (date) {
    result = result.filter(apt => apt.date === date);
  }
  if (status) {
    result = result.filter(apt => apt.status === status);
  }
  if (doctorName) {
    result = result.filter(apt => apt.doctorName === doctorName);
  }

  return result;
};

/**
 * Simulates: appointment_service.update_appointment_status(id, new_status)
 *
 * In production, this would be a GraphQL mutation:
 * mutation UpdateAppointmentStatus($id: ID!, $status: String!) {
 *   updateAppointmentStatus(id: $id, status: $status) {
 *     id, status
 *   }
 * }
 *
 * After mutation, AppSync Subscription would push real-time updates to all clients.
 */
const updateAppointmentStatus = (id, newStatus) => {
  const apt = mockAppointments.find(a => a.id === id);
  if (apt) {
    apt.status = newStatus;
    // In production: AppSync Subscription triggers here
    // All connected clients would receive the update in real-time
    return { ...apt };
  }
  return null;
};

/**
 * Helper function to convert time string to minutes for comparison
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Simulates: appointment_service.create_appointment(payload)
 *
 * Creates a new appointment with validation and time conflict detection.
 *
 * In production, this would be a GraphQL mutation:
 * mutation CreateAppointment($input: CreateAppointmentInput!) {
 *   createAppointment(input: $input) {
 *     id, name, date, time, duration, doctorName, status, mode, reason, phone, email, notes
 *   }
 * }
 *
 * Required fields: patientName, date, time, duration, doctorName, mode
 * Default status: 'Scheduled' (unless explicitly provided)
 * Includes time conflict detection for the same doctor on the same date
 *
 * @param {Object} payload - The appointment data
 * @returns {Object} The created appointment with generated ID
 * @throws {Error} If required fields are missing or time conflict is detected
 */
const createAppointment = (payload) => {
  // STEP 1: Validate required fields
  const requiredFields = ['patientName', 'date', 'time', 'duration', 'doctorName', 'mode'];
  const missingFields = requiredFields.filter(field => !payload[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // STEP 2: Check for time conflicts (overlap detection)
  const newDate = payload.date;
  const newTime = payload.time;
  const newDuration = parseInt(payload.duration);
  const newDoctor = payload.doctorName;

  const newStart = timeToMinutes(newTime);
  const newEnd = newStart + newDuration;

  // Check for conflicts with existing appointments for the same doctor on the same date
  for (const apt of mockAppointments) {
    if (apt.doctorName === newDoctor &&
        apt.date === newDate &&
        apt.status !== 'Cancelled') {

      const existingStart = timeToMinutes(apt.time);
      const existingEnd = existingStart + apt.duration;

      // Check for overlap: two time ranges overlap if one starts before the other ends
      // Overlap condition: (new_start < existing_end) AND (existing_start < new_end)
      if (newStart < existingEnd && existingStart < newEnd) {
        throw new Error(
          `Time conflict detected: ${newDoctor} already has an appointment ` +
          `on ${newDate} from ${apt.time} for ${apt.duration} minutes ` +
          `(Patient: ${apt.name})`
        );
      }
    }
  }

  // STEP 3: Generate unique ID and create appointment
  // In production, the ID would be generated by PostgreSQL (UUID or SERIAL)
  const newId = _nextId++;

  // Create the new appointment object
  const newAppointment = {
    id: newId,
    name: payload.patientName, // Map patientName to name for consistency with data model
    date: payload.date,
    time: payload.time,
    duration: parseInt(payload.duration),
    doctorName: payload.doctorName,
    status: payload.status || 'Scheduled', // Default to 'Scheduled' if not provided
    mode: payload.mode,
    reason: payload.reason || '',
    phone: payload.phone || '',
    email: payload.email || '',
    notes: payload.notes || ''
  };

  // STEP 4: Insert into mock database
  // In production: Aurora transactional write
  mockAppointments.push(newAppointment);

  // NOTE: In production, after this point:
  // 1. AppSync Subscription (onAppointmentCreated) would be triggered
  // 2. All subscribed clients receive the new appointment in real-time

  return newAppointment;
};

/**
 * Simulates: appointment_service.delete_appointment(id)
 *
 * Deletes an appointment from the system.
 *
 * In production, this would be a GraphQL mutation:
 * mutation DeleteAppointment($id: ID!) {
 *   deleteAppointment(id: $id)
 * }
 *
 * @param {number} id - The ID of the appointment to delete
 * @returns {boolean} True if deletion was successful, false otherwise
 */
const deleteAppointment = (id) => {
  const index = mockAppointments.findIndex(a => a.id === id);
  if (index !== -1) {
    mockAppointments.splice(index, 1);
    // NOTE: In production, after this point:
    // 1. AppSync Subscription (onAppointmentDeleted) would be triggered
    // 2. All subscribed clients remove the appointment from their view
    return true;
  }
  return false;
};

// New Appointment Modal Component
const NewAppointmentModal = ({ isOpen, onClose, onSave, doctors, error, onClearError }) => {
  const todayDate = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    patientName: '', // Changed from 'name' to match backend contract
    date: todayDate,
    time: '09:00',
    duration: 30,
    doctorName: doctors[0] || 'Dr. Rajesh Kumar',
    status: 'Scheduled',
    mode: 'In-Person',
    reason: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Update doctorName when doctors list changes
  useEffect(() => {
    if (doctors.length > 0 && !doctors.includes(formData.doctorName)) {
      setFormData(prev => ({ ...prev, doctorName: doctors[0] }));
    }
  }, [doctors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear backend error when user makes changes
    if (error && onClearError) {
      onClearError();
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required fields as per backend contract
    if (!formData.patientName.trim()) {
      errors.patientName = 'Patient name is required';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    if (!formData.time) {
      errors.time = 'Time is required';
    }
    if (!formData.duration) {
      errors.duration = 'Duration is required';
    }
    if (!formData.doctorName) {
      errors.doctorName = 'Doctor is required';
    }
    if (!formData.mode) {
      errors.mode = 'Mode is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Call the backend function via the parent handler
    // The parent will handle the actual createAppointment call and error handling
    onSave(formData);
  };

  const handleClose = () => {
    // Reset form on close
    setFormData({
      patientName: '',
      date: todayDate,
      time: '09:00',
      duration: 30,
      doctorName: doctors[0] || 'Dr. Rajesh Kumar',
      status: 'Scheduled',
      mode: 'In-Person',
      reason: '',
      phone: '',
      email: '',
      notes: ''
    });
    setValidationErrors({});
    if (onClearError) {
      onClearError();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">New Appointment</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        {/* Display backend error (e.g., time conflict) */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.patientName ? 'border-red-500' : ''}`}
              placeholder="Enter patient name"
            />
            {validationErrors.patientName && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.patientName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.date ? 'border-red-500' : ''}`}
              />
              {validationErrors.date && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.time ? 'border-red-500' : ''}`}
              />
              {validationErrors.time && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.time}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins) *</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.duration ? 'border-red-500' : ''}`}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
              <select
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.doctorName ? 'border-red-500' : ''}`}
              >
                {doctors.map(doc => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode *</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.mode ? 'border-red-500' : ''}`}
              >
                <option value="In-Person">In-Person</option>
                <option value="Video Call">Video Call</option>
                <option value="Phone Call">Phone Call</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., General Checkup, Follow-up"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="patient@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Additional notes (optional)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sidebar component
const Sidebar = () => {
  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 h-screen fixed left-0 top-0">
      <div className="space-y-4">
        <button className="p-3 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button className="p-3 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </button>
        <button className="p-3 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button className="p-3 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
        <button className="p-3 bg-blue-50 rounded-lg">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <button className="p-3 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </button>
        <button className="p-3 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <button className="p-3 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
      
      <div className="mt-auto space-y-4">
        <button className="p-3 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button className="p-3 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </button>
        <button className="p-3 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Stats Card component
const StatsCard = ({ icon, count, label, badgeText, badgeColor }) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${icon.bg}`}>
          {icon.svg}
        </div>
        {badgeText && (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-800">{count}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
};

// Calendar component
const Calendar = ({ selectedDate, onDateSelect, currentMonth, onMonthChange, appointments }) => {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Use current system date for "today" highlight
  const TODAY = new Date().toISOString().split('T')[0];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = [];
  // previous month days
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  // current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }
  // next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }
  
  const formatDateString = (day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };
  
  // Check if a date has appointments
  const hasAppointments = (dateStr) => {
    return appointments && appointments.some(apt => apt.date === dateStr);
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="text-lg font-semibold mb-4 text-gray-800">Calendar</div>
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => onMonthChange(-1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-medium text-gray-700">{monthNames[month]} {year}</span>
        <button 
          onClick={() => onMonthChange(1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="py-2 text-gray-500 font-medium">{d}</div>
        ))}
        {days.map((d, i) => {
          const dateStr = d.isCurrentMonth ? formatDateString(d.day) : '';
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === TODAY;
          const dateHasAppointments = d.isCurrentMonth && hasAppointments(dateStr);

          return (
            <button
              key={i}
              onClick={() => d.isCurrentMonth && onDateSelect(dateStr)}
              className={`py-2 rounded-lg text-sm relative
                ${!d.isCurrentMonth ? 'text-gray-300 cursor-default' : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}
                ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                ${isToday && !isSelected ? 'bg-blue-100 text-blue-600 font-bold' : ''}
              `}
            >
              {d.day}
              {dateHasAppointments && !isSelected && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
          Showing appointments for: <strong>{selectedDate}</strong>
          <button
            onClick={() => onDateSelect(selectedDate)}
            className="ml-2 text-blue-500 hover:text-blue-700 underline"
          >
            Clear
          </button>
        </div>
      )}

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-gray-600">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="text-gray-600">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <span className="text-gray-600">Upcoming</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-gray-600">Cancelled</span>
        </div>
      </div>
    </div>
  );
};

// Appointment Card
const AppointmentCard = ({ appointment, onStatusUpdate, onDelete }) => {
  const statusColors = {
    'Confirmed': 'bg-green-100 text-green-700',
    'Scheduled': 'bg-blue-100 text-blue-700',
    'Upcoming': 'bg-orange-100 text-orange-700',
    'Cancelled': 'bg-red-100 text-red-700'
  };
  
  const avatarColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
  const avatarColor = avatarColors[appointment.id % avatarColors.length];

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the appointment for ${appointment.name}?`)) {
      onDelete(appointment.id);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold`}>
            {appointment.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{appointment.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>📅 {appointment.date}</span>
              <span>⏰ {appointment.time}</span>
              <span>• {appointment.duration} min</span>
            </div>
            <div className="text-sm text-gray-500">
              👨‍⚕️ {appointment.doctorName} • 📍 {appointment.mode}
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[appointment.status]}`}>
          {appointment.status}
        </span>
      </div>
      
      <div className="mt-3 pl-13">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-blue-600">🏥 {appointment.mode === 'Video Call' ? 'Telemedicine' : appointment.mode === 'Phone Call' ? 'Phone Consultation' : 'Follow-up'}</span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          <span className="font-medium">Reason:</span> {appointment.reason}
        </div>
        {appointment.notes && (
          <div className="text-sm text-gray-500 mt-1">
            <span className="font-medium">Note:</span> {appointment.notes}
          </div>
        )}
      </div>
      
      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>📞 {appointment.phone}</span>
          <span>✉️ {appointment.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onStatusUpdate(appointment.id, 'Confirmed')}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
            title="Confirm"
            disabled={appointment.status === 'Confirmed'}
          >
            ✓
          </button>
          <button 
            onClick={() => onStatusUpdate(appointment.id, 'Cancelled')}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Cancel"
            disabled={appointment.status === 'Cancelled'}
          >
            ✕
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Delete Appointment"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const AppointmentManagementView = () => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [doctorFilter, setDoctorFilter] = useState('All Doctors');
  // Initialize calendar to current month
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Modal state for new appointment
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  // Error state for create appointment (e.g., time conflict)
  const [createError, setCreateError] = useState('');

  // Today's date - using current system date (format: YYYY-MM-DD)
  const TODAY = new Date().toISOString().split('T')[0];

  // =============================================================================
  // TASK 2.1: DATA FETCHING - Initialize with data from backend
  // =============================================================================
  // Using useEffect to simulate fetching data from Python get_appointments()
  // In production: This would be an Apollo Client useQuery hook
  useEffect(() => {
    // Simulating API call to Python backend: get_appointments()
    const fetchedData = getAppointments();
    setAppointments(fetchedData);
    setFilteredAppointments(fetchedData);
  }, []);
  
  // =============================================================================
  // TASK 2.2 & 2.3: CALENDAR AND TAB FILTERING
  // =============================================================================
  // Filter appointments when any filter criteria changes
  useEffect(() => {
    // Start with all appointments from backend
    let result = getAppointments();

    // TASK 2.2: Calendar Date Filtering (takes priority)
    // When a date is selected in calendar, filter by that date
    if (selectedDate) {
      // Call backend get_appointments with date filter
      // Simulating: getAppointments(selectedDate)
      result = getAppointments(selectedDate);
    } else {
      // TASK 2.3: Tab Filtering - Only apply when no specific date is selected
      // Filter based on date relative to today
      if (activeTab === 'Today') {
        // Show only appointments for today
        result = result.filter(apt => apt.date === TODAY);
      } else if (activeTab === 'Upcoming') {
        // Show appointments in the future (after today)
        result = result.filter(apt => apt.date > TODAY);
      } else if (activeTab === 'Past') {
        // Show past appointments (before today)
        result = result.filter(apt => apt.date < TODAY);
      }
      // 'All' tab shows everything
    }
    
    // Additional filters: Search by name, doctor, or reason
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(apt =>
        apt.name.toLowerCase().includes(searchLower) ||
        apt.doctorName.toLowerCase().includes(searchLower) ||
        apt.reason.toLowerCase().includes(searchLower)
      );
    }
    
    // Status dropdown filter
    if (statusFilter !== 'All Status') {
      result = result.filter(apt => apt.status === statusFilter);
    }
    
    // Doctor dropdown filter
    if (doctorFilter !== 'All Doctors') {
      result = result.filter(apt => apt.doctorName === doctorFilter);
    }
    
    setFilteredAppointments(result);
  }, [appointments, selectedDate, activeTab, searchTerm, statusFilter, doctorFilter]);
  
  // =============================================================================
  // TASK 2.2: Calendar Date Selection Handler
  // =============================================================================
  const handleDateSelect = (date) => {
    if (selectedDate === date) {
      // Toggle off - clear date filter to show all appointments
      setSelectedDate('');
    } else {
      // Set selected date and filter appointments
      // Also reset tab to 'All' when selecting a specific date
      setSelectedDate(date);
      setActiveTab('All');
    }
  };

  // Tab selection handler - clear calendar selection when changing tabs
  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    setSelectedDate(''); // Clear calendar selection when switching tabs
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedDate('');
    setActiveTab('All');
    setSearchTerm('');
    setStatusFilter('All Status');
    setDoctorFilter('All Doctors');
  };
  
  // Month navigation handler
  const handleMonthChange = (delta) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setCurrentMonth(newMonth);
  };
  
  // =============================================================================
  // TASK 2.4: STATUS UPDATE - Call backend and refresh UI
  // =============================================================================
  const handleStatusUpdate = (id, newStatus) => {
    // Call the backend mutation function
    // Simulating: update_appointment_status(id, newStatus)
    const updatedApt = updateAppointmentStatus(id, newStatus);

    if (updatedApt) {
      // Immediately refresh local state to reflect the change
      // This simulates real-time UI updates (like AppSync subscriptions would do)
      const refreshedData = getAppointments();
      setAppointments([...refreshedData]); // Force re-render with new array
      // Note: The useEffect will automatically re-filter based on current criteria
    }
  };

  // =============================================================================
  // TASK 2.5: CREATE APPOINTMENT - Call backend with validation
  // =============================================================================
  /**
   * Handles adding a new appointment through the backend API.
   * - Calls createAppointment() which validates required fields
   * - Checks for time conflicts (same doctor, same date/time)
   * - Refreshes local state on success
   * - Displays error message on failure (e.g., time conflict)
   *
   * IMPORTANT: State is NOT mutated directly - only through backend call
   */
  const handleAddAppointment = (appointmentData) => {
    try {
      // Clear any previous error
      setCreateError('');

      // Call the backend createAppointment function
      // Simulating: create_appointment(appointmentData)
      // This will:
      // 1. Validate required fields (patientName, date, time, duration, doctorName, mode)
      // 2. Check for time conflicts for the same doctor
      // 3. Generate a unique ID on the backend
      // 4. Set default status to 'Scheduled' if not provided
      const newAppointment = createAppointment(appointmentData);

      if (newAppointment) {
        // Immediately refresh local state to include the new appointment
        const refreshedData = getAppointments();
        setAppointments([...refreshedData]);
        // Close the modal on success
        setIsNewAppointmentOpen(false);
        // Note: The useEffect will automatically re-filter based on current criteria
      }
    } catch (error) {
      // Handle validation errors or time conflicts from the backend
      // Display the error in the modal (e.g., "Time conflict detected...")
      setCreateError(error.message);
    }
  };

  // =============================================================================
  // TASK 1.5 (BONUS): DELETE APPOINTMENT - Call backend and refresh UI
  // =============================================================================
  /**
   * Handles deleting an appointment through the backend API.
   * - Calls deleteAppointment() which removes from mock database
   * - Refreshes local state on success
   *
   * IMPORTANT: State is NOT mutated directly - only through backend call
   */
  const handleDeleteAppointment = (id) => {
    // Call the backend deleteAppointment function
    // Simulating: delete_appointment(id)
    const success = deleteAppointment(id);

    if (success) {
      // Immediately refresh local state to remove the deleted appointment
      // This simulates real-time UI updates (like AppSync subscriptions would do)
      const refreshedData = getAppointments();
      setAppointments([...refreshedData]);
      // Note: The useEffect will automatically re-filter based on current criteria
    }
  };

  // =============================================================================
  // COMPUTED VALUES FOR STATS CARDS
  // =============================================================================
  const todayCount = appointments.filter(a => a.date === TODAY).length;
  const confirmedCount = appointments.filter(a => a.status === 'Confirmed').length;
  const upcomingCount = appointments.filter(a => a.date > TODAY).length;
  const virtualCount = appointments.filter(a => a.mode === 'Video Call').length;
  
  // Get unique doctors for filter dropdown
  const doctors = [...new Set(appointments.map(a => a.doctorName))];
  
  // Check if any filter is active
  const hasActiveFilters = selectedDate || activeTab !== 'All' || searchTerm ||
                           statusFilter !== 'All Status' || doctorFilter !== 'All Doctors';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-16 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Appointment Management</h1>
            <p className="text-gray-500">Schedule and manage patient appointments</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <span>📤</span> Export
            </button>
            <button
              onClick={() => setIsNewAppointmentOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
            >
              <span>+</span> New Appointment
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatsCard 
            icon={{
              bg: 'bg-blue-100',
              svg: <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }}
            count={todayCount}
            label="Today's Appointments"
            badgeText="Today"
            badgeColor="bg-blue-100 text-blue-600"
          />
          <StatsCard 
            icon={{
              bg: 'bg-green-100',
              svg: <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }}
            count={confirmedCount}
            label="Confirmed Appointments"
            badgeText="Confirmed"
            badgeColor="bg-green-100 text-green-600"
          />
          <StatsCard 
            icon={{
              bg: 'bg-blue-100',
              svg: <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }}
            count={upcomingCount}
            label="Upcoming Appointments"
            badgeText="Upcoming"
            badgeColor="bg-orange-100 text-orange-600"
          />
          <StatsCard 
            icon={{
              bg: 'bg-pink-100',
              svg: <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }}
            count={virtualCount}
            label="Telemedicine Sessions"
            badgeText="Virtual"
            badgeColor="bg-pink-100 text-pink-600"
          />
        </div>
        
        {/* Main Content */}
        <div className="flex gap-6">
          {/* Left - Calendar */}
          <div className="w-72">
            <Calendar 
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
              appointments={appointments}
            />
          </div>
          
          {/* Right - Appointments List */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="flex items-center justify-between mb-4 border-b">
              <div className="flex items-center gap-6">
                {['All', 'Today', 'Upcoming', 'Past'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleTabSelect(tab)}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors
                      ${activeTab === tab 
                        ? 'text-blue-600 border-blue-600' 
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                      }
                    `}
                  >
                    {tab}
                    {tab === 'Today' && <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{todayCount}</span>}
                    {tab === 'Upcoming' && <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">{upcomingCount}</span>}
                  </button>
                ))}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 pb-3"
                >
                  Clear all filters
                </button>
              )}
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name, doctor, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusFilter !== 'All Status' ? 'border-blue-500 bg-blue-50' : ''}`}
              >
                <option>All Status</option>
                <option>Confirmed</option>
                <option>Scheduled</option>
                <option>Upcoming</option>
                <option>Cancelled</option>
              </select>
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${doctorFilter !== 'All Doctors' ? 'border-blue-500 bg-blue-50' : ''}`}
              >
                <option>All Doctors</option>
                {doctors.map(doc => (
                  <option key={doc}>{doc}</option>
                ))}
              </select>
            </div>
            
            {/* Results count */}
            <div className="text-sm text-gray-500 mb-4">
              Showing {filteredAppointments.length} of {appointments.length} appointments
              {selectedDate && <span className="ml-1">for {selectedDate}</span>}
            </div>

            {/* Appointments */}
            <div className="space-y-4">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(apt => (
                  <AppointmentCard 
                    key={apt.id} 
                    appointment={apt} 
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDeleteAppointment}
                  />
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                  <div className="text-gray-400 text-4xl mb-3">📅</div>
                  <div className="text-gray-500 mb-2">No appointments found</div>
                  <div className="text-sm text-gray-400">
                    {selectedDate
                      ? `No appointments scheduled for ${selectedDate}`
                      : 'Try adjusting your filters'}
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="mt-3 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Appointment Modal */}
        <NewAppointmentModal
          isOpen={isNewAppointmentOpen}
          onClose={() => {
            setIsNewAppointmentOpen(false);
            setCreateError('');
          }}
          onSave={handleAddAppointment}
          doctors={doctors}
          error={createError}
          onClearError={() => setCreateError('')}
        />
      </div>
    </div>
  );
};

export default AppointmentManagementView;
