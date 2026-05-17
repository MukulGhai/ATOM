import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from sockets.events import socketio


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)
    JWTManager(app)
    socketio.init_app(app, cors_allowed_origins="*", async_mode='threading')

    # Register blueprints
    from routes.auth import auth_bp
    from routes.users import users_bp
    from routes.goals import goals_bp
    from routes.checkins import checkins_bp
    from routes.escalations import escalations_bp
    from routes.notifications import notifications_bp
    from routes.analytics import analytics_bp
    from routes.governance import governance_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(goals_bp)
    app.register_blueprint(checkins_bp)
    app.register_blueprint(escalations_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(governance_bp)

    # Create tables
    with app.app_context():
        db.create_all()

    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'healthy', 'app': 'AtomQuest Goal Tracker'}, 200

    return app


app = create_app()

if __name__ == '__main__':
    # Seed if requested
    if '--seed' in sys.argv:
        with app.app_context():
            from seed import seed_database
            seed_database()
    else:
        socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
