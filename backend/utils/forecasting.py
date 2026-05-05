from collections import defaultdict
from datetime import date, timedelta


def get_demand_forecast(reservations, days_ahead=14):
    """
    Prévision simple basée sur les données historiques.
    Retourne un score de demande pour chaque jour des N prochains jours.
    """
    # Comptage par jour de la semaine
    dow_counts = defaultdict(int)
    total = 0

    for r in reservations:
        if r.slot and r.status != 'cancelled':
            dow = r.slot.date.weekday()
            dow_counts[dow] += 1
            total += 1

    # Normaliser par rapport au total
    avg_by_dow = {}
    for dow in range(7):
        avg_by_dow[dow] = (dow_counts.get(dow, 0) / max(1, total)) * 7

    # Générer la prévision
    forecast = []
    today = date.today()
    day_names_fr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

    for i in range(days_ahead):
        future_date = today + timedelta(days=i)
        dow = future_date.weekday()
        score = avg_by_dow.get(dow, 0)

        if score > 0.20:
            level = 'high'
        elif score > 0.10:
            level = 'medium'
        else:
            level = 'low'

        forecast.append({
            'date': future_date.isoformat(),
            'day_name': day_names_fr[dow],
            'demand_score': round(score, 3),
            'level': level
        })

    return forecast


def get_occupancy_rate(slots, reservations, target_date=None):
    """
    Calcule le taux d'occupation pour une date ou globalement.
    """
    if target_date:
        relevant_slots = [s for s in slots if s.date == target_date]
    else:
        relevant_slots = slots

    if not relevant_slots:
        return 0.0

    reserved_ids = {r.slot_id for r in reservations if r.status != 'cancelled'}
    reserved_count = sum(1 for s in relevant_slots if s.id in reserved_ids)

    return reserved_count / len(relevant_slots)


def get_monthly_stats(reservations):
    """
    Statistiques mensuelles des réservations.
    """
    monthly = defaultdict(lambda: {'count': 0, 'revenue': 0.0})

    for r in reservations:
        if r.slot and r.status == 'confirmed':
            key = r.slot.date.strftime('%Y-%m')
            monthly[key]['count'] += 1
            monthly[key]['revenue'] += r.price

    return dict(monthly)
