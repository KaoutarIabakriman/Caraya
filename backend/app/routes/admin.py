from flask import Blueprint, request, jsonify, current_app
from app.models.manager import Manager
from app.utils.auth_utils import hash_password, check_password, generate_token, admin_required
import re
from bson.objectid import ObjectId

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'message': 'Missing email or password'}), 400
    
    # Find admin by email
    admin_data = current_app.db.managers.find_one({'email': data['email'], 'role': 'admin'})
    if not admin_data:
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Verify password
    if not check_password(admin_data['password'], data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Convert ObjectId to string if needed
    if isinstance(admin_data['_id'], ObjectId):
        admin_data['_id'] = str(admin_data['_id'])
    
    # Create admin object
    admin = Manager.from_dict(admin_data)
    
    # Generate token
    token = generate_token(admin._id, role='admin')
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'admin': admin.to_json()
    }), 200

@admin_bp.route('/managers', methods=['GET'])
@admin_required
def get_managers(admin_id):
    # Get all managers (excluding admins)
    managers_data = list(current_app.db.managers.find({'role': 'manager'}))
    
    # Convert ObjectId to string
    for manager in managers_data:
        if isinstance(manager['_id'], ObjectId):
            manager['_id'] = str(manager['_id'])
    
    managers = [Manager.from_dict(manager).to_json() for manager in managers_data]
    
    return jsonify({
        'managers': managers
    }), 200

@admin_bp.route('/managers/<manager_id>', methods=['GET'])
@admin_required
def get_manager(admin_id, manager_id):
    # Find manager by ID
    try:
        manager_data = current_app.db.managers.find_one({'_id': manager_id, 'role': 'manager'})
        if not manager_data:
            return jsonify({'message': 'Manager not found'}), 404
        
        # Convert ObjectId to string
        if isinstance(manager_data['_id'], ObjectId):
            manager_data['_id'] = str(manager_data['_id'])
        
        manager = Manager.from_dict(manager_data)
        return jsonify({'manager': manager.to_json()}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@admin_bp.route('/managers', methods=['POST'])
@admin_required
def create_manager(admin_id):
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
        name=data['name'],
        role='manager'
    )
    
    # Save to database
    manager_data = manager.to_dict()
    current_app.db.managers.insert_one(manager_data)
    
    return jsonify({
        'message': 'Manager created successfully',
        'manager': manager.to_json()
    }), 201

@admin_bp.route('/managers/<manager_id>', methods=['PUT'])
@admin_required
def update_manager(admin_id, manager_id):
    data = request.get_json()
    
    # Find manager by ID
    manager_data = current_app.db.managers.find_one({'_id': manager_id, 'role': 'manager'})
    if not manager_data:
        return jsonify({'message': 'Manager not found'}), 404
    
    # Update fields
    updates = {}
    
    if 'name' in data:
        updates['name'] = data['name']
    
    if 'email' in data:
        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data['email']):
            return jsonify({'message': 'Invalid email format'}), 400
        
        # Check if email already exists (and it's not the current manager's email)
        if data['email'] != manager_data['email']:
            existing_manager = current_app.db.managers.find_one({'email': data['email']})
            if existing_manager:
                return jsonify({'message': 'Email already registered'}), 409
        
        updates['email'] = data['email']
    
    if 'password' in data:
        # Hash new password
        updates['password'] = hash_password(data['password'])
    
    # Apply updates
    if updates:
        current_app.db.managers.update_one(
            {'_id': manager_id},
            {'$set': updates}
        )
    
    # Get updated manager
    updated_manager_data = current_app.db.managers.find_one({'_id': manager_id})
    
    # Convert ObjectId to string
    if isinstance(updated_manager_data['_id'], ObjectId):
        updated_manager_data['_id'] = str(updated_manager_data['_id'])
    
    updated_manager = Manager.from_dict(updated_manager_data)
    
    return jsonify({
        'message': 'Manager updated successfully',
        'manager': updated_manager.to_json()
    }), 200

@admin_bp.route('/managers/<manager_id>', methods=['DELETE'])
@admin_required
def delete_manager(admin_id, manager_id):
    # Find manager by ID
    manager_data = current_app.db.managers.find_one({'_id': manager_id, 'role': 'manager'})
    if not manager_data:
        return jsonify({'message': 'Manager not found'}), 404
    
    # Delete manager
    current_app.db.managers.delete_one({'_id': manager_id})
    
    return jsonify({
        'message': 'Manager deleted successfully'
    }), 200

@admin_bp.route('/profile', methods=['GET'])
@admin_required
def get_admin_profile(admin_id):
    # Find admin by ID
    admin_data = current_app.db.managers.find_one({'_id': admin_id, 'role': 'admin'})
    if not admin_data:
        return jsonify({'message': 'Admin not found'}), 404
    
    # Convert ObjectId to string
    if isinstance(admin_data['_id'], ObjectId):
        admin_data['_id'] = str(admin_data['_id'])
    
    # Create admin object
    admin = Manager.from_dict(admin_data)
    
    return jsonify({
        'admin': admin.to_json()
    }), 200 