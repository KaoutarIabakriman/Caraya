from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
import calendar
from bson import ObjectId
from app.utils.auth_utils import token_required, manager_required

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@manager_required
def get_dashboard_metrics(user_id):
    """Get main dashboard metrics"""
    try:
        # Get date range parameters (default to last 30 days)
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        if start_date_str:
            start_date = datetime.fromisoformat(start_date_str)
        else:
            start_date = datetime.now() - timedelta(days=30)
            
        if end_date_str:
            end_date = datetime.fromisoformat(end_date_str)
        else:
            end_date = datetime.now()
        
        # Total cars count
        total_cars = current_app.db.cars.count_documents({})
        
        # Available cars count
        available_cars = current_app.db.cars.count_documents({'availability_status': 'available'})
        
        # Total clients count
        total_clients = current_app.db.clients.count_documents({})
        
        # Active reservations
        active_reservations = current_app.db.reservations.count_documents({
            'status': 'active'
        })
        
        # Pending reservations
        pending_reservations = current_app.db.reservations.count_documents({
            'status': 'pending'
        })
        
        # Total revenue (from completed reservations)
        revenue_pipeline = [
            {
                '$match': {
                    'status': 'completed',
                    'end_date': {'$gte': start_date, '$lte': end_date}
                }
            },
            {
                '$group': {
                    '_id': None,
                    'total_revenue': {'$sum': '$total_amount'}
                }
            }
        ]
        
        revenue_result = list(current_app.db.reservations.aggregate(revenue_pipeline))
        total_revenue = revenue_result[0]['total_revenue'] if revenue_result else 0
        
        # Recent reservations
        recent_reservations = list(current_app.db.reservations.find(
            {'created_at': {'$gte': datetime.now() - timedelta(days=7)}}
        ).sort('created_at', -1).limit(5))
        
        recent_reservations_formatted = []
        for res in recent_reservations:
            # Get client name
            client = current_app.db.clients.find_one({'_id': res['client_id']})
            client_name = client['full_name'] if client else "Unknown"
            
            # Get car info
            car = current_app.db.cars.find_one({'_id': res['car_id']})
            car_info = f"{car['brand']} {car['model']}" if car else "Unknown"
            
            recent_reservations_formatted.append({
                'id': res['_id'],
                'client_name': client_name,
                'car_info': car_info,
                'start_date': res['start_date'].isoformat() if isinstance(res['start_date'], datetime) else res['start_date'],
                'end_date': res['end_date'].isoformat() if isinstance(res['end_date'], datetime) else res['end_date'],
                'status': res['status'],
                'total_amount': res['total_amount']
            })
        
        return jsonify({
            'total_cars': total_cars,
            'available_cars': available_cars,
            'total_clients': total_clients,
            'active_reservations': active_reservations,
            'pending_reservations': pending_reservations,
            'total_revenue': total_revenue,
            'recent_reservations': recent_reservations_formatted,
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        }), 200
        
    except Exception as e:
        print(f"Error getting dashboard metrics: {str(e)}")
        return jsonify({'message': f'Error getting dashboard metrics: {str(e)}'}), 500

