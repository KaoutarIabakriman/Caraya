from datetime import datetime
from bson import ObjectId

class Car:
    def __init__(self, 
                 brand=None, 
                 model=None, 
                 year=None, 
                 price_per_day=0, 
                 availability_status="available", 
                 features=None, 
                 images=None, 
                 description=None, 
                 fuel_type=None, 
                 transmission=None, 
                 seats=None, 
                 color=None, 
                 license_plate=None, 
                 mileage=0, 
                 insurance_info=None, 
                 maintenance_status="good", 
                 current_renter_id=None, 
                 rental_history=None,
                 _id=None):
        self._id = _id or str(ObjectId())
        self.brand = brand
        self.model = model
        self.year = year
        self.price_per_day = price_per_day
        self.availability_status = availability_status  # available, rented, maintenance
        self.features = features or []
        self.images = images or []
        self.description = description
        self.fuel_type = fuel_type
        self.transmission = transmission
        self.seats = seats
        self.color = color
        self.license_plate = license_plate
        self.mileage = mileage
        self.insurance_info = insurance_info or {}
        self.maintenance_status = maintenance_status
        self.current_renter_id = current_renter_id
        self.rental_history = rental_history or []
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    def to_dict(self):
        return {
            "_id": self._id,
            "brand": self.brand,
            "model": self.model,
            "year": self.year,
            "price_per_day": self.price_per_day,
            "availability_status": self.availability_status,
            "features": self.features,
            "images": self.images,
            "description": self.description,
            "fuel_type": self.fuel_type,
            "transmission": self.transmission,
            "seats": self.seats,
            "color": self.color,
            "license_plate": self.license_plate,
            "mileage": self.mileage,
            "insurance_info": self.insurance_info,
            "maintenance_status": self.maintenance_status,
            "current_renter_id": self.current_renter_id,
            "rental_history": self.rental_history,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    def to_json(self):
        car_dict = self.to_dict()
        # Convert datetime objects to strings
        if car_dict.get("created_at"):
            car_dict["created_at"] = car_dict["created_at"].isoformat()
        if car_dict.get("updated_at"):
            car_dict["updated_at"] = car_dict["updated_at"].isoformat()
        return car_dict
    
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
        
        car = cls(
            _id=_id,
            brand=data.get("brand"),
            model=data.get("model"),
            year=data.get("year"),
            price_per_day=data.get("price_per_day", 0),
            availability_status=data.get("availability_status", "available"),
            features=data.get("features", []),
            images=data.get("images", []),
            description=data.get("description"),
            fuel_type=data.get("fuel_type"),
            transmission=data.get("transmission"),
            seats=data.get("seats"),
            color=data.get("color"),
            license_plate=data.get("license_plate"),
            mileage=data.get("mileage", 0),
            insurance_info=data.get("insurance_info", {}),
            maintenance_status=data.get("maintenance_status", "good"),
            current_renter_id=data.get("current_renter_id"),
            rental_history=data.get("rental_history", [])
        )
        
        # Set datetime fields
        car.created_at = created_at or datetime.now()
        car.updated_at = updated_at or datetime.now()
        
        return car 