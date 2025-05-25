from datetime import datetime
from bson import ObjectId

class Manager:
    def __init__(self, email, password, name=None, role='manager', _id=None, created_at=None):
        self.email = email
        self.password = password  # This should be the hashed password
        self.name = name
        self.role = role  # Can be 'manager' or 'admin'
        self._id = _id if _id else str(ObjectId())
        self.created_at = created_at if created_at else datetime.utcnow()
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            email=data.get('email'),
            password=data.get('password'),
            name=data.get('name'),
            role=data.get('role', 'manager'),
            _id=data.get('_id'),
            created_at=data.get('created_at')
        )
    
    def to_dict(self):
        return {
            '_id': self._id,
            'email': self.email,
            'password': self.password,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at
        }
    
    def to_json(self):
        return {
            'id': self._id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        } 