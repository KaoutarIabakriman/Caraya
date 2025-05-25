from flask import Blueprint, request, jsonify, current_app
from app.models.car import Car
from app.utils.auth_utils import manager_required
from bson.objectid import ObjectId

car_bp = Blueprint('car', __name__)

# Public endpoint to list all cars
@car_bp.route('', methods=['GET'])
def list_cars():
    # Get query parameters for filtering
    brand = request.args.get('brand')
    model = request.args.get('model')
    availability = request.args.get('availability')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    
    # Build query
    query = {}
    if brand:
        query['brand'] = {'$regex': brand, '$options': 'i'}
    if model:
        query['model'] = {'$regex': model, '$options': 'i'}
    if availability:
        query['availability_status'] = availability
    if min_price:
        query['price_per_day'] = query.get('price_per_day', {})
        query['price_per_day']['$gte'] = float(min_price)
    if max_price:
        query['price_per_day'] = query.get('price_per_day', {})
        query['price_per_day']['$lte'] = float(max_price)
    
    # Get cars from database
    cars_data = list(current_app.db.cars.find(query))
    
    # Convert ObjectId to string
    for car in cars_data:
        if isinstance(car['_id'], ObjectId):
            car['_id'] = str(car['_id'])
    
    cars = [Car.from_dict(car).to_json() for car in cars_data]
    
    return jsonify({
        'cars': cars,
        'total': len(cars)
    }), 200

# Get car by ID (public)
@car_bp.route('/<car_id>', methods=['GET'])
def get_car(car_id):
    try:
        # Find car by ID
        car_data = current_app.db.cars.find_one({'_id': car_id})
        if not car_data:
            return jsonify({'message': 'Car not found'}), 404
        
        # Convert ObjectId to string
        if isinstance(car_data['_id'], ObjectId):
            car_data['_id'] = str(car_data['_id'])
        
        car = Car.from_dict(car_data)
        return jsonify({'car': car.to_json()}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Create new car (manager only)
@car_bp.route('', methods=['POST'])
@manager_required
def create_car(user_id):
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('brand', 'model', 'year', 'price_per_day')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if license plate already exists
    if 'license_plate' in data and data['license_plate']:
        existing_car = current_app.db.cars.find_one({'license_plate': data['license_plate']})
        if existing_car:
            return jsonify({'message': 'License plate already registered'}), 409
    
    # Create new car
    car = Car(
        brand=data.get('brand'),
        model=data.get('model'),
        year=data.get('year'),
        price_per_day=data.get('price_per_day'),
        availability_status=data.get('availability_status', 'available'),
        features=data.get('features', []),
        images=data.get('images', []),
        description=data.get('description'),
        fuel_type=data.get('fuel_type'),
        transmission=data.get('transmission'),
        seats=data.get('seats'),
        color=data.get('color'),
        license_plate=data.get('license_plate'),
        mileage=data.get('mileage', 0),
        insurance_info=data.get('insurance_info', {}),
        maintenance_status=data.get('maintenance_status', 'good')
    )
    
    # Save to database
    car_data = car.to_dict()
    current_app.db.cars.insert_one(car_data)
    
    return jsonify({
        'message': 'Car created successfully',
        'car': car.to_json()
    }), 201

# Update car (manager only)
@car_bp.route('/<car_id>', methods=['PUT'])
@manager_required
def update_car(user_id, car_id):
    data = request.get_json()
    
    # Find car by ID
    car_data = current_app.db.cars.find_one({'_id': car_id})
    if not car_data:
        return jsonify({'message': 'Car not found'}), 404
    
    # Check if license plate already exists (if changed)
    if 'license_plate' in data and data['license_plate'] != car_data.get('license_plate'):
        existing_car = current_app.db.cars.find_one({'license_plate': data['license_plate']})
        if existing_car:
            return jsonify({'message': 'License plate already registered'}), 409
    
    # Update fields
    updates = {}
    
    # List of all possible fields to update
    fields = [
        'brand', 'model', 'year', 'price_per_day', 'availability_status',
        'features', 'images', 'description', 'fuel_type', 'transmission',
        'seats', 'color', 'license_plate', 'mileage', 'insurance_info',
        'maintenance_status', 'current_renter_id'
    ]
    
    # Update only provided fields
    for field in fields:
        if field in data:
            updates[field] = data[field]
    
    # Update timestamp
    from datetime import datetime
    updates['updated_at'] = datetime.now()
    
    # Apply updates
    if updates:
        current_app.db.cars.update_one(
            {'_id': car_id},
            {'$set': updates}
        )
    
    # Get updated car
    updated_car_data = current_app.db.cars.find_one({'_id': car_id})
    
    # Convert ObjectId to string
    if isinstance(updated_car_data['_id'], ObjectId):
        updated_car_data['_id'] = str(updated_car_data['_id'])
    
    updated_car = Car.from_dict(updated_car_data)
    
    return jsonify({
        'message': 'Car updated successfully',
        'car': updated_car.to_json()
    }), 200

# Delete car (manager only)
@car_bp.route('/<car_id>', methods=['DELETE'])
@manager_required
def delete_car(user_id, car_id):
    # Find car by ID
    car_data = current_app.db.cars.find_one({'_id': car_id})
    if not car_data:
        return jsonify({'message': 'Car not found'}), 404
    
    # Check if car is currently rented
    if car_data.get('availability_status') == 'rented':
        return jsonify({'message': 'Cannot delete a car that is currently rented'}), 400
    
    # Delete car
    current_app.db.cars.delete_one({'_id': car_id})
    
    return jsonify({
        'message': 'Car deleted successfully'
    }), 200

# Get car rental history (manager only)
@car_bp.route('/<car_id>/history', methods=['GET'])
@manager_required
def get_car_history(user_id, car_id):
    # Find car by ID
    car_data = current_app.db.cars.find_one({'_id': car_id})
    if not car_data:
        return jsonify({'message': 'Car not found'}), 404
    
    # Convert ObjectId to string
    if isinstance(car_data['_id'], ObjectId):
        car_data['_id'] = str(car_data['_id'])
    
    # Get rental history
    rental_history = car_data.get('rental_history', [])
    
    return jsonify({
        'car_id': car_id,
        'brand': car_data.get('brand'),
        'model': car_data.get('model'),
        'rental_history': rental_history
    }), 200

# Add rental record to car history (manager only)
@car_bp.route('/<car_id>/history', methods=['POST'])
@manager_required
def add_rental_record(user_id, car_id):
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('renter_id', 'start_date', 'end_date')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Find car by ID
    car_data = current_app.db.cars.find_one({'_id': car_id})
    if not car_data:
        return jsonify({'message': 'Car not found'}), 404
    
    # Create rental record
    from datetime import datetime
    rental_record = {
        'record_id': str(ObjectId()),
        'renter_id': data['renter_id'],
        'start_date': data['start_date'],
        'end_date': data['end_date'],
        'total_cost': data.get('total_cost'),
        'status': data.get('status', 'active'),
        'created_at': datetime.now().isoformat()
    }
    
    # Add rental record to car history
    current_app.db.cars.update_one(
        {'_id': car_id},
        {
            '$push': {'rental_history': rental_record},
            '$set': {
                'availability_status': 'rented',
                'current_renter_id': data['renter_id'],
                'updated_at': datetime.now()
            }
        }
    )
    
    return jsonify({
        'message': 'Rental record added successfully',
        'rental_record': rental_record
    }), 201 