from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import Reservation, Service, TimeSlot, User


search_bp = Blueprint('search', __name__)


@search_bp.route('/advanced', methods=['GET'])
@jwt_required(optional=True)
def advanced_search():
    q = (request.args.get('q') or '').strip().lower()
    entity = request.args.get('entity', 'all')
    service_id = request.args.get('service_id', type=int)
    status = request.args.get('status')
    available = request.args.get('available')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)

    result = {}

    if entity in ('all', 'services'):
        services = Service.query.filter_by(is_active=True).all()
        if q:
            services = [
                s for s in services
                if q in s.name.lower() or q in (s.description or '').lower()
            ]
        if min_price is not None:
            services = [s for s in services if s.base_price >= min_price]
        if max_price is not None:
            services = [s for s in services if s.base_price <= max_price]
        result['services'] = [s.to_dict() for s in services]

    if entity in ('all', 'slots'):
        query = TimeSlot.query.filter(TimeSlot.date >= date.today())
        if service_id:
            query = query.filter_by(service_id=service_id)
        if available in ('true', 'false'):
            query = query.filter_by(is_available=(available == 'true'))
        if date_from:
            query = query.filter(TimeSlot.date >= date.fromisoformat(date_from))
        if date_to:
            query = query.filter(TimeSlot.date <= date.fromisoformat(date_to))
        slots = query.order_by(TimeSlot.date, TimeSlot.start_time).limit(150).all()
        if q:
            slots = [s for s in slots if q in (s.service.name if s.service else '').lower()]
        result['slots'] = [s.to_dict() for s in slots]

    if entity in ('all', 'reservations'):
        current_user_id = get_jwt_identity()
        reservations = []
        if current_user_id:
            user = User.query.get(int(current_user_id))
            query = Reservation.query
            if user and user.role != 'admin':
                query = query.filter_by(client_id=user.id)
            if status and status != 'all':
                query = query.filter_by(status=status)
            if service_id or date_from or date_to:
                query = query.join(TimeSlot)
                if service_id:
                    query = query.filter(TimeSlot.service_id == service_id)
                if date_from:
                    query = query.filter(TimeSlot.date >= date.fromisoformat(date_from))
                if date_to:
                    query = query.filter(TimeSlot.date <= date.fromisoformat(date_to))
            if min_price is not None:
                query = query.filter(Reservation.price >= min_price)
            if max_price is not None:
                query = query.filter(Reservation.price <= max_price)
            reservations = query.order_by(Reservation.created_at.desc()).limit(200).all()
            if q:
                reservations = [
                    r for r in reservations
                    if q in str(r.id)
                    or q in (r.client.username or '').lower()
                    or q in (r.client.email or '').lower()
                    or q in (r.slot.service.name if r.slot and r.slot.service else '').lower()
                    or q in (r.slot.date.isoformat() if r.slot and r.slot.date else '')
                    or q in (r.slot.start_time if r.slot else '')
                    or q in (r.slot.end_time if r.slot else '')
                ]
        result['reservations'] = [r.to_dict() for r in reservations]

    return jsonify(result), 200
