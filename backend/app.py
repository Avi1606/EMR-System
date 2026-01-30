"""
Flask Backend API Server for EMR Appointment System
====================================================
REST API endpoints for appointment management.

Run: python backend/app.py
Server: http://localhost:5000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add parent directory to import appointment_service
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from appointment_service import (
    get_appointments,
    create_appointment,
    update_appointment_status,
    delete_appointment,
    appointments_data
)

app = Flask(__name__)
CORS(app)


@app.route('/api/appointments', methods=['GET'])
def api_get_appointments():
    """GET /api/appointments - Get all appointments with optional filters"""
    date = request.args.get('date')
    status = request.args.get('status')
    doctor_name = request.args.get('doctorName')

    appointments = get_appointments(date=date, status=status, doctorName=doctor_name)

    return jsonify({'success': True, 'data': appointments, 'count': len(appointments)})


@app.route('/api/appointments', methods=['POST'])
def api_create_appointment():
    """POST /api/appointments - Create new appointment"""
    try:
        payload = request.get_json()
        if not payload:
            return jsonify({'success': False, 'error': 'Request body required'}), 400

        new_appointment = create_appointment(payload)
        return jsonify({'success': True, 'data': new_appointment}), 201

    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
def api_update_appointment(appointment_id):
    """PUT /api/appointments/<id> - Update appointment status"""
    try:
        payload = request.get_json()
        if not payload or 'status' not in payload:
            return jsonify({'success': False, 'error': 'Status required'}), 400

        updated = update_appointment_status(appointment_id, payload['status'])
        if updated:
            return jsonify({'success': True, 'data': updated})
        return jsonify({'success': False, 'error': 'Not found'}), 404

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
def api_delete_appointment(appointment_id):
    """DELETE /api/appointments/<id> - Delete appointment"""
    try:
        success = delete_appointment(appointment_id)
        if success:
            return jsonify({'success': True, 'message': 'Deleted'})
        return jsonify({'success': False, 'error': 'Not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/doctors', methods=['GET'])
def api_get_doctors():
    """GET /api/doctors - Get unique list of doctors"""
    doctors = list(set(apt['doctorName'] for apt in appointments_data))
    return jsonify({'success': True, 'data': sorted(doctors)})


@app.route('/api/stats', methods=['GET'])
def api_get_stats():
    """GET /api/stats - Get dashboard statistics"""
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")

    all_apts = appointments_data
    today_apts = [a for a in all_apts if a['date'] == today]

    stats = {
        'totalPatients': len(set(a['name'] for a in all_apts)),
        'appointmentsToday': len(today_apts),
        'confirmedToday': len([a for a in today_apts if a['status'] == 'Confirmed']),
        'upcomingCount': len([a for a in all_apts if a['date'] > today]),
        'videoCallsToday': len([a for a in today_apts if a['mode'] == 'Video Call']),
        'totalDoctors': len(set(a['doctorName'] for a in all_apts))
    }
    return jsonify({'success': True, 'data': stats})


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'EMR API'})


if __name__ == '__main__':
    print("\n" + "="*60)
    print("EMR Appointment System - Backend API")
    print("="*60)
    print("\nEndpoints:")
    print("  GET    /api/appointments")
    print("  POST   /api/appointments")
    print("  PUT    /api/appointments/<id>")
    print("  DELETE /api/appointments/<id>")
    print("  GET    /api/doctors")
    print("  GET    /api/stats")
    print("\nStarting on http://localhost:5000")
    print("="*60 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5000)

