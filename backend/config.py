import os
from pathlib import Path

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:
    load_dotenv = None

if load_dotenv:
    load_dotenv(Path(__file__).resolve().parent / '.env')


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'pfe-secret-key-change-in-production')
    # Priority:
    # 1) DATABASE_URL explicit value
    # 2) MYSQL_* env vars
    # 3) SQLite fallback for local quick demos
    _database_url = os.environ.get('DATABASE_URL')
    if _database_url:
        SQLALCHEMY_DATABASE_URI = _database_url
    else:
        _mysql_host = os.environ.get('MYSQL_HOST')
        _mysql_port = os.environ.get('MYSQL_PORT', '3306')
        _mysql_user = os.environ.get('MYSQL_USER')
        _mysql_password = os.environ.get('MYSQL_PASSWORD')
        _mysql_db = os.environ.get('MYSQL_DB')

        if _mysql_host and _mysql_user and _mysql_db:
            SQLALCHEMY_DATABASE_URI = (
                f"mysql+pymysql://{_mysql_user}:{_mysql_password or ''}@"
                f"{_mysql_host}:{_mysql_port}/{_mysql_db}"
            )
        else:
            SQLALCHEMY_DATABASE_URI = 'sqlite:///reservation.db'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-pfe-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 heures
