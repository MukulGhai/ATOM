import os
from datetime import timedelta

class Config:
    """Application configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'atomquest-hackathon-secret-key-2026-very-long-and-secure')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///atomquest.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-atomquest-secret-key-2026-very-long-and-secure-token')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    JWT_TOKEN_LOCATION = ['headers']
    
    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173').split(',')
    
    # Business Rules
    MAX_GOALS_PER_EMPLOYEE = 8
    MIN_WEIGHTAGE_PER_GOAL = 10
    TOTAL_WEIGHTAGE = 100
    
    # Escalation Rules (in days)
    APPROVAL_DELAY_DAYS = 3
    STAGNATION_DAYS = 30
    MAX_REJECTIONS = 3
    
    # Quarter Windows
    QUARTERS = {
        'Q1': {'month_start': 7, 'month_end': 9},   # July - September
        'Q2': {'month_start': 10, 'month_end': 12},  # October - December
        'Q3': {'month_start': 1, 'month_end': 3},    # January - March
        'Q4': {'month_start': 3, 'month_end': 4},    # March - April (Final)
    }
