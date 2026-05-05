from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Service
from utils.decorators import admin_required

services_bp = Blueprint('services', __name__)


@services_bp.route('/', methods=['GET'])
def get_services():
    services = Service.query.filter_by(is_active=True).all()
    return jsonify([s.to_dict() for s in services]), 200


@services_bp.route('/all', methods=['GET'])
@jwt_required()
@admin_required
def get_all_services():
    services = Service.query.all()
    return jsonify([s.to_dict() for s in services]), 200


@services_bp.route('/<int:service_id>', methods=['GET'])
def get_service(service_id):
    service = Service.query.get_or_404(service_id)
    return jsonify(service.to_dict()), 200


@services_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_service():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Aucune donnée fournie'}), 400

    for field in ['name', 'base_price', 'duration']:
        if field not in data:
            return jsonify({'error': f'{field} est requis'}), 400

    service = Service(
        name=data['name'].strip(),
        description=data.get('description', '').strip(),
        base_price=float(data['base_price']),
        duration=int(data['duration'])
    )
    db.session.add(service)
    db.session.commit()
    return jsonify(service.to_dict()), 201


@services_bp.route('/<int:service_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_service(service_id):
    service = Service.query.get_or_404(service_id)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Aucune donnée fournie'}), 400

    if 'name' in data:
        service.name = data['name'].strip()
    if 'description' in data:
        service.description = data['description'].strip()
    if 'base_price' in data:
        service.base_price = float(data['base_price'])
    if 'duration' in data:
        service.duration = int(data['duration'])
    if 'is_active' in data:
        service.is_active = bool(data['is_active'])

    db.session.commit()
    return jsonify(service.to_dict()), 200


@services_bp.route('/<int:service_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_service(service_id):
    service = Service.query.get_or_404(service_id)
    service.is_active = False  # Suppression logique
    db.session.commit()
    return jsonify({'message': 'Service désactivé'}), 200
