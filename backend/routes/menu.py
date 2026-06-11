from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, MenuItem
from utils.decorators import admin_required

menu_bp = Blueprint('menu', __name__)

VALID_CATEGORIES = {'plat', 'dessert', 'jus'}


@menu_bp.route('/', methods=['GET'])
def get_menu_items():
    category = (request.args.get('category') or '').strip().lower()

    query = MenuItem.query.filter_by(is_available=True)
    if category:
        query = query.filter_by(category=category)

    items = query.order_by(MenuItem.category.asc(), MenuItem.name.asc()).all()
    return jsonify([item.to_dict() for item in items]), 200


@menu_bp.route('/all', methods=['GET'])
@jwt_required()
@admin_required
def get_all_menu_items():
    items = MenuItem.query.order_by(MenuItem.category.asc(), MenuItem.name.asc()).all()
    return jsonify([item.to_dict() for item in items]), 200


@menu_bp.route('/<int:item_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_menu_item(item_id):
    item = MenuItem.query.get_or_404(item_id)
    return jsonify(item.to_dict()), 200


@menu_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_menu_item():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Aucune donnée fournie'}), 400

    name = (data.get('name') or '').strip()
    category = (data.get('category') or '').strip().lower()
    price = data.get('price')

    if not name:
        return jsonify({'error': 'name est requis'}), 400
    if category not in VALID_CATEGORIES:
        return jsonify({'error': 'category invalide (plat, dessert, jus)'}), 400
    if price is None:
        return jsonify({'error': 'price est requis'}), 400

    item = MenuItem(
        name=name,
        description=(data.get('description') or '').strip(),
        category=category,
        price=float(price),
        image_url=(data.get('image_url') or '').strip() or None,
        is_available=bool(data.get('is_available', True))
    )
    db.session.add(item)
    db.session.commit()

    return jsonify(item.to_dict()), 201


@menu_bp.route('/<int:item_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_menu_item(item_id):
    item = MenuItem.query.get_or_404(item_id)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Aucune donnée fournie'}), 400

    if 'name' in data:
        item.name = (data['name'] or '').strip()
    if 'description' in data:
        item.description = (data['description'] or '').strip()
    if 'category' in data:
        category = (data['category'] or '').strip().lower()
        if category not in VALID_CATEGORIES:
            return jsonify({'error': 'category invalide (plat, dessert, jus)'}), 400
        item.category = category
    if 'price' in data:
        item.price = float(data['price'])
    if 'image_url' in data:
        item.image_url = (data['image_url'] or '').strip() or None
    if 'is_available' in data:
        item.is_available = bool(data['is_available'])

    db.session.commit()
    return jsonify(item.to_dict()), 200


@menu_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_menu_item(item_id):
    item = MenuItem.query.get_or_404(item_id)
    item.is_available = False
    db.session.commit()
    return jsonify({'message': 'Plat retiré du menu'}), 200
