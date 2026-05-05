from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import db, User, Reservation, TimeSlot
from utils.forecasting import get_demand_forecast
from utils.decorators import admin_required
from datetime import date, timedelta
from collections import defaultdict

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_stats():
    total_res = Reservation.query.count()
    confirmed = Reservation.query.filter_by(status='confirmed').count()
    cancelled = Reservation.query.filter_by(status='cancelled').count()

    total_slots = TimeSlot.query.count()
    available_slots = TimeSlot.query.filter_by(is_available=True).filter(
        TimeSlot.date >= date.today()
    ).count()

    total_revenue = db.session.query(db.func.sum(Reservation.price)).filter_by(
        status='confirmed'
    ).scalar() or 0.0

    total_clients = User.query.filter_by(role='client').count()

    # Stats de la semaine courante
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_res = Reservation.query.join(TimeSlot).filter(
        TimeSlot.date >= week_start,
        Reservation.status == 'confirmed'
    ).count()

    occupancy_rate = 0.0
    if total_slots > 0:
        occupancy_rate = round(confirmed / total_slots * 100, 1)

    return jsonify({
        'total_reservations': total_res,
        'confirmed_reservations': confirmed,
        'cancelled_reservations': cancelled,
        'total_slots': total_slots,
        'available_slots': available_slots,
        'total_revenue': round(total_revenue, 2),
        'total_clients': total_clients,
        'week_reservations': week_res,
        'occupancy_rate': occupancy_rate
    }), 200


@dashboard_bp.route('/revenue-chart', methods=['GET'])
@jwt_required()
@admin_required
def get_revenue_chart():
    """Revenus et réservations par mois (6 derniers mois)."""
    today = date.today()
    monthly_data = []

    for i in range(5, -1, -1):
        month = today.month - i
        year = today.year
        while month <= 0:
            month += 12
            year -= 1

        start = date(year, month, 1)
        if month == 12:
            end = date(year + 1, 1, 1)
        else:
            end = date(year, month + 1, 1)

        revenue = db.session.query(db.func.sum(Reservation.price)).join(TimeSlot).filter(
            TimeSlot.date >= start,
            TimeSlot.date < end,
            Reservation.status == 'confirmed'
        ).scalar() or 0.0

        count = Reservation.query.join(TimeSlot).filter(
            TimeSlot.date >= start,
            TimeSlot.date < end,
            Reservation.status == 'confirmed'
        ).count()

        month_names = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
                       'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

        monthly_data.append({
            'month': f"{year}-{month:02d}",
            'month_name': month_names[month - 1],
            'revenue': round(revenue, 2),
            'count': count
        })

    return jsonify(monthly_data), 200


@dashboard_bp.route('/occupancy-chart', methods=['GET'])
@jwt_required()
@admin_required
def get_occupancy_chart():
    """Taux d'occupation par jour de la semaine."""
    dow_names = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    dow_data = defaultdict(lambda: {'total': 0, 'reserved': 0})

    slots = TimeSlot.query.all()
    reserved_ids = {
        r.slot_id for r in Reservation.query.filter(
            Reservation.status != 'cancelled'
        ).all()
    }

    for slot in slots:
        dow = slot.date.weekday()
        dow_data[dow]['total'] += 1
        if slot.id in reserved_ids:
            dow_data[dow]['reserved'] += 1

    result = []
    for i in range(7):
        total = dow_data[i]['total']
        reserved = dow_data[i]['reserved']
        rate = round(reserved / max(1, total) * 100, 1)
        result.append({
            'day': dow_names[i],
            'occupancy': rate,
            'total': total,
            'reserved': reserved
        })

    return jsonify(result), 200


@dashboard_bp.route('/status-chart', methods=['GET'])
@jwt_required()
@admin_required
def get_status_chart():
    """Répartition des réservations par statut."""
    confirmed = Reservation.query.filter_by(status='confirmed').count()
    cancelled = Reservation.query.filter_by(status='cancelled').count()
    pending = Reservation.query.filter_by(status='pending').count()

    return jsonify([
        {'name': 'Confirmées', 'value': confirmed},
        {'name': 'Annulées', 'value': cancelled},
        {'name': 'En attente', 'value': pending}
    ]), 200


@dashboard_bp.route('/forecast', methods=['GET'])
@jwt_required()
@admin_required
def get_forecast():
    reservations = Reservation.query.all()
    forecast = get_demand_forecast(reservations, days_ahead=14)
    return jsonify(forecast), 200


@dashboard_bp.route('/recent-reservations', methods=['GET'])
@jwt_required()
@admin_required
def get_recent_reservations():
    reservations = Reservation.query.order_by(
        Reservation.created_at.desc()
    ).limit(10).all()
    return jsonify([r.to_dict() for r in reservations]), 200
