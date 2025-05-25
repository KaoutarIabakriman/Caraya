from flask import Flask, current_app, send_from_directory
from flask_cors import CORS
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from app.utils.auth_utils import hash_password
from bson import ObjectId

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configure MongoDB
    app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb+srv://abdellah:abdellah123@awdiii.glxjg3a.mongodb.net/')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_jwt_secret_key')
    
    # Configure uploads directory
    app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
    
    # Create uploads directory if it doesn't exist
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    # Initialize MongoDB client
    mongo_client = MongoClient(app.config['MONGO_URI'])
    app.db = mongo_client.car_rental
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.admin import admin_bp
    from app.routes.car import car_bp
    from app.routes.upload import upload_bp
    from app.routes.client import client_bp
    from app.routes.reservation import reservation_bp
    from app.routes.analytics import analytics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(car_bp, url_prefix='/api/cars')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(client_bp, url_prefix='/api/clients')
    app.register_blueprint(reservation_bp, url_prefix='/api/reservations')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    
    # Serve static files from uploads directory
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    @app.route('/api/health')
    def health_check():
        return {"status": "healthy"}, 200
    
    # Create default admin if not exists
    with app.app_context():
        try:
            if app.db.managers.count_documents({'role': 'admin'}) == 0:
                default_admin = {
                    'email': 'admin@carental.com',
                    'password': hash_password('admin123'),
                    'name': 'Admin',
                    'role': 'admin',
                    '_id': str(ObjectId()),
                    'created_at': None  # Will be set to current time by the Manager class
                }
                app.db.managers.insert_one(default_admin)
                print("Default admin account created:")
                print("Email: admin@carental.com")
                print("Password: admin123")
            else:
                print("Admin account already exists")
                
            # Verify admin exists
            admin = app.db.managers.find_one({'email': 'admin@carental.com'})
            if admin:
                print(f"Admin found with ID: {admin['_id']}")
            else:
                print("Warning: Admin account not found")
        except Exception as e:
            print(f"Error setting up admin account: {e}")
    
    return app 