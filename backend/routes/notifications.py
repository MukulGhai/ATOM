from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models import db
from models.notification import Notification
from middleware.auth import get_current_user

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')


@notifications_bp.route('', methods=['GET'])
@jwt_required()
def list_notifications():
    """Get all notifications for current user."""
    current_user = get_current_user()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    query = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc())
    total = query.count()
    notifications = query.offset((page - 1) * per_page).limit(per_page).all()
    unread = Notification.query.filter_by(user_id=current_user.id, read=False).count()
    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'total': total, 'unread': unread, 'page': page, 'per_page': per_page
    }), 200


@notifications_bp.route('/<int:notif_id>/read', methods=['POST'])
@jwt_required()
def mark_read(notif_id):
    """Mark a notification as read."""
    current_user = get_current_user()
    notif = Notification.query.get_or_404(notif_id)
    if notif.user_id != current_user.id:
        return jsonify({'error': 'Not authorized'}), 403
    notif.read = True
    db.session.commit()
    return jsonify({'notification': notif.to_dict()}), 200


@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    """Mark all notifications as read."""
    current_user = get_current_user()
    Notification.query.filter_by(user_id=current_user.id, read=False).update({'read': True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'}), 200


@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def unread_count():
    """Get unread notification count."""
    current_user = get_current_user()
    count = Notification.query.filter_by(user_id=current_user.id, read=False).count()
    return jsonify({'count': count}), 200
