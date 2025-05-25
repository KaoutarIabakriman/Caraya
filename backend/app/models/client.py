from datetime import datetime
from bson import ObjectId

class Client:
    def __init__(self, 
                 full_name=None, 
                 email=None, 
                 phone=None, 
                 address=None, 
                 driver_license=None, 
                 date_of_birth=None, 
                 emergency_contact=None, 
                 notes=None,
                 _id=None):
        self._id = _id or str(ObjectId())
        self.full_name = full_name
        self.email = email
        self.phone = phone
        self.address = address
        self.driver_license = driver_license
        self.date_of_birth = date_of_birth
        self.emergency_contact = emergency_contact
        self.notes = notes
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    def to_dict(self):
        return {
            "_id": self._id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "driver_license": self.driver_license,
            "date_of_birth": self.date_of_birth,
            "emergency_contact": self.emergency_contact,
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    def to_json(self):
        client_dict = self.to_dict()
        # Convert datetime objects to strings
        if client_dict.get("created_at"):
            client_dict["created_at"] = client_dict["created_at"].isoformat()
        if client_dict.get("updated_at"):
            client_dict["updated_at"] = client_dict["updated_at"].isoformat()
        if client_dict.get("date_of_birth"):
            client_dict["date_of_birth"] = client_dict["date_of_birth"].isoformat() if isinstance(client_dict["date_of_birth"], datetime) else client_dict["date_of_birth"]
        return client_dict
    
    @classmethod
    def from_dict(cls, data):
        if not data:
            return None
        
        # Convert string ID to ObjectId if needed
        _id = data.get("_id")
        if isinstance(_id, ObjectId):
            _id = str(_id)
        
        # Handle datetime fields
        created_at = data.get("created_at")
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at)
            except (ValueError, TypeError):
                created_at = datetime.now()
        
        updated_at = data.get("updated_at")
        if isinstance(updated_at, str):
            try:
                updated_at = datetime.fromisoformat(updated_at)
            except (ValueError, TypeError):
                updated_at = datetime.now()
        
        # Handle date of birth
        date_of_birth = data.get("date_of_birth")
        if isinstance(date_of_birth, str):
            try:
                date_of_birth = datetime.fromisoformat(date_of_birth)
            except (ValueError, TypeError):
                date_of_birth = None
        
        client = cls(
            _id=_id,
            full_name=data.get("full_name"),
            email=data.get("email"),
            phone=data.get("phone"),
            address=data.get("address"),
            driver_license=data.get("driver_license"),
            date_of_birth=date_of_birth,
            emergency_contact=data.get("emergency_contact"),
            notes=data.get("notes")
        )
        
        # Set datetime fields
        client.created_at = created_at or datetime.now()
        client.updated_at = updated_at or datetime.now()
        
        return client
