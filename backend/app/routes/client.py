from flask import Blueprint, request, jsonify, current_app
from app.models.client import Client
from app.utils.auth_utils import manager_required
from bson.objectid import ObjectId
from datetime import datetime

client_bp = Blueprint('client', __name__)

# Create new client (manager only)
@client_bp.route('', methods=['POST'])
@manager_required
def create_client(user_id):
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('full_name', 'email', 'phone')):
        return jsonify({'message': 'Missing required fields: full_name, email, and phone are required'}), 400
    
    # Check if email already exists
    existing_client = current_app.db.clients.find_one({'email': data['email']})
    if existing_client:
        return jsonify({'message': 'A client with this email already exists'}), 409
    
    # Handle date of birth if provided
    if 'date_of_birth' in data and data['date_of_birth']:
        try:
            data['date_of_birth'] = datetime.fromisoformat(data['date_of_birth'].replace('Z', '+00:00'))
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid date format for date_of_birth. Use ISO format (YYYY-MM-DD)'}), 400
    
    # Create new client
    client = Client(
        full_name=data.get('full_name'),
        email=data.get('email'),
        phone=data.get('phone'),
        address=data.get('address'),
        driver_license=data.get('driver_license'),
        date_of_birth=data.get('date_of_birth'),
        emergency_contact=data.get('emergency_contact'),
        notes=data.get('notes')
    )
    
    # Save to database
    client_data = client.to_dict()
    current_app.db.clients.insert_one(client_data)
    
    return jsonify({
        'message': 'Client created successfully',
        'client': client.to_json()
    }), 201

# Get all clients (manager only)
@client_bp.route('', methods=['GET'])
@manager_required
def list_clients(user_id):
    # Get query parameters for pagination
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    # Get query parameters for search
    search = request.args.get('search', '')
    
    # Build query
    query = {}
    if search:
        query = {
            '$or': [
                {'full_name': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}},
                {'phone': {'$regex': search, '$options': 'i'}}
            ]
        }
    
    # Get total count
    total = current_app.db.clients.count_documents(query)
    
    # Get clients with pagination
    clients_data = list(current_app.db.clients.find(query).skip((page - 1) * per_page).limit(per_page))
    
    # Convert ObjectId to string
    for client in clients_data:
        if isinstance(client['_id'], ObjectId):
            client['_id'] = str(client['_id'])
    
    clients = [Client.from_dict(client).to_json() for client in clients_data]
    
    return jsonify({
        'clients': clients,
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page
    }), 200

# Get client by ID (manager only)
@client_bp.route('/<client_id>', methods=['GET'])
@manager_required
def get_client(user_id, client_id):
    try:
        # Find client by ID
        client_data = current_app.db.clients.find_one({'_id': client_id})
        if not client_data:
            return jsonify({'message': 'Client not found'}), 404
        
        # Convert ObjectId to string
        if isinstance(client_data['_id'], ObjectId):
            client_data['_id'] = str(client_data['_id'])
        
        client = Client.from_dict(client_data)
        return jsonify({'client': client.to_json()}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Update client (manager only)
@client_bp.route('/<client_id>', methods=['PUT'])
@manager_required
def update_client(user_id, client_id):
    data = request.get_json()
    
    # Find client by ID
    client_data = current_app.db.clients.find_one({'_id': client_id})
    if not client_data:
        return jsonify({'message': 'Client not found'}), 404
    
    # Check if email is being changed and already exists
    if 'email' in data and data['email'] != client_data.get('email'):
        existing_client = current_app.db.clients.find_one({'email': data['email']})
        if existing_client and str(existing_client['_id']) != client_id:
            return jsonify({'message': 'A client with this email already exists'}), 409
    
    # Handle date of birth if provided
    if 'date_of_birth' in data and data['date_of_birth']:
        try:
            data['date_of_birth'] = datetime.fromisoformat(data['date_of_birth'].replace('Z', '+00:00'))
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid date format for date_of_birth. Use ISO format (YYYY-MM-DD)'}), 400
    
    # Update fields
    updates = {}
    
    # List of all possible fields to update
    fields = [
        'full_name', 'email', 'phone', 'address', 'driver_license',
        'date_of_birth', 'emergency_contact', 'notes'
    ]
    
    # Update only provided fields
    for field in fields:
        if field in data:
            updates[field] = data[field]
    
    # Update timestamp
    updates['updated_at'] = datetime.now()
    
    # Apply updates
    if updates:
        current_app.db.clients.update_one(
            {'_id': client_id},
            {'$set': updates}
        )
    
    # Get updated client
    updated_client_data = current_app.db.clients.find_one({'_id': client_id})
    
    # Convert ObjectId to string
    if isinstance(updated_client_data['_id'], ObjectId):
        updated_client_data['_id'] = str(updated_client_data['_id'])
    
    updated_client = Client.from_dict(updated_client_data)
    
    return jsonify({
        'message': 'Client updated successfully',
        'client': updated_client.to_json()
    }), 200

# Delete client (manager only)
@client_bp.route('/<client_id>', methods=['DELETE'])
@manager_required
def delete_client(user_id, client_id):
    # Find client by ID
    client_data = current_app.db.clients.find_one({'_id': client_id})
    if not client_data:
        return jsonify({'message': 'Client not found'}), 404
    
    # Check if client has active rentals
    active_rentals = current_app.db.cars.count_documents({'current_renter_id': client_id})
    if active_rentals > 0:
        return jsonify({'message': 'Cannot delete a client with active rentals'}), 400
    
    # Delete client
    current_app.db.clients.delete_one({'_id': client_id})
    
    return jsonify({
        'message': 'Client deleted successfully'
    }), 200

# Get client rental history (manager only)
@client_bp.route('/<client_id>/history', methods=['GET'])
@manager_required
def get_client_history(user_id, client_id):
    # Find client by ID
    client_data = current_app.db.clients.find_one({'_id': client_id})
    if not client_data:
        return jsonify({'message': 'Client not found'}), 404
    
    # Convert ObjectId to string
    if isinstance(client_data['_id'], ObjectId):
        client_data['_id'] = str(client_data['_id'])
    
    # Find all cars with rental history for this client
    cars = list(current_app.db.cars.find(
        {'rental_history.renter_id': client_id},
        {'_id': 1, 'brand': 1, 'model': 1, 'rental_history': 1}
    ))
    
    # Extract rental history for this client
    rental_history = []
    for car in cars:
        car_id = str(car['_id']) if isinstance(car['_id'], ObjectId) else car['_id']
        car_name = f"{car.get('brand', '')} {car.get('model', '')}"
        
        for rental in car.get('rental_history', []):
            if rental.get('renter_id') == client_id:
                rental_history.append({
                    'car_id': car_id,
                    'car_name': car_name,
                    'start_date': rental.get('start_date'),
                    'end_date': rental.get('end_date'),
                    'total_cost': rental.get('total_cost'),
                    'status': rental.get('status'),
                    'record_id': rental.get('record_id')
                })
    
    return jsonify({
        'client_id': client_id,
        'full_name': client_data.get('full_name'),
        'rental_history': rental_history
    }), 200 