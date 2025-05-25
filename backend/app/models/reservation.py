from datetime import datetime
from bson import ObjectId

class Reservation:
    def __init__(self,
                 client_id=None,
                 car_id=None,
                 start_date=None,
                 end_date=None,
                 total_days=0,
                 daily_rate=0,
                 total_amount=0,
                 status="pending",  # pending/confirmed/active/completed/cancelled
                 pickup_location=None,
                 return_location=None,
                 deposit_amount=0,
                 payment_status="unpaid",  # unpaid/partial/paid
                 notes=None,
                 _id=None,
                 created_at=None):
        self._id = _id or str(ObjectId())
        self.client_id = client_id
        self.car_id = car_id
        self.start_date = start_date
        self.end_date = end_date
        self.total_days = total_days
        self.daily_rate = daily_rate
        self.total_amount = total_amount
        self.status = status
        self.pickup_location = pickup_location
        self.return_location = return_location
        self.deposit_amount = deposit_amount
        self.payment_status = payment_status
        self.notes = notes
        self.created_at = created_at or datetime.now()
        self.updated_at = datetime.now()
    
    def to_dict(self):
        return {
            "_id": self._id,
            "client_id": self.client_id,
            "car_id": self.car_id,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "total_days": self.total_days,
            "daily_rate": self.daily_rate,
            "total_amount": self.total_amount,
            "status": self.status,
            "pickup_location": self.pickup_location,
            "return_location": self.return_location,
            "deposit_amount": self.deposit_amount,
            "payment_status": self.payment_status,
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    def to_json(self):
        reservation_dict = self.to_dict()
        # Convert datetime objects to strings
        if reservation_dict.get("created_at"):
            reservation_dict["created_at"] = reservation_dict["created_at"].isoformat()
        if reservation_dict.get("updated_at"):
            reservation_dict["updated_at"] = reservation_dict["updated_at"].isoformat()
        if reservation_dict.get("start_date"):
            reservation_dict["start_date"] = reservation_dict["start_date"].isoformat() if isinstance(reservation_dict["start_date"], datetime) else reservation_dict["start_date"]
        if reservation_dict.get("end_date"):
            reservation_dict["end_date"] = reservation_dict["end_date"].isoformat() if isinstance(reservation_dict["end_date"], datetime) else reservation_dict["end_date"]
        return reservation_dict
    
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
        
        # Handle start_date and end_date
        start_date = data.get("start_date")
        if isinstance(start_date, str):
            try:
                start_date = datetime.fromisoformat(start_date)
            except (ValueError, TypeError):
                start_date = None
        
        end_date = data.get("end_date")
        if isinstance(end_date, str):
            try:
                end_date = datetime.fromisoformat(end_date)
            except (ValueError, TypeError):
                end_date = None
        
        reservation = cls(
            _id=_id,
            client_id=data.get("client_id"),
            car_id=data.get("car_id"),
            start_date=start_date,
            end_date=end_date,
            total_days=data.get("total_days", 0),
            daily_rate=data.get("daily_rate", 0),
            total_amount=data.get("total_amount", 0),
            status=data.get("status", "pending"),
            pickup_location=data.get("pickup_location"),
            return_location=data.get("return_location"),
            deposit_amount=data.get("deposit_amount", 0),
            payment_status=data.get("payment_status", "unpaid"),
            notes=data.get("notes")
        )
        
        # Set datetime fields
        reservation.created_at = created_at or datetime.now()
        reservation.updated_at = updated_at or datetime.now()
        
        return reservation 