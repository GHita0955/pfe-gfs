import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'pfe-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///reservation.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-pfe-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 heures