@analytics_bp.route('/reservations', methods=['GET'])
@manager_required
def get_reservation_analytics(user_id):
    """Get detailed reservation analytics"""
    try:
        # Get date range parameters (default to current year)
        year = int(request.args.get('year', datetime.now().year))
        
        # Bookings by month
        bookings_by_month = []
        
        for month in range(1, 13):
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = datetime(year, month + 1, 1) - timedelta(days=1)
            
            count = current_app.db.reservations.count_documents({
                'created_at': {'$gte': start_date, '$lte': end_date}
            })
            
            bookings_by_month.append({
                'month': calendar.month_name[month],
                'count': count
            })
        
        # Popular cars (most reserved)
        car_pipeline = [
            {
                '$group': {
                    '_id': '$car_id',
                    'reservation_count': {'$sum': 1}
                }
            },
            {'$sort': {'reservation_count': -1}},
            {'$limit': 5}
        ]
        
        popular_cars_result = list(current_app.db.reservations.aggregate(car_pipeline))
        popular_cars = []
        
        for item in popular_cars_result:
            car = current_app.db.cars.find_one({'_id': item['_id']})
            if car:
                popular_cars.append({
                    'car_id': car['_id'],
                    'brand': car['brand'],
                    'model': car['model'],
                    'year': car['year'],
                    'reservation_count': item['reservation_count']
                })
        
        # Client statistics (top clients by reservation count)
        client_pipeline = [
            {
                '$group': {
                    '_id': '$client_id',
                    'reservation_count': {'$sum': 1},
                    'total_spent': {'$sum': '$total_amount'}
                }
            },
            {'$sort': {'reservation_count': -1}},
            {'$limit': 5}
        ]
        
        top_clients_result = list(current_app.db.reservations.aggregate(client_pipeline))
        top_clients = []
        
        for item in top_clients_result:
            client = current_app.db.clients.find_one({'_id': item['_id']})
            if client:
                top_clients.append({
                    'client_id': client['_id'],
                    'name': client['full_name'],
                    'email': client['email'],
                    'reservation_count': item['reservation_count'],
                    'total_spent': item['total_spent']
                })
        
        # Reservation status distribution
        status_counts = {}
        for status in ['pending', 'confirmed', 'active', 'completed', 'cancelled']:
            count = current_app.db.reservations.count_documents({'status': status})
            status_counts[status] = count
        
        return jsonify({
            'bookings_by_month': bookings_by_month,
            'popular_cars': popular_cars,
            'top_clients': top_clients,
            'status_distribution': status_counts,
            'year': year
        }), 200
        
    except Exception as e:
        print(f"Error getting reservation analytics: {str(e)}")
        return jsonify({'message': f'Error getting reservation analytics: {str(e)}'}), 500

@analytics_bp.route('/financial', methods=['GET'])
@manager_required
def get_financial_reports(user_id):
    """Get financial reports"""
    try:
        # Get date range parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        period = request.args.get('period', 'monthly')  # daily, weekly, monthly
        
        if start_date_str:
            start_date = datetime.fromisoformat(start_date_str)
        else:
            # Default to start of current year
            start_date = datetime(datetime.now().year, 1, 1)
            
        if end_date_str:
            end_date = datetime.fromisoformat(end_date_str)
        else:
            # Default to current date
            end_date = datetime.now()
        
        # Revenue by period (daily, weekly, monthly)
        revenue_data = []
        
        if period == 'daily':
            # Group by day
            current_date = start_date
            while current_date <= end_date:
                next_date = current_date + timedelta(days=1)
                
                revenue = sum(res['total_amount'] for res in current_app.db.reservations.find({
                    'status': 'completed',
                    'end_date': {'$gte': current_date, '$lt': next_date}
                }))
                
                revenue_data.append({
                    'period': current_date.strftime('%Y-%m-%d'),
                    'revenue': revenue
                })
                
                current_date = next_date
                
        elif period == 'weekly':
            # Group by week
            current_date = start_date
            while current_date <= end_date:
                # Calculate start of week (Monday)
                week_start = current_date - timedelta(days=current_date.weekday())
                week_end = week_start + timedelta(days=7)
                
                revenue = sum(res['total_amount'] for res in current_app.db.reservations.find({
                    'status': 'completed',
                    'end_date': {'$gte': week_start, '$lt': week_end}
                }))
                
                revenue_data.append({
                    'period': f"{week_start.strftime('%Y-%m-%d')} to {(week_end - timedelta(days=1)).strftime('%Y-%m-%d')}",
                    'revenue': revenue
                })
                
                current_date = week_end
                
        else:  # monthly
            # Group by month
            current_month = datetime(start_date.year, start_date.month, 1)
            while current_month <= end_date:
                if current_month.month == 12:
                    next_month = datetime(current_month.year + 1, 1, 1)
                else:
                    next_month = datetime(current_month.year, current_month.month + 1, 1)
                
                revenue = sum(res['total_amount'] for res in current_app.db.reservations.find({
                    'status': 'completed',
                    'end_date': {'$gte': current_month, '$lt': next_month}
                }))
                
                revenue_data.append({
                    'period': current_month.strftime('%Y-%m'),
                    'revenue': revenue
                })
                
                current_month = next_month
        
        # Outstanding payments (unpaid or partially paid reservations)
        outstanding_payments = []
        unpaid_reservations = list(current_app.db.reservations.find({
            'payment_status': {'$in': ['unpaid', 'partial']},
            'status': {'$in': ['confirmed', 'active', 'completed']}
        }))
        
        for res in unpaid_reservations:
            client = current_app.db.clients.find_one({'_id': res['client_id']})
            client_name = client['full_name'] if client else "Unknown"
            
            car = current_app.db.cars.find_one({'_id': res['car_id']})
            car_info = f"{car['brand']} {car['model']}" if car else "Unknown"
            
            outstanding_payments.append({
                'reservation_id': res['_id'],
                'client_name': client_name,
                'car_info': car_info,
                'total_amount': res['total_amount'],
                'payment_status': res['payment_status'],
                'status': res['status'],
                'start_date': res['start_date'].isoformat() if isinstance(res['start_date'], datetime) else res['start_date'],
                'end_date': res['end_date'].isoformat() if isinstance(res['end_date'], datetime) else res['end_date']
            })
        
        # Deposit summary
        deposit_pipeline = [
            {
                '$match': {
                    'deposit_amount': {'$gt': 0}
                }
            },
            {
                '$group': {
                    '_id': '$status',
                    'total_deposits': {'$sum': '$deposit_amount'},
                    'count': {'$sum': 1}
                }
            }
        ]
        
        deposit_summary = list(current_app.db.reservations.aggregate(deposit_pipeline))
        
        # Format deposit summary
        formatted_deposit_summary = {}
        for item in deposit_summary:
            formatted_deposit_summary[item['_id']] = {
                'total_deposits': item['total_deposits'],
                'count': item['count']
            }
        
        return jsonify({
            'revenue_by_period': revenue_data,
            'outstanding_payments': outstanding_payments,
            'deposit_summary': formatted_deposit_summary,
            'period_type': period,
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        }), 200
        
    except Exception as e:
        print(f"Error getting financial reports: {str(e)}")
        return jsonify({'message': f'Error getting financial reports: {str(e)}'}), 500

@analytics_bp.route('/cars/utilization', methods=['GET'])
@manager_required
def get_car_utilization(user_id):
    """Get car utilization reports"""
    try:
        # Get date range parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        if start_date_str:
            start_date = datetime.fromisoformat(start_date_str)
        else:
            # Default to 30 days ago
            start_date = datetime.now() - timedelta(days=30)
            
        if end_date_str:
            end_date = datetime.fromisoformat(end_date_str)
        else:
            # Default to current date
            end_date = datetime.now()
        
        # Get all cars
        cars = list(current_app.db.cars.find())
        
        # Calculate utilization for each car
        car_utilization = []
        
        for car in cars:
            # Get completed and active reservations for this car in the date range
            reservations = list(current_app.db.reservations.find({
                'car_id': car['_id'],
                'status': {'$in': ['completed', 'active']},
                '$or': [
                    {'start_date': {'$lte': end_date, '$gte': start_date}},
                    {'end_date': {'$lte': end_date, '$gte': start_date}},
                    {'start_date': {'$lte': start_date}, 'end_date': {'$gte': end_date}}
                ]
            }))
            
            # Calculate total days rented
            total_days_rented = 0
            total_revenue = 0
            
            for res in reservations:
                res_start = res['start_date'] if isinstance(res['start_date'], datetime) else datetime.fromisoformat(res['start_date'])
                res_end = res['end_date'] if isinstance(res['end_date'], datetime) else datetime.fromisoformat(res['end_date'])
                
                # Adjust dates to be within the selected range
                effective_start = max(res_start, start_date)
                effective_end = min(res_end, end_date)
                
                # Calculate days in the selected range
                days_in_range = (effective_end - effective_start).days + 1
                total_days_rented += max(0, days_in_range)
                
                # Add to revenue
                if res['status'] == 'completed':
                    total_revenue += res['total_amount']
            
            # Calculate total days in range
            total_days_in_range = (end_date - start_date).days + 1
            
            # Calculate utilization percentage
            utilization_percentage = (total_days_rented / total_days_in_range) * 100 if total_days_in_range > 0 else 0
            
            car_utilization.append({
                'car_id': car['_id'],
                'brand': car['brand'],
                'model': car['model'],
                'year': car['year'],
                'license_plate': car['license_plate'],
                'days_rented': total_days_rented,
                'utilization_percentage': round(utilization_percentage, 2),
                'revenue': total_revenue,
                'current_status': car['availability_status']
            })
        
        # Sort by utilization percentage (descending)
        car_utilization.sort(key=lambda x: x['utilization_percentage'], reverse=True)
        
        # Calculate fleet-wide statistics
        total_fleet_days = len(cars) * ((end_date - start_date).days + 1)
        total_rented_days = sum(car['days_rented'] for car in car_utilization)
        fleet_utilization = (total_rented_days / total_fleet_days) * 100 if total_fleet_days > 0 else 0
        
        return jsonify({
            'car_utilization': car_utilization,
            'fleet_statistics': {
                'total_cars': len(cars),
                'fleet_utilization_percentage': round(fleet_utilization, 2),
                'total_revenue': sum(car['revenue'] for car in car_utilization)
            },
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        }), 200
        
    except Exception as e:
        print(f"Error getting car utilization: {str(e)}")
        return jsonify({'message': f'Error getting car utilization: {str(e)}'}), 500

