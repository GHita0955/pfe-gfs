from flask import Blueprint, request, jsonify, Response, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Reservation, TimeSlot, generate_qr_token
from utils.pricing import calculate_price
from utils.decorators import admin_required
from utils.qr import build_reservation_qr_svg
from utils.pdf import build_simple_pdf, reservation_receipt_lines
from datetime import date
from io import BytesIO

reservations_bp = Blueprint('reservations', __name__)


def _get_occupancy(slot):
    """Calcule le taux d'occupation pour le service/jour du créneau donné."""
    same_day_slots = TimeSlot.query.filter_by(
        service_id=slot.service_id,
        date=slot.date
    ).all()

    if not same_day_slots:
        return 0.0

    reserved_ids = {
        r.slot_id for r in Reservation.query.filter(
            Reservation.slot_id.in_([s.id for s in same_day_slots]),
            Reservation.status != 'cancelled'
        ).all()
    }
    return len(reserved_ids) / len(same_day_slots)


@reservations_bp.route('/', methods=['GET'])
@jwt_required()
def get_reservations():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    query = Reservation.query
    if user.role != 'admin':
        query = query.filter_by(client_id=user_id)

    status = request.args.get('status')
    service_id = request.args.get('service_id', type=int)
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    search = (request.args.get('q') or '').strip().lower()

    if status and status != 'all':
        query = query.filter(Reservation.status == status)
    if service_id or date_from or date_to:
        query = query.join(TimeSlot)
        if service_id:
            query = query.filter(TimeSlot.service_id == service_id)
        if date_from:
            query = query.filter(TimeSlot.date >= date.fromisoformat(date_from))
        if date_to:
            query = query.filter(TimeSlot.date <= date.fromisoformat(date_to))

    reservations = query.order_by(Reservation.created_at.desc()).all()
    if search:
        reservations = [
            r for r in reservations
            if search in (r.client.username or '').lower()
            or search in (r.client.email or '').lower()
            or search in (r.slot.service.name if r.slot and r.slot.service else '').lower()
            or search in (r.slot.date.isoformat() if r.slot and r.slot.date else '')
            or search in (r.slot.start_time if r.slot else '')
            or search in (r.slot.end_time if r.slot else '')
            or search in str(r.id)
        ]

    return jsonify([r.to_dict() for r in reservations]), 200


@reservations_bp.route('/<int:res_id>', methods=['GET'])
@jwt_required()
def get_reservation(res_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    reservation = Reservation.query.get_or_404(res_id)

    if user.role != 'admin' and reservation.client_id != user_id:
        return jsonify({'error': 'Accès non autorisé'}), 403

    return jsonify(reservation.to_dict()), 200


@reservations_bp.route('/', methods=['POST'])
@jwt_required()
def create_reservation():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Aucune donnée fournie'}), 400

    slot_id = data.get('slot_id')
    notes = data.get('notes', '')

    if not slot_id:
        return jsonify({'error': 'ID du créneau requis'}), 400

    slot = TimeSlot.query.get(slot_id)
    if not slot:
        return jsonify({'error': 'Créneau introuvable'}), 404

    if not slot.is_available:
        return jsonify({'error': 'Ce créneau n\'est plus disponible'}), 409

    if slot.date < date.today():
        return jsonify({'error': 'Impossible de réserver un créneau passé'}), 400

    # Vérifier qu'il n'existe pas déjà une réservation active sur ce créneau
    existing = Reservation.query.filter_by(slot_id=slot_id).filter(
        Reservation.status != 'cancelled'
    ).first()
    if existing:
        return jsonify({'error': 'Ce créneau est déjà réservé'}), 409

    occupancy = _get_occupancy(slot)
    price_info = calculate_price(slot.service.base_price, slot.date, occupancy)

    reservation = Reservation(
        client_id=user_id,
        slot_id=slot_id,
        price=price_info['price'],
        notes=notes,
        status='confirmed',
        qr_token=generate_qr_token()
    )
    slot.is_available = False

    db.session.add(reservation)
    db.session.commit()

    result = reservation.to_dict()
    result['price_info'] = price_info
    return jsonify(result), 201


@reservations_bp.route('/<int:res_id>/qr', methods=['GET'])
@jwt_required()
def reservation_qr(res_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    reservation = Reservation.query.get_or_404(res_id)

    if user.role != 'admin' and reservation.client_id != user_id:
        return jsonify({'error': 'AccÃ¨s non autorisÃ©'}), 403

    if not reservation.qr_token:
        reservation.qr_token = generate_qr_token()
        db.session.commit()

    return Response(build_reservation_qr_svg(reservation), mimetype='image/svg+xml')


@reservations_bp.route('/<int:res_id>/receipt.pdf', methods=['GET'])
@jwt_required()
def reservation_receipt(res_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    reservation = Reservation.query.get_or_404(res_id)

    if user.role != 'admin' and reservation.client_id != user_id:
        return jsonify({'error': 'AccÃ¨s non autorisÃ©'}), 403

    pdf = build_simple_pdf(f"Recu reservation #{reservation.id}", reservation_receipt_lines(reservation))
    return send_file(
        BytesIO(pdf),
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"recu-reservation-{reservation.id}.pdf"
    )


@reservations_bp.route('/<int:res_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_reservation(res_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    reservation = Reservation.query.get_or_404(res_id)

    if user.role != 'admin' and reservation.client_id != user_id:
        return jsonify({'error': 'Accès non autorisé'}), 403

    if reservation.status == 'cancelled':
        return jsonify({'error': 'Cette réservation est déjà annulée'}), 400

    reservation.status = 'cancelled'
    if reservation.slot:
        reservation.slot.is_available = True

    db.session.commit()
    return jsonify(reservation.to_dict()), 200


@reservations_bp.route('/<int:res_id>', methods=['PUT'])
@jwt_required()
def update_reservation(res_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    reservation = Reservation.query.get_or_404(res_id)

    if user.role != 'admin' and reservation.client_id != user_id:
        return jsonify({'error': 'Accès non autorisé'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Aucune donnée fournie'}), 400

    if 'notes' in data:
        reservation.notes = data['notes']

    if 'status' in data and user.role == 'admin':
        reservation.status = data['status']
        # Si annulation, libérer le créneau
        if data['status'] == 'cancelled' and reservation.slot:
            reservation.slot.is_available = True

    # Changement de créneau
    if 'slot_id' in data and data['slot_id'] != reservation.slot_id:
        new_slot = TimeSlot.query.get(data['slot_id'])
        if not new_slot:
            return jsonify({'error': 'Nouveau créneau introuvable'}), 404
        if not new_slot.is_available:
            return jsonify({'error': 'Le nouveau créneau n\'est pas disponible'}), 409

        # Libérer l'ancien créneau
        if reservation.slot:
            reservation.slot.is_available = True

        # Réserver le nouveau créneau
        new_slot.is_available = False

        occupancy = _get_occupancy(new_slot)
        price_info = calculate_price(new_slot.service.base_price, new_slot.date, occupancy)
        reservation.price = price_info['price']
        reservation.slot_id = new_slot.id

    db.session.commit()
    return jsonify(reservation.to_dict()), 200
