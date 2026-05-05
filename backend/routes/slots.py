from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, TimeSlot, Service, Reservation
from utils.pricing import calculate_price
from utils.decorators import admin_required
from datetime import date, timedelta

slots_bp = Blueprint('slots', __name__)


def _slot_occupancy(slot):
    same_day = TimeSlot.query.filter_by(service_id=slot.service_id, date=slot.date).all()
    if not same_day:
        return 0.0
    reserved = Reservation.query.filter(
        Reservation.slot_id.in_([s.id for s in same_day]),
        Reservation.status != 'cancelled'
    ).count()
    return reserved / len(same_day)


@slots_bp.route('/', methods=['GET'])
def get_slots():
    service_id = request.args.get('service_id', type=int)
    date_str = request.args.get('date')
    available_only = request.args.get('available', 'false').lower() == 'true'

    query = TimeSlot.query.filter(TimeSlot.date >= date.today())

    if service_id:
        query = query.filter_by(service_id=service_id)

    if date_str:
        try:
            filter_date = date.fromisoformat(date_str)
            query = query.filter_by(date=filter_date)
        except ValueError:
            return jsonify({'error': 'Format de date invalide (YYYY-MM-DD)'}), 400

    if available_only:
        query = query.filter_by(is_available=True)

    slots = query.order_by(TimeSlot.date, TimeSlot.start_time).all()

    result = []
    for slot in slots:
        s = slot.to_dict()
        occ = _slot_occupancy(slot)
        p = calculate_price(slot.service.base_price, slot.date, occ)
        s['dynamic_price'] = p['price']
        s['price_multiplier'] = p['multiplier']
        s['is_discounted'] = p['is_discounted']
        s['is_peak'] = p['is_peak']
        result.append(s)

    return jsonify(result), 200


@slots_bp.route('/<int:slot_id>', methods=['GET'])
def get_slot(slot_id):
    slot = TimeSlot.query.get_or_404(slot_id)
    s = slot.to_dict()
    occ = _slot_occupancy(slot)
    p = calculate_price(slot.service.base_price, slot.date, occ)
    s['dynamic_price'] = p['price']
    s['price_info'] = p
    return jsonify(s), 200


@slots_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_slot():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Aucune donnée fournie'}), 400

    for field in ['service_id', 'date', 'start_time', 'end_time']:
        if field not in data:
            return jsonify({'error': f'{field} est requis'}), 400

    if not Service.query.get(data['service_id']):
        return jsonify({'error': 'Service introuvable'}), 404

    try:
        slot_date = date.fromisoformat(data['date'])
    except ValueError:
        return jsonify({'error': 'Format de date invalide'}), 400

    slot = TimeSlot(
        service_id=data['service_id'],
        date=slot_date,
        start_time=data['start_time'],
        end_time=data['end_time'],
        is_available=data.get('is_available', True)
    )
    db.session.add(slot)
    db.session.commit()
    return jsonify(slot.to_dict()), 201


@slots_bp.route('/generate', methods=['POST'])
@jwt_required()
@admin_required
def generate_slots():
    """Génère des créneaux en masse pour une plage de dates."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Aucune donnée fournie'}), 400

    for field in ['service_id', 'start_date', 'end_date', 'time_slots']:
        if field not in data:
            return jsonify({'error': f'{field} est requis'}), 400

    if not Service.query.get(data['service_id']):
        return jsonify({'error': 'Service introuvable'}), 404

    try:
        start = date.fromisoformat(data['start_date'])
        end = date.fromisoformat(data['end_date'])
    except ValueError:
        return jsonify({'error': 'Format de date invalide'}), 400

    if end < start:
        return jsonify({'error': 'La date de fin doit être postérieure à la date de début'}), 400

    if (end - start).days > 90:
        return jsonify({'error': 'La plage de dates ne peut pas dépasser 90 jours'}), 400

    created = 0
    current = start
    while current <= end:
        if data.get('skip_weekends') and current.weekday() >= 5:
            current += timedelta(days=1)
            continue

        for ts in data['time_slots']:
            existing = TimeSlot.query.filter_by(
                service_id=data['service_id'],
                date=current,
                start_time=ts['start'],
                end_time=ts['end']
            ).first()
            if not existing:
                slot = TimeSlot(
                    service_id=data['service_id'],
                    date=current,
                    start_time=ts['start'],
                    end_time=ts['end']
                )
                db.session.add(slot)
                created += 1

        current += timedelta(days=1)

    db.session.commit()
    return jsonify({'message': f'{created} créneaux créés', 'count': created}), 201


@slots_bp.route('/<int:slot_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_slot(slot_id):
    slot = TimeSlot.query.get_or_404(slot_id)
    data = request.get_json()

    if 'is_available' in data:
        slot.is_available = data['is_available']
    if 'start_time' in data:
        slot.start_time = data['start_time']
    if 'end_time' in data:
        slot.end_time = data['end_time']

    db.session.commit()
    return jsonify(slot.to_dict()), 200


@slots_bp.route('/<int:slot_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_slot(slot_id):
    slot = TimeSlot.query.get_or_404(slot_id)

    active = Reservation.query.filter_by(slot_id=slot_id).filter(
        Reservation.status != 'cancelled'
    ).first()
    if active:
        return jsonify({'error': 'Impossible de supprimer un créneau avec une réservation active'}), 409

    db.session.delete(slot)
    db.session.commit()
    return jsonify({'message': 'Créneau supprimé'}), 200
