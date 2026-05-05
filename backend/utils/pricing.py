from datetime import date


def calculate_price(base_price, slot_date, occupancy_rate):
    """
    Calcule le prix dynamique basé sur :
    - Type de jour (semaine / week-end)
    - Taux d'occupation (demande)
    - Période de l'année (haute/basse saison)
    """
    if isinstance(slot_date, str):
        slot_date = date.fromisoformat(slot_date)

    multiplier = 1.0
    reasons = []

    # Ajustement week-end
    day_of_week = slot_date.weekday()  # 0=Lundi, 6=Dimanche
    if day_of_week >= 5:
        multiplier += 0.20
        reasons.append('Week-end (+20%)')

    # Ajustement selon la demande (taux d'occupation)
    if occupancy_rate >= 0.80:
        multiplier += 0.30
        reasons.append('Très forte demande (+30%)')
    elif occupancy_rate >= 0.60:
        multiplier += 0.15
        reasons.append('Forte demande (+15%)')
    elif occupancy_rate <= 0.20:
        multiplier -= 0.15
        reasons.append('Faible demande (-15%)')

    # Haute saison (Juillet, Août, Décembre)
    if slot_date.month in [7, 8, 12]:
        multiplier += 0.10
        reasons.append('Haute saison (+10%)')

    # Garantir un minimum de 70% du prix de base
    if multiplier < 0.70:
        multiplier = 0.70

    final_price = round(base_price * multiplier, 2)

    return {
        'price': final_price,
        'base_price': base_price,
        'multiplier': round(multiplier, 2),
        'is_discounted': multiplier < 1.0,
        'is_peak': multiplier >= 1.30,
        'reasons': reasons
    }


def get_price_label(multiplier):
    if multiplier >= 1.30:
        return 'Période de forte demande'
    elif multiplier >= 1.10:
        return 'Demande élevée'
    elif multiplier < 1.0:
        return 'Offre spéciale'
    return 'Prix normal'
