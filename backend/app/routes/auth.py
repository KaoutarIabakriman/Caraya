from flask import Blueprint, request, jsonify, current_app
from app.models.manager import Manager
from app.utils.auth_utils import hash_password, check_password, generate_token, manager_required
import re
from bson.objectid import ObjectId

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('email', 'password', 'name')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Validate email format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, data['email']):
        return jsonify({'message': 'Invalid email format'}), 400
    
    # Check if email already exists
    existing_manager = current_app.db.managers.find_one({'email': data['email']})
    if existing_manager:
        return jsonify({'message': 'Email already registered'}), 409
    
    # Create new manager
    hashed_password = hash_password(data['password'])
    manager = Manager(
        email=data['email'],
        password=hashed_password,
        name=data['name']
    )
    
    # Save to database
    manager_data = manager.to_dict()
    current_app.db.managers.insert_one(manager_data)
    
    # Generate token
    token = generate_token(manager._id)
    
    return jsonify({
        'message': 'Manager registered successfully',
        'token': token,
        'manager': manager.to_json()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'message': 'Missing email or password'}), 400
    
    # Find manager by email
    manager_data = current_app.db.managers.find_one({'email': data['email']})
    if not manager_data:
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Verify password
    if not check_password(manager_data['password'], data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Convert ObjectId to string if needed
    if isinstance(manager_data['_id'], ObjectId):
        manager_data['_id'] = str(manager_data['_id'])
    
    # Create manager object
    manager = Manager.from_dict(manager_data)
    
    # Generate token
    token = generate_token(manager._id, role=manager.role)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'manager': manager.to_json()
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@manager_required
def get_profile(user_id):
    # Find manager by ID
    manager_data = current_app.db.managers.find_one({'_id': user_id})
    if not manager_data:
        return jsonify({'message': 'Manager not found'}), 404
    
    # Convert ObjectId to string if needed
    if isinstance(manager_data['_id'], ObjectId):
        manager_data['_id'] = str(manager_data['_id'])
    
    # Create manager object
    manager = Manager.from_dict(manager_data)
    
    return jsonify({
        'manager': manager.to_json()
    }), 200 