from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.user import User
from middleware.auth import role_required

users_bp = Blueprint('users', __name__, url_prefix='/api/users')


@users_bp.route('', methods=['GET'])
@jwt_required()
@role_required('admin', 'manager')
def list_users():
    """List all users. Admin sees all, Manager sees their team."""
    current_user = User.query.get(get_jwt_identity())
    
    if current_user.role == 'admin':
        users = User.query.all()
    else:
        # Manager sees their direct reports
        users = User.query.filter_by(manager_id=current_user.id).all()
    
    return jsonify({'users': [u.to_dict() for u in users]}), 200


@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get a specific user."""
    current_user = User.query.get(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    if current_user.role != 'admin' and current_user.id != user.id:
        if current_user.role != 'manager' or user.manager_id != current_user.id:
            return jsonify({'error': 'Not authorized'}), 403
    return jsonify({'user': user.to_dict()}), 200


@users_bp.route('', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_user():
    """Create a new user (Admin only)."""
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400

    user = User(
        email=data['email'],
        name=data['name'],
        role=data.get('role', 'employee'),
        department=data.get('department'),
        manager_id=data.get('manager_id'),
    )
    user.set_password(data.get('password', 'password123'))
    
    db.session.add(user)
    db.session.commit()
    return jsonify({'user': user.to_dict()}), 201


@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_user(user_id):
    """Update user details (Admin only)."""
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if 'name' in data:
        user.name = data['name']
    if 'role' in data:
        user.role = data['role']
    if 'department' in data:
        user.department = data['department']
    if 'manager_id' in data:
        user.manager_id = data['manager_id']
    if 'is_active' in data:
        user.is_active = data['is_active']
    if 'password' in data:
        user.set_password(data['password'])

    db.session.commit()
    return jsonify({'user': user.to_dict()}), 200


@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_user(user_id):
    """Deactivate a user (Admin only)."""
    user = User.query.get_or_404(user_id)
    user.is_active = False
    db.session.commit()
    return jsonify({'message': 'User deactivated'}), 200


@users_bp.route('/team', methods=['GET'])
@jwt_required()
@role_required('manager')
def get_team():
    """Get manager's direct reports."""
    current_user = User.query.get(get_jwt_identity())
    team = User.query.filter_by(manager_id=current_user.id, is_active=True).all()
    return jsonify({'team': [u.to_dict() for u in team]}), 200


@users_bp.route('/employees', methods=['GET'])
@jwt_required()
def list_employees():
    """List all active employees (for sharing goals)."""
    employees = User.query.filter_by(role='employee', is_active=True).all()
    return jsonify({'employees': [u.to_dict() for u in employees]}), 200
