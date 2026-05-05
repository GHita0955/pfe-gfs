"""
Script d'initialisation de la base de données avec des données de démonstration.
Exécuter depuis le dossier backend/ : python init_db.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import app
from models import db, User, Service, TimeSlot, Reservation
from utils.pricing import calculate_price
from datetime import date, timedelta
import random

with app.app_context():
    # Réinitialiser la base
    db.drop_all()
    db.create_all()

    # ── Utilisateurs ────────────────────────────────────────────
    admin = User(username='admin', email='admin@reserv.com', role='admin')
    admin.set_password('admin123')
    db.session.add(admin)

    clients = []
    client_data = [
        ('alice', 'alice@mail.com'),
        ('bob', 'bob@mail.com'),
        ('carol', 'carol@mail.com'),
        ('david', 'david@mail.com'),
    ]
    for uname, email in client_data:
        c = User(username=uname, email=email, role='client')
        c.set_password('client123')
        db.session.add(c)
        clients.append(c)

    db.session.flush()

    # ── Services ─────────────────────────────────────────────────
    services_data = [
        {
            'name': 'Consultation Standard',
            'description': 'Consultation de 30 minutes avec un expert.',
            'base_price': 50.0,
            'duration': 30
        },
        {
            'name': 'Consultation Premium',
            'description': 'Consultation approfondie de 60 minutes.',
            'base_price': 90.0,
            'duration': 60
        },
        {
            'name': 'Séance Coaching',
            'description': 'Séance de coaching personnalisée de 90 minutes.',
            'base_price': 120.0,
            'duration': 90
        },
    ]

    services = []
    for sd in services_data:
        s = Service(**sd)
        db.session.add(s)
        services.append(s)

    db.session.flush()

    # ── Créneaux horaires ────────────────────────────────────────
    time_pairs = [
        ('09:00', '09:30'), ('09:30', '10:00'),
        ('10:00', '10:30'), ('10:30', '11:00'),
        ('11:00', '11:30'), ('14:00', '14:30'),
        ('14:30', '15:00'), ('15:00', '15:30'),
        ('15:30', '16:00'), ('16:00', '16:30'),
    ]

    today = date.today()
    all_slots = []

    # Créneaux pour les 45 jours à venir (jours ouvrés)
    for delta in range(45):
        current = today + timedelta(days=delta)
        if current.weekday() >= 5:
            continue
        for svc in services[:2]:  # 2 premiers services
            for start_t, end_t in time_pairs:
                slot = TimeSlot(
                    service_id=svc.id,
                    date=current,
                    start_time=start_t,
                    end_time=end_t
                )
                db.session.add(slot)
                all_slots.append(slot)

    # Quelques créneaux week-end pour le 3e service
    for delta in range(45):
        current = today + timedelta(days=delta)
        if current.weekday() not in [5, 6]:
            continue
        for start_t, end_t in time_pairs[:6]:
            slot = TimeSlot(
                service_id=services[2].id,
                date=current,
                start_time=start_t,
                end_time=end_t
            )
            db.session.add(slot)
            all_slots.append(slot)

    db.session.flush()

    # ── Réservations de démonstration ────────────────────────────
    random.seed(42)
    sample = [s for s in all_slots if s.date >= today][:30]

    for i, slot in enumerate(sample[:20]):
        client = clients[i % len(clients)]
        occ = random.uniform(0.1, 0.8)
        p = calculate_price(slot.service.base_price, slot.date, occ)
        res = Reservation(
            client_id=client.id,
            slot_id=slot.id,
            price=p['price'],
            status='confirmed',
            notes='Réservation de démonstration'
        )
        slot.is_available = False
        db.session.add(res)

    # Quelques annulations
    for slot in sample[20:25]:
        client = clients[0]
        p = calculate_price(slot.service.base_price, slot.date, 0.3)
        res = Reservation(
            client_id=client.id,
            slot_id=slot.id,
            price=p['price'],
            status='cancelled',
            notes='Annulée pour démonstration'
        )
        db.session.add(res)

    db.session.commit()

    print("=" * 50)
    print("✅ Base de données initialisée avec succès !")
    print("=" * 50)
    print(f"  Admin    : admin@reserv.com  / admin123")
    print(f"  Client   : alice@mail.com    / client123")
    print(f"  Services : {len(services)}")
    print(f"  Créneaux : {len(all_slots)}")
    print("=" * 50)