@analytics_bp.route('/clients/activity', methods=['GET'])
@manager_required
def get_client_activity(user_id):
    """Get client activity reports"""
    try:
        # Get date range parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        if start_date_str:
            start_date = datetime.fromisoformat(start_date_str)
        else:
            # Default to start of current year
            start_date = datetime(datetime.now().year, 1, 1)
            
        if end_date_str:
            end_date = datetime.fromisoformat(end_date_str)
        else:
            # Default to current date
            end_date = datetime.now()
        
        # Get all clients
        clients = list(current_app.db.clients.find())
        
        # Calculate activity for each client
        client_activity = []
        
        for client in clients:
            # Get reservations for this client in the date range
            reservations = list(current_app.db.reservations.find({
                'client_id': client['_id'],
                'created_at': {'$gte': start_date, '$lte': end_date}
            }))
            
            if not reservations:
                continue  # Skip clients with no activity in the period
            
            # Calculate statistics
            total_reservations = len(reservations)
            completed_reservations = sum(1 for res in reservations if res['status'] == 'completed')
            cancelled_reservations = sum(1 for res in reservations if res['status'] == 'cancelled')
            total_spent = sum(res['total_amount'] for res in reservations if res['status'] == 'completed')
            
            # Get most recent reservation
            most_recent = max(reservations, key=lambda x: x['created_at'])
            
            client_activity.append({
                'client_id': client['_id'],
                'name': client['full_name'],
                'email': client['email'],
                'phone': client['phone'],
                'total_reservations': total_reservations,
                'completed_reservations': completed_reservations,
                'cancelled_reservations': cancelled_reservations,
                'total_spent': total_spent,
                'last_activity': most_recent['created_at'].isoformat(),
                'preferred_cars': get_preferred_cars(reservations)
            })
        
        # Sort by total reservations (descending)
        client_activity.sort(key=lambda x: x['total_reservations'], reverse=True)
        
        # Calculate new vs returning clients
        new_clients = sum(1 for client in clients if 
                         client.get('created_at') and 
                         client['created_at'] >= start_date and 
                         client['created_at'] <= end_date)
        
        return jsonify({
            'client_activity': client_activity,
            'summary': {
                'total_active_clients': len(client_activity),
                'new_clients': new_clients,
                'total_revenue': sum(client['total_spent'] for client in client_activity)
            },
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        }), 200
        
    except Exception as e:
        print(f"Error getting client activity: {str(e)}")
        return jsonify({'message': f'Error getting client activity: {str(e)}'}), 500

