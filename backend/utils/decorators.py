from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from models import User


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Accès administrateur requis'}), 403
        return f(*args, **kwargs)
    return decorated
