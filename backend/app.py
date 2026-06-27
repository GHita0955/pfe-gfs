from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy.exc import OperationalError
from sqlalchemy import inspect
from config import Config
from models import db


def ensure_schema(app):
    """Ajoute les colonnes/tables nouvelles sans casser une base existante."""
    with app.app_context():
        db.create_all()
        engine = db.engine
        inspector = inspect(engine)

        if not inspector.has_table('reservations'):
            return

        columns = [column['name'] for column in inspector.get_columns('reservations')]
        if 'qr_token' in columns:
            return

        with engine.connect() as conn:
            try:
                if engine.dialect.name == 'mysql':
                    conn.exec_driver_sql("ALTER TABLE reservations ADD COLUMN qr_token VARCHAR(64) NULL")
                else:
                    conn.exec_driver_sql("ALTER TABLE reservations ADD COLUMN qr_token VARCHAR(64)")
            except OperationalError as exc:
                if 'Duplicate column' not in str(exc):
                    raise
            conn.commit()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    JWTManager(app)

    from routes.auth import auth_bp
    from routes.reservations import reservations_bp
    from routes.slots import slots_bp
    from routes.services import services_bp
    from routes.dashboard import dashboard_bp
    from routes.menu import menu_bp
    from routes.search import search_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(reservations_bp, url_prefix='/api/reservations')
    app.register_blueprint(slots_bp, url_prefix='/api/slots')
    app.register_blueprint(services_bp, url_prefix='/api/services')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(menu_bp, url_prefix='/api/menu')
    app.register_blueprint(search_bp, url_prefix='/api/search')

    ensure_schema(app)

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