@analytics_bp.route('/upcoming', methods=['GET'])
@manager_required
def get_upcoming_events(user_id):
    """Get upcoming reservations and returns"""
    try:
        # Get date parameter (default to today)
        date_str = request.args.get('date')
        days_ahead = int(request.args.get('days_ahead', 7))
        
        if date_str:
            start_date = datetime.fromisoformat(date_str)
        else:
            start_date = datetime.now()
        
        end_date = start_date + timedelta(days=days_ahead)
        
        # Get upcoming pickups (reservations starting in the date range)
        upcoming_pickups = list(current_app.db.reservations.find({
            'start_date': {'$gte': start_date, '$lte': end_date},
            'status': {'$in': ['pending', 'confirmed']}
        }).sort('start_date', 1))
        
        formatted_pickups = []
        for res in upcoming_pickups:
            client = current_app.db.clients.find_one({'_id': res['client_id']})
            client_name = client['full_name'] if client else "Unknown"
            
            car = current_app.db.cars.find_one({'_id': res['car_id']})
            car_info = f"{car['brand']} {car['model']}" if car else "Unknown"
            
            formatted_pickups.append({
                'reservation_id': res['_id'],
                'client_name': client_name,
                'client_id': res['client_id'],
                'car_info': car_info,
                'car_id': res['car_id'],
                'start_date': res['start_date'].isoformat() if isinstance(res['start_date'], datetime) else res['start_date'],
                'status': res['status'],
                'pickup_location': res.get('pickup_location', 'Not specified')
            })
        
        # Get upcoming returns (active reservations ending in the date range)
        upcoming_returns = list(current_app.db.reservations.find({
            'end_date': {'$gte': start_date, '$lte': end_date},
            'status': 'active'
        }).sort('end_date', 1))
        
        formatted_returns = []
        for res in upcoming_returns:
            client = current_app.db.clients.find_one({'_id': res['client_id']})
            client_name = client['full_name'] if client else "Unknown"
            
            car = current_app.db.cars.find_one({'_id': res['car_id']})
            car_info = f"{car['brand']} {car['model']}" if car else "Unknown"
            
            formatted_returns.append({
                'reservation_id': res['_id'],
                'client_name': client_name,
                'client_id': res['client_id'],
                'car_info': car_info,
                'car_id': res['car_id'],
                'end_date': res['end_date'].isoformat() if isinstance(res['end_date'], datetime) else res['end_date'],
                'return_location': res.get('return_location', 'Not specified'),
                'total_amount': res['total_amount'],
                'payment_status': res['payment_status']
            })
        
        # Get overdue returns (active reservations with end_date in the past)
        overdue_returns = list(current_app.db.reservations.find({
            'end_date': {'$lt': start_date},
            'status': 'active'
        }).sort('end_date', 1))
        
        formatted_overdue = []
        for res in overdue_returns:
            client = current_app.db.clients.find_one({'_id': res['client_id']})
            client_name = client['full_name'] if client else "Unknown"
            
            car = current_app.db.cars.find_one({'_id': res['car_id']})
            car_info = f"{car['brand']} {car['model']}" if car else "Unknown"
            
            end_date_obj = res['end_date'] if isinstance(res['end_date'], datetime) else datetime.fromisoformat(res['end_date'])
            days_overdue = (datetime.now() - end_date_obj).days
            
            formatted_overdue.append({
                'reservation_id': res['_id'],
                'client_name': client_name,
                'client_id': res['client_id'],
                'car_info': car_info,
                'car_id': res['car_id'],
                'end_date': res['end_date'].isoformat() if isinstance(res['end_date'], datetime) else res['end_date'],
                'days_overdue': days_overdue,
                'return_location': res.get('return_location', 'Not specified'),
                'total_amount': res['total_amount'],
                'payment_status': res['payment_status']
            })
        
        return jsonify({
            'upcoming_pickups': formatted_pickups,
            'upcoming_returns': formatted_returns,
            'overdue_returns': formatted_overdue,
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        }), 200
        
    except Exception as e:
        print(f"Error getting upcoming events: {str(e)}")
        return jsonify({'message': f'Error getting upcoming events: {str(e)}'}), 500

# Helper function to get preferred cars for a client
def get_preferred_cars(reservations):
    car_counts = {}
    
    for res in reservations:
        car_id = res['car_id']
        if car_id in car_counts:
            car_counts[car_id] += 1
        else:
            car_counts[car_id] = 1
    
    # Get top 3 cars
    top_cars = sorted(car_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    
    result = []
    for car_id, count in top_cars:
        car = current_app.db.cars.find_one({'_id': car_id})
        if car:
            result.append({
                'car_id': car_id,
                'brand': car['brand'],
                'model': car['model'],
                'count': count
            })
    
    return result 