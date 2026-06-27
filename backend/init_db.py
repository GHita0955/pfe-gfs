"""
Script d'initialisation de la base de données avec des données de démonstration.
Exécuter depuis le dossier backend/ : python init_db.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import app
from models import db, User, Service, TimeSlot, Reservation, MenuItem, Statistique, generate_qr_token
from utils.forecasting import refresh_statistiques
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

    # ── Menu restaurant (plats, desserts, jus) ─────────────────
    menu_items = [
        {
            'name': 'Chicken Burger Maison',
            'description': 'Poulet croustillant, cheddar, salade et sauce maison.',
            'category': 'plat',
            'price': 42.5,
            'image_url': 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=1200&q=80'
        },
        {
            'name': 'Pizza 4 Fromages',
            'description': 'Mozzarella, gorgonzola, parmesan et emmental.',
            'category': 'plat',
            'price': 58.0,
            'image_url': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80'
        },
        {
            'name': 'Tajine de Poulet aux Citrons Confits',
            'description': 'Tajine gourmand avec olives et citron confit.',
            'category': 'plat',
            'price': 72.0,
            'image_url': 'https://newsgeet.com/wp-content/uploads/2024/12/Tajine-de-poulet-au-citron-confit-et-olives-1024x853.jpg'
        },
        {
            'name': 'Couscous Royale',
            'description': 'Semoule fine, légumes frais et viande tendre.',
            'category': 'plat',
            'price': 85.0,
            'image_url': 'https://www.albertmenes.fr/img/ybc_blog/post/thumb/16417759296490.jpg'
        },
        {
            'name': 'Pastilla au Poulet',
            'description': 'Pastilla marocaine feuilletée, poulet parfumé et amandes.',
            'category': 'plat',
            'price': 88.0,
            'image_url': 'https://recettescarnees.com/wp-content/uploads/2025/10/recette-pastilla-au-poulet-marocaine.webp'
        },
        {
            'name': 'Rfissa Traditionnelle',
            'description': 'Poulet mijoté aux lentilles, msemen et épices marocaines.',
            'category': 'plat',
            'price': 82.0,
            'image_url': 'https://saveursmarocaine.com/wp-content/uploads/2025/04/rfissa-marocaine.webp'
        },
        {
            'name': 'Tanjia Marrakchia',
            'description': 'Viande confite à la marrakchie, citron confit et épices douces.',
            'category': 'plat',
            'price': 96.0,
            'image_url': 'https://th.bing.com/th/id/OIP.VYTWMKd-ab7pM_YenTzFoAHaE8?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3'
        },
        {
            'name': 'Seffa Medfouna',
            'description': 'Vermicelles sucrés-salés, poulet tendre, cannelle et amandes.',
            'category': 'plat',
            'price': 78.0,
            'image_url': 'https://tse2.mm.bing.net/th/id/OIP.UIvQuf6vCKIy2jOGjR2MLQHaEy?rs=1&pid=ImgDetMain&o=7&rm=3'
        },
        {
            'name': 'Mechoui d’Agneau',
            'description': 'Agneau rôti lentement, servi avec cumin et sel traditionnel.',
            'category': 'plat',
            'price': 110.0,
            'image_url': 'https://tse1.mm.bing.net/th/id/OIP.CTjVH-pmve6BXh_sVjq-hwHaEO?rs=1&pid=ImgDetMain&o=7&rm=3'
        },
        {
            'name': 'Tiramisu Classique',
            'description': 'Dessert italien au café et mascarpone.',
            'category': 'dessert',
            'price': 24.0,
            'image_url': 'https://images.unsplash.com/photo-1514516870922-11fd3250df8d?auto=format&fit=crop&w=1200&q=80'
        },
        {
            'name': 'Fondant Chocolat',
            'description': 'Cœur coulant, servi tiède.',
            'category': 'dessert',
            'price': 26.0,
            'image_url': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=80'
        },
        {
            'name': 'Crème Brûlée',
            'description': 'Vanille onctueuse avec croûte caramelisée.',
            'category': 'dessert',
            'price': 28.0,
            'image_url': 'https://images.unsplash.com/photo-1542327897-5a4aea37a7dd?auto=format&fit=crop&w=1200&q=80'
        },
        {
            'name': 'Salade de Fruits Frais',
            'description': 'Fruits de saison coupés, léger et rafraîchissant.',
            'category': 'dessert',
            'price': 22.0,
            'image_url': 'https://images.unsplash.com/photo-1505253218056-5d0e0ddb8a5d?auto=format&fit=crop&w=1200&q=80'
        },
        {
            'name': 'Jus d’Orange Pressé',
            'description': '100% frais, sans sucre ajouté.',
            'category': 'jus',
            'price': 14.0,
            'image_url': 'https://images.unsplash.com/photo-1547517026-5dffb0f338a9?auto=format&fit=crop&w=1200&q=80'
        },
        {
            'name': 'Citronnade Menthe',
            'description': 'Citron frais, menthe et glace.',
            'category': 'jus',
            'price': 16.0,
            'image_url': 'https://images.unsplash.com/photo-1510626176961-4b9a4a0dee76?auto=format&fit=crop&w=1200&q=80'
        },
        {
            'name': 'Jus de Mangue Tropical',
            'description': 'Mangue mûre, ananas et une pointe de citron vert.',
            'category': 'jus',
            'price': 18.0,
            'image_url': 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1200&q=80'
        },
        {
            'name': 'Smoothie Fraise-Banane',
            'description': 'Fraise, banane et yaourt frais mixés.',
            'category': 'jus',
            'price': 19.0,
            'image_url': 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1200&q=80'
        }
    ]

    for item in menu_items:
        db.session.add(MenuItem(**item))

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
