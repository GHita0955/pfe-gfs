
## 🗂️ Structure du projet

```
Projet PFE/
├── backend/          # API REST Flask (Python)
│   ├── app.py
│   ├── models.py
│   ├── config.py
│   ├── init_db.py
│   ├── requirements.txt
│   ├── routes/       # auth, reservations, slots, services, dashboard
│   └── utils/        # pricing, forecasting, decorators
└── frontend/         # Interface React (Vite)
    ├── src/
    │   ├── pages/    # Login, Register, Home, BookingPage, MyReservations
    │   ├── pages/admin/  # Dashboard, ManageReservations, ManageSlots, ManageServices
    │   ├── components/   # Navbar, ProtectedRoute
    │   ├── context/      # AuthContext (JWT)
    │   └── services/     # api.js (Axios)
    └── vite.config.js
```

## ⚡ Démarrage rapide

### 1. Backend (Flask)

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

# Installer les dépendances
pip install -r requirements.txt

# Configurer MySQL (option recommandée du cahier des charges)
# 1) Créer la base : reservsmart
# 2) Copier backend/.env.example vers backend/.env
# 3) Adapter MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB

# Initialiser la base de données avec les données de démo
python init_db.py

# Lancer le serveur
python app.py
```

Le serveur démarre sur `http://localhost:5000`

### 2. Frontend (React + Vite)

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application est accessible sur `http://localhost:3000`

---

## 🔐 Comptes de démonstration

| Rôle      | Email                  | Mot de passe |
|-----------|------------------------|--------------|
| Admin     | admin@reserv.com       | admin123     |
| Client    | alice@mail.com         | client123    |
| Client    | bob@mail.com           | client123    |

---

## 🎯 Fonctionnalités

### 👤 Côté Client
- Consultation des services disponibles
- Sélection de la date et du créneau horaire
- **Tarification dynamique** visible en temps réel
- Confirmation instantanée de réservation
- Consultation et annulation de ses réservations

### 🛠️ Côté Administrateur
- **Dashboard** avec statistiques et graphiques (Recharts)
  - Revenus par mois
  - Taux d'occupation par jour de la semaine
  - Répartition des statuts (PieChart)
  - Nombre de réservations par mois
- **Prévision de la demande** sur 14 jours
- Gestion complète des réservations (liste, filtres, annulation)
- **Générateur de créneaux en masse** (plage de dates + créneaux horaires multiples)
- Gestion des services (CRUD avec modal)

---

## 💰 Tarification Dynamique

La logique de tarification (`utils/pricing.py`) ajuste le prix selon :

| Condition                          | Ajustement |
|------------------------------------|-----------|
| Week-end (Sam/Dim)                 | +20%       |
| Taux d'occupation ≥ 80%            | +30%       |
| Taux d'occupation 60-80%           | +15%       |
| Taux d'occupation ≤ 20%            | -15%       |
| Haute saison (Juil, Août, Déc)     | +10%       |

---

## 🛠️ Technologies

| Couche      | Technologie                          |
|-------------|--------------------------------------|
| Backend     | Python 3.10+, Flask 3, SQLAlchemy    |
| Base de données | MySQL (principal), SQLite (fallback local) |
| Auth        | JWT (Flask-JWT-Extended)             |
| Frontend    | React 18, React Router v6            |
| Graphiques  | Recharts                             |
| HTTP Client | Axios                                |
| Build tool  | Vite 5                               |

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Inscription
- `POST /api/auth/login` — Connexion
- `GET  /api/auth/me` — Profil courant

### Services
- `GET  /api/services/` — Liste des services actifs
- `POST /api/services/` — Créer (admin)
- `PUT  /api/services/:id` — Modifier (admin)

### Créneaux
- `GET  /api/slots/?service_id=&date=&available=` — Liste
- `POST /api/slots/generate` — Génération en masse (admin)
- `PUT  /api/slots/:id` — Modifier disponibilité (admin)
- `DELETE /api/slots/:id` — Supprimer (admin)

### Réservations
- `GET  /api/reservations/` — Mes réservations (ou toutes si admin)
- `POST /api/reservations/` — Créer une réservation
- `PUT  /api/reservations/:id/cancel` — Annuler

### Dashboard (admin)
- `GET /api/dashboard/stats`
- `GET /api/dashboard/revenue-chart`
- `GET /api/dashboard/occupancy-chart`
- `GET /api/dashboard/forecast`
- `GET /api/dashboard/recent-reservations`
