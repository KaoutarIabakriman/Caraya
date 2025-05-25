from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
from datetime import datetime, timedelta
import json
from app.models.reservation import Reservation
from app.models.car import Car
from app.models.client import Client
from app.utils.auth_utils import token_required, manager_required

reservation_bp = Blueprint('reservation', __name__)

@reservation_bp.route('', methods=['POST'])
@manager_required
def create_reservation(user_id):
    data = request.json
    
    # Validate required fields
    required_fields = ['client_id', 'car_id', 'start_date', 'end_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Convert string dates to datetime objects
    try:
        start_date = datetime.fromisoformat(data['start_date'])
        end_date = datetime.fromisoformat(data['end_date'])
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    # Check if end_date is after start_date
    if end_date <= start_date:
        return jsonify({'message': 'End date must be after start date'}), 400
    
    # Calculate total days
    total_days = (end_date - start_date).days
    if total_days < 1:
        total_days = 1  # Minimum 1 day rental
    
    # Check if client exists
    client = current_app.db.clients.find_one({'_id': data['client_id']})
    if not client:
        return jsonify({'message': 'Client not found'}), 404
    
    # Check if car exists and is available
    car = current_app.db.cars.find_one({'_id': data['car_id']})
    if not car:
        return jsonify({'message': 'Car not found'}), 404
    
    car_obj = Car.from_dict(car)
    if car_obj.availability_status != 'available':
        return jsonify({'message': 'Car is not available for rental'}), 400
    
    # Check if car is already reserved for the requested dates
    existing_reservations = current_app.db.reservations.find({
        'car_id': data['car_id'],
        'status': {'$in': ['pending', 'confirmed', 'active']},
        '$or': [
            {'start_date': {'$lt': end_date}, 'end_date': {'$gt': start_date}},
            {'start_date': {'$lte': start_date}, 'end_date': {'$gte': start_date}},
            {'start_date': {'$lte': end_date}, 'end_date': {'$gte': end_date}}
        ]
    })
    
    if current_app.db.reservations.count_documents({'_id': {'$in': [r['_id'] for r in existing_reservations]}}) > 0:
        return jsonify({'message': 'Car is already reserved for the selected dates'}), 400
    
    # Calculate pricing
    daily_rate = car_obj.price_per_day
    total_amount = daily_rate * total_days
    
    # Create reservation
    reservation_data = {
        'client_id': data['client_id'],
        'car_id': data['car_id'],
        'start_date': start_date,
        'end_date': end_date,
        'total_days': total_days,
        'daily_rate': daily_rate,
        'total_amount': total_amount,
        'status': data.get('status', 'pending'),
        'pickup_location': data.get('pickup_location'),
        'return_location': data.get('return_location'),
        'deposit_amount': data.get('deposit_amount', 0),
        'payment_status': data.get('payment_status', 'unpaid'),
        'notes': data.get('notes')
    }
    
    reservation = Reservation.from_dict(reservation_data)
    current_app.db.reservations.insert_one(reservation.to_dict())
    
    # If status is 'active', update car status to 'rented'
    if reservation.status == 'active':
        current_app.db.cars.update_one(
            {'_id': data['car_id']},
            {'$set': {'availability_status': 'rented', 'current_renter_id': data['client_id']}}
        )
    
    return jsonify({'message': 'Reservation created successfully', 'reservation': reservation.to_json()}), 201

@reservation_bp.route('', methods=['GET'])
@manager_required
def get_reservations(user_id):
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    status = request.args.get('status')
    client_id = request.args.get('client_id')
    car_id = request.args.get('car_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Build query
    query = {}
    if status:
        query['status'] = status
    if client_id:
        query['client_id'] = client_id
    if car_id:
        query['car_id'] = car_id
    if start_date:
        try:
            query['start_date'] = {'$gte': datetime.fromisoformat(start_date)}
        except ValueError:
            return jsonify({'message': 'Invalid start_date format'}), 400
    if end_date:
        try:
            query['end_date'] = {'$lte': datetime.fromisoformat(end_date)}
        except ValueError:
            return jsonify({'message': 'Invalid end_date format'}), 400
    
    # Execute query with pagination
    skip = (page - 1) * per_page
    reservations_cursor = current_app.db.reservations.find(query).sort('created_at', -1).skip(skip).limit(per_page)
    
    # Convert to list and add client and car details
    reservations = []
    for res in reservations_cursor:
        reservation = Reservation.from_dict(res).to_json()
        
        # Add client details
        client = current_app.db.clients.find_one({'_id': reservation['client_id']})
        if client:
            client_obj = Client.from_dict(client)
            reservation['client'] = client_obj.to_json()
        
        # Add car details
        car = current_app.db.cars.find_one({'_id': reservation['car_id']})
        if car:
            car_obj = Car.from_dict(car)
            reservation['car'] = car_obj.to_json()
        
        reservations.append(reservation)
    
    # Get total count for pagination
    total_count = current_app.db.reservations.count_documents(query)
    
    return jsonify({
        'reservations': reservations,
        'total': total_count,
        'page': page,
        'per_page': per_page,
        'pages': (total_count + per_page - 1) // per_page
    }), 200

@reservation_bp.route('/<reservation_id>', methods=['GET'])
@manager_required
def get_reservation(user_id, reservation_id):
    reservation_data = current_app.db.reservations.find_one({'_id': reservation_id})
    if not reservation_data:
        return jsonify({'message': 'Reservation not found'}), 404
    
    reservation = Reservation.from_dict(reservation_data).to_json()
    
    # Add client details
    client = current_app.db.clients.find_one({'_id': reservation['client_id']})
    if client:
        client_obj = Client.from_dict(client)
        reservation['client'] = client_obj.to_json()
    
    # Add car details
    car = current_app.db.cars.find_one({'_id': reservation['car_id']})
    if car:
        car_obj = Car.from_dict(car)
        reservation['car'] = car_obj.to_json()
    
    return jsonify({'reservation': reservation}), 200

@reservation_bp.route('/<reservation_id>', methods=['PUT'])
@manager_required
def update_reservation(user_id, reservation_id):
    data = request.json
    
    # Check if reservation exists
    reservation_data = current_app.db.reservations.find_one({'_id': reservation_id})
    if not reservation_data:
        return jsonify({'message': 'Reservation not found'}), 404
    
    current_reservation = Reservation.from_dict(reservation_data)
    
    # Handle date updates if provided
    if 'start_date' in data or 'end_date' in data:
        start_date = data.get('start_date', reservation_data['start_date'])
        end_date = data.get('end_date', reservation_data['end_date'])
        
        try:
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date)
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date)
        except ValueError:
            return jsonify({'message': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
        
        # Check if end_date is after start_date
        if end_date <= start_date:
            return jsonify({'message': 'End date must be after start date'}), 400
        
        # Calculate total days
        total_days = (end_date - start_date).days
        if total_days < 1:
            total_days = 1  # Minimum 1 day rental
        
        data['total_days'] = total_days
        
        # Recalculate total amount if daily_rate is available
        if 'daily_rate' in data or current_reservation.daily_rate:
            daily_rate = data.get('daily_rate', current_reservation.daily_rate)
            data['total_amount'] = daily_rate * total_days
    
    # Check if status is being updated
    old_status = current_reservation.status
    new_status = data.get('status', old_status)
    
    # Update reservation
    update_data = {}
    for key, value in data.items():
        # Skip _id field
        if key == '_id':
            continue
        # Handle datetime fields
        if key in ['start_date', 'end_date'] and isinstance(value, str):
            try:
                value = datetime.fromisoformat(value)
            except ValueError:
                continue
        update_data[key] = value
    
    update_data['updated_at'] = datetime.now()
    
    current_app.db.reservations.update_one(
        {'_id': reservation_id},
        {'$set': update_data}
    )
    
    # Handle car status updates based on reservation status changes
    if old_status != new_status:
        car_id = current_reservation.car_id
        client_id = current_reservation.client_id
        
        # If status changed to 'active', update car status to 'rented'
        if new_status == 'active':
            current_app.db.cars.update_one(
                {'_id': car_id},
                {'$set': {'availability_status': 'rented', 'current_renter_id': client_id}}
            )
            
            # Add to car rental history
            car_data = current_app.db.cars.find_one({'_id': car_id})
            if car_data:
                rental_history = car_data.get('rental_history', [])
                rental_history.append({
                    'client_id': client_id,
                    'reservation_id': reservation_id,
                    'start_date': current_reservation.start_date,
                    'end_date': current_reservation.end_date,
                    'status': 'active'
                })
                current_app.db.cars.update_one(
                    {'_id': car_id},
                    {'$set': {'rental_history': rental_history}}
                )
        
        # If status changed to 'completed', update car status to 'available'
        elif new_status == 'completed':
            current_app.db.cars.update_one(
                {'_id': car_id},
                {'$set': {'availability_status': 'available', 'current_renter_id': None}}
            )
            
            # Update car rental history
            car_data = current_app.db.cars.find_one({'_id': car_id})
            if car_data:
                rental_history = car_data.get('rental_history', [])
                for entry in rental_history:
                    if entry.get('reservation_id') == reservation_id:
                        entry['status'] = 'completed'
                        break
                current_app.db.cars.update_one(
                    {'_id': car_id},
                    {'$set': {'rental_history': rental_history}}
                )
        
        # If status changed to 'cancelled' and was previously 'active', update car status
        elif new_status == 'cancelled' and old_status == 'active':
            current_app.db.cars.update_one(
                {'_id': car_id},
                {'$set': {'availability_status': 'available', 'current_renter_id': None}}
            )
            
            # Update car rental history
            car_data = current_app.db.cars.find_one({'_id': car_id})
            if car_data:
                rental_history = car_data.get('rental_history', [])
                for entry in rental_history:
                    if entry.get('reservation_id') == reservation_id:
                        entry['status'] = 'cancelled'
                        break
                current_app.db.cars.update_one(
                    {'_id': car_id},
                    {'$set': {'rental_history': rental_history}}
                )
    
    # Get updated reservation
    updated_reservation_data = current_app.db.reservations.find_one({'_id': reservation_id})
    updated_reservation = Reservation.from_dict(updated_reservation_data).to_json()
    
    return jsonify({'message': 'Reservation updated successfully', 'reservation': updated_reservation}), 200

@reservation_bp.route('/<reservation_id>', methods=['DELETE'])
@manager_required
def delete_reservation(user_id, reservation_id):
    # Check if reservation exists
    reservation_data = current_app.db.reservations.find_one({'_id': reservation_id})
    if not reservation_data:
        return jsonify({'message': 'Reservation not found'}), 404
    
    # Only allow deletion of pending reservations
    if reservation_data.get('status') not in ['pending', 'cancelled']:
        return jsonify({'message': 'Only pending or cancelled reservations can be deleted'}), 400
    
    # Delete reservation
    current_app.db.reservations.delete_one({'_id': reservation_id})
    
    return jsonify({'message': 'Reservation deleted successfully'}), 200

@reservation_bp.route('/check-availability', methods=['POST'])
@manager_required
def check_availability(user_id):
    data = request.json
    
    # Validate required fields
    required_fields = ['car_id', 'start_date', 'end_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Convert string dates to datetime objects
    try:
        start_date = datetime.fromisoformat(data['start_date'])
        end_date = datetime.fromisoformat(data['end_date'])
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    # Check if end_date is after start_date
    if end_date <= start_date:
        return jsonify({'message': 'End date must be after start date'}), 400
    
    # Check if car exists
    car = current_app.db.cars.find_one({'_id': data['car_id']})
    if not car:
        return jsonify({'message': 'Car not found'}), 404
    
    car_obj = Car.from_dict(car)
    if car_obj.availability_status != 'available':
        return jsonify({'message': 'Car is not available for rental', 'available': False}), 200
    
    # Check if car is already reserved for the requested dates
    # Exclude the current reservation if reservation_id is provided
    query = {
        'car_id': data['car_id'],
        'status': {'$in': ['pending', 'confirmed', 'active']},
        '$or': [
            {'start_date': {'$lt': end_date}, 'end_date': {'$gt': start_date}},
            {'start_date': {'$lte': start_date}, 'end_date': {'$gte': start_date}},
            {'start_date': {'$lte': end_date}, 'end_date': {'$gte': end_date}}
        ]
    }
    
    if 'reservation_id' in data:
        query['_id'] = {'$ne': data['reservation_id']}
    
    existing_reservations = list(current_app.db.reservations.find(query))
    
    if len(existing_reservations) > 0:
        # Return conflicting reservations
        conflicts = []
        for res in existing_reservations:
            reservation = Reservation.from_dict(res).to_json()
            conflicts.append({
                'reservation_id': reservation['_id'],
                'start_date': reservation['start_date'],
                'end_date': reservation['end_date'],
                'status': reservation['status']
            })
        
        return jsonify({
            'available': False,
            'message': 'Car is already reserved for the selected dates',
            'conflicts': conflicts
        }), 200
    
    # Calculate pricing
    daily_rate = car_obj.price_per_day
    total_days = (end_date - start_date).days
    if total_days < 1:
        total_days = 1  # Minimum 1 day rental
    total_amount = daily_rate * total_days
    
    return jsonify({
        'available': True,
        'message': 'Car is available for the selected dates',
        'pricing': {
            'daily_rate': daily_rate,
            'total_days': total_days,
            'total_amount': total_amount
        }
    }), 200

@reservation_bp.route('/calendar', methods=['GET'])
@manager_required
def get_calendar(user_id):
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    car_id = request.args.get('car_id')
    
    # Default to current month if dates not provided
    if not start_date_str:
        today = datetime.now()
        start_date = datetime(today.year, today.month, 1)
        start_date_str = start_date.isoformat()
    else:
        try:
            start_date = datetime.fromisoformat(start_date_str)
        except ValueError:
            return jsonify({'message': 'Invalid start_date format'}), 400
    
    if not end_date_str:
        # Default to end of month
        if start_date.month == 12:
            end_date = datetime(start_date.year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = datetime(start_date.year, start_date.month + 1, 1) - timedelta(days=1)
        end_date_str = end_date.isoformat()
    else:
        try:
            end_date = datetime.fromisoformat(end_date_str)
        except ValueError:
            return jsonify({'message': 'Invalid end_date format'}), 400
    
    # Build query
    query = {
        'status': {'$in': ['pending', 'confirmed', 'active']},
        '$or': [
            {'start_date': {'$lte': end_date}, 'end_date': {'$gte': start_date}}
        ]
    }
    
    if car_id:
        query['car_id'] = car_id
    
    # Get reservations
    reservations_cursor = current_app.db.reservations.find(query)
    
    # Format for calendar view
    calendar_events = []
    for res in reservations_cursor:
        reservation = Reservation.from_dict(res).to_json()
        
        # Get client name
        client_name = "Unknown Client"
        client = current_app.db.clients.find_one({'_id': reservation['client_id']})
        if client:
            client_obj = Client.from_dict(client)
            client_name = client_obj.full_name
        
        # Get car details
        car_info = "Unknown Car"
        car = current_app.db.cars.find_one({'_id': reservation['car_id']})
        if car:
            car_obj = Car.from_dict(car)
            car_info = f"{car_obj.brand} {car_obj.model} ({car_obj.year})"
        
        # Create calendar event
        calendar_events.append({
            'id': reservation['_id'],
            'title': f"{client_name} - {car_info}",
            'start': reservation['start_date'],
            'end': reservation['end_date'],
            'status': reservation['status'],
            'client_id': reservation['client_id'],
            'car_id': reservation['car_id'],
            'client_name': client_name,
            'car_info': car_info
        })
    
    return jsonify({'events': calendar_events}), 200

@reservation_bp.route('/stats', methods=['GET'])
@manager_required
def get_stats(user_id):
    # Get date range
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    
    # Default to current month if dates not provided
    if not start_date_str:
        today = datetime.now()
        start_date = datetime(today.year, today.month, 1)
    else:
        try:
            start_date = datetime.fromisoformat(start_date_str)
        except ValueError:
            return jsonify({'message': 'Invalid start_date format'}), 400
    
    if not end_date_str:
        end_date = datetime.now()
    else:
        try:
            end_date = datetime.fromisoformat(end_date_str)
        except ValueError:
            return jsonify({'message': 'Invalid end_date format'}), 400
    
    # Get completed reservations in date range
    completed_reservations = list(current_app.db.reservations.find({
        'status': 'completed',
        'end_date': {'$gte': start_date, '$lte': end_date}
    }))
    
    # Calculate total revenue
    total_revenue = sum(res.get('total_amount', 0) for res in completed_reservations)
    
    # Get reservations by status
    status_counts = {}
    for status in ['pending', 'confirmed', 'active', 'completed', 'cancelled']:
        count = current_app.db.reservations.count_documents({'status': status})
        status_counts[status] = count
    
    # Get overdue rentals (active rentals past their end date)
    overdue_rentals = list(current_app.db.reservations.find({
        'status': 'active',
        'end_date': {'$lt': datetime.now()}
    }))
    
    overdue_list = []
    for res in overdue_rentals:
        reservation = Reservation.from_dict(res).to_json()
        
        # Get client name
        client_name = "Unknown Client"
        client = current_app.db.clients.find_one({'_id': reservation['client_id']})
        if client:
            client_obj = Client.from_dict(client)
            client_name = client_obj.full_name
        
        # Get car details
        car_info = "Unknown Car"
        car = current_app.db.cars.find_one({'_id': reservation['car_id']})
        if car:
            car_obj = Car.from_dict(car)
            car_info = f"{car_obj.brand} {car_obj.model}"
        
        overdue_list.append({
            'reservation_id': reservation['_id'],
            'client_name': client_name,
            'client_id': reservation['client_id'],
            'car_info': car_info,
            'car_id': reservation['car_id'],
            'end_date': reservation['end_date'],
            'days_overdue': (datetime.now() - datetime.fromisoformat(reservation['end_date'])).days
        })
    
    # Get upcoming reservations (next 7 days)
    upcoming_start = datetime.now()
    upcoming_end = upcoming_start + timedelta(days=7)
    
    upcoming_reservations = list(current_app.db.reservations.find({
        'status': {'$in': ['pending', 'confirmed']},
        'start_date': {'$gte': upcoming_start, '$lte': upcoming_end}
    }))
    
    upcoming_list = []
    for res in upcoming_reservations:
        reservation = Reservation.from_dict(res).to_json()
        
        # Get client name
        client_name = "Unknown Client"
        client = current_app.db.clients.find_one({'_id': reservation['client_id']})
        if client:
            client_obj = Client.from_dict(client)
            client_name = client_obj.full_name
        
        # Get car details
        car_info = "Unknown Car"
        car = current_app.db.cars.find_one({'_id': reservation['car_id']})
        if car:
            car_obj = Car.from_dict(car)
            car_info = f"{car_obj.brand} {car_obj.model}"
        
        upcoming_list.append({
            'reservation_id': reservation['_id'],
            'client_name': client_name,
            'car_info': car_info,
            'start_date': reservation['start_date'],
            'status': reservation['status'],
            'days_until': (datetime.fromisoformat(reservation['start_date']) - datetime.now()).days
        })
    
    return jsonify({
        'total_revenue': total_revenue,
        'completed_count': len(completed_reservations),
        'status_counts': status_counts,
        'overdue_rentals': {
            'count': len(overdue_list),
            'rentals': overdue_list
        },
        'upcoming_reservations': {
            'count': len(upcoming_list),
            'reservations': upcoming_list
        }
    }), 200 