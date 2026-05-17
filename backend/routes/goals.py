from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import db
from models.goal import Goal
from models.user import User
from models.shared_goal_link import SharedGoalLink
from models.notification import Notification
from models.audit_log import AuditLog
from middleware.auth import role_required, get_current_user
from config import Config

goals_bp = Blueprint('goals', __name__, url_prefix='/api/goals')


def can_manage_goal(user, goal):
    """Admin can manage all goals; managers can manage direct reports."""
    if user.role == 'admin':
        return True
    if user.role == 'manager':
        owner = User.query.get(goal.user_id)
        return owner and owner.manager_id == user.id
    return False


def can_view_goal(user, goal):
    """Users can view their own goals, shared goals, and goals they manage."""
    if goal.user_id == user.id or can_manage_goal(user, goal):
        return True
    return SharedGoalLink.query.filter_by(goal_id=goal.id, shared_user_id=user.id).first() is not None


def record_goal_audit(actor, goal, action, before, after):
    changes = {
        field: {'from': before.get(field), 'to': after.get(field)}
        for field in after
        if before.get(field) != after.get(field)
    }
    if changes:
        db.session.add(AuditLog(actor_id=actor.id, goal_id=goal.id, action=action, changes=changes))


@goals_bp.route('', methods=['GET'])
@jwt_required()
def list_goals():
    current_user = get_current_user()
    if current_user.role == 'admin':
        goals = Goal.query.all()
    elif current_user.role == 'manager':
        team_ids = [u.id for u in User.query.filter_by(manager_id=current_user.id).all()]
        team_ids.append(current_user.id)
        goals = Goal.query.filter(Goal.user_id.in_(team_ids)).all()
    else:
        own_goals = Goal.query.filter_by(user_id=current_user.id).all()
        shared_links = SharedGoalLink.query.filter_by(shared_user_id=current_user.id).all()
        shared_goal_ids = [link.goal_id for link in shared_links]
        shared_goals = Goal.query.filter(Goal.id.in_(shared_goal_ids)).all() if shared_goal_ids else []
        goals = own_goals + shared_goals
    return jsonify({'goals': [g.to_dict(include_checkins=True) for g in goals]}), 200


@goals_bp.route('/<int:goal_id>', methods=['GET'])
@jwt_required()
def get_goal(goal_id):
    current_user = get_current_user()
    goal = Goal.query.get_or_404(goal_id)
    if not can_view_goal(current_user, goal):
        return jsonify({'error': 'Not authorized'}), 403
    return jsonify({'goal': goal.to_dict(include_checkins=True)}), 200


@goals_bp.route('', methods=['POST'])
@jwt_required()
@role_required('employee', 'manager', 'admin')
def create_goal():
    current_user = get_current_user()
    data = request.get_json()
    existing_count = Goal.query.filter_by(user_id=current_user.id).filter(Goal.status != 'deleted').count()
    if existing_count >= Config.MAX_GOALS_PER_EMPLOYEE:
        return jsonify({'error': f'Maximum {Config.MAX_GOALS_PER_EMPLOYEE} goals allowed'}), 400
    weightage = data.get('weightage', 0)
    if weightage < Config.MIN_WEIGHTAGE_PER_GOAL:
        return jsonify({'error': f'Minimum weightage per goal is {Config.MIN_WEIGHTAGE_PER_GOAL}%'}), 400
    current_total = db.session.query(db.func.coalesce(db.func.sum(Goal.weightage), 0)).filter(
        Goal.user_id == current_user.id, Goal.status != 'deleted').scalar()
    if current_total + weightage > Config.TOTAL_WEIGHTAGE:
        return jsonify({'error': f'Total weightage would exceed 100%. Remaining: {Config.TOTAL_WEIGHTAGE - current_total}%'}), 400
    goal = Goal(user_id=current_user.id, title=data['title'], description=data.get('description', ''),
                thrust_area=data['thrust_area'], uom_type=data['uom_type'], target=str(data['target']),
                weightage=weightage, status='draft')
    db.session.add(goal)
    db.session.commit()
    return jsonify({'goal': goal.to_dict()}), 201


@goals_bp.route('/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    current_user = get_current_user()
    goal = Goal.query.get_or_404(goal_id)
    if goal.user_id != current_user.id and current_user.role != 'admin':
        if not (current_user.role == 'manager' and goal.status == 'pending' and can_manage_goal(current_user, goal)):
            return jsonify({'error': 'Not authorized to edit this goal'}), 403
    if goal.status == 'approved' and current_user.role != 'admin':
        return jsonify({'error': 'Cannot edit approved goals'}), 400
    data = request.get_json()
    auditable_fields = ['title', 'description', 'thrust_area', 'uom_type', 'target', 'weightage', 'achievement_status', 'progress']
    before = {field: getattr(goal, field) for field in auditable_fields}
    for field in ['title', 'description', 'thrust_area', 'uom_type']:
        if field in data:
            setattr(goal, field, data[field])
    if 'target' in data:
        goal.target = str(data['target'])
    if 'weightage' in data:
        nw = data['weightage']
        if nw < Config.MIN_WEIGHTAGE_PER_GOAL:
            return jsonify({'error': f'Minimum weightage is {Config.MIN_WEIGHTAGE_PER_GOAL}%'}), 400
        ct = db.session.query(db.func.coalesce(db.func.sum(Goal.weightage), 0)).filter(
            Goal.user_id == goal.user_id, Goal.id != goal.id, Goal.status != 'deleted').scalar()
        if ct + nw > Config.TOTAL_WEIGHTAGE:
            return jsonify({'error': f'Total weightage would exceed 100%. Remaining: {Config.TOTAL_WEIGHTAGE - ct}%'}), 400
        goal.weightage = nw
    if 'achievement_status' in data:
        goal.achievement_status = data['achievement_status']
    if 'progress' in data:
        goal.progress = data['progress']
    after = {field: getattr(goal, field) for field in auditable_fields}
    if goal.status == 'approved' or current_user.role in ('manager', 'admin'):
        record_goal_audit(current_user, goal, 'goal_update', before, after)
    db.session.commit()
    return jsonify({'goal': goal.to_dict()}), 200


@goals_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    current_user = get_current_user()
    goal = Goal.query.get_or_404(goal_id)
    if goal.user_id != current_user.id and current_user.role != 'admin':
        return jsonify({'error': 'Not authorized'}), 403
    if goal.status not in ('draft', 'rejected') and current_user.role != 'admin':
        return jsonify({'error': 'Can only delete draft or rejected goals'}), 400
    db.session.delete(goal)
    db.session.commit()
    return jsonify({'message': 'Goal deleted'}), 200


@goals_bp.route('/<int:goal_id>/submit', methods=['POST'])
@jwt_required()
@role_required('employee', 'manager')
def submit_goal(goal_id):
    current_user = get_current_user()
    goal = Goal.query.get_or_404(goal_id)
    if goal.user_id != current_user.id:
        return jsonify({'error': 'Not authorized'}), 403
    if goal.status not in ('draft', 'rejected'):
        return jsonify({'error': 'Goal must be in draft or rejected status to submit'}), 400
    all_total = db.session.query(db.func.coalesce(db.func.sum(Goal.weightage), 0)).filter(
        Goal.user_id == current_user.id, Goal.status != 'deleted').scalar()
    if all_total != Config.TOTAL_WEIGHTAGE:
        return jsonify({'error': f'Total weightage must be exactly {Config.TOTAL_WEIGHTAGE}%. Current: {all_total}%'}), 400
    goal.status = 'pending'
    goal.submitted_at = datetime.utcnow()
    db.session.commit()
    if current_user.manager_id:
        db.session.add(Notification(user_id=current_user.manager_id, title='Goal Submitted',
            message=f'{current_user.name} submitted goal: {goal.title}', type='goal_submitted',
            reference_id=goal.id, reference_type='goal'))
        db.session.commit()
    return jsonify({'goal': goal.to_dict()}), 200


@goals_bp.route('/<int:goal_id>/approve', methods=['POST'])
@jwt_required()
@role_required('manager', 'admin')
def approve_goal(goal_id):
    current_user = get_current_user()
    goal = Goal.query.get_or_404(goal_id)
    if not can_manage_goal(current_user, goal):
        return jsonify({'error': 'Not authorized to approve this goal'}), 403
    if goal.status != 'pending':
        return jsonify({'error': 'Goal must be pending to approve'}), 400
    goal.status = 'approved'
    goal.approved_by = current_user.id
    goal.approved_at = datetime.utcnow()
    db.session.add(Notification(user_id=goal.user_id, title='Goal Approved',
        message=f'Your goal "{goal.title}" has been approved by {current_user.name}',
        type='goal_approved', reference_id=goal.id, reference_type='goal'))
    db.session.commit()
    return jsonify({'goal': goal.to_dict()}), 200


@goals_bp.route('/<int:goal_id>/reject', methods=['POST'])
@jwt_required()
@role_required('manager', 'admin')
def reject_goal(goal_id):
    current_user = get_current_user()
    goal = Goal.query.get_or_404(goal_id)
    data = request.get_json()
    if not can_manage_goal(current_user, goal):
        return jsonify({'error': 'Not authorized to reject this goal'}), 403
    if goal.status != 'pending':
        return jsonify({'error': 'Goal must be pending to reject'}), 400
    goal.status = 'rejected'
    goal.rejection_count += 1
    goal.rejection_reason = data.get('reason', 'No reason provided')
    db.session.add(Notification(user_id=goal.user_id, title='Goal Rejected',
        message=f'Your goal "{goal.title}" was rejected: {goal.rejection_reason}',
        type='goal_rejected', reference_id=goal.id, reference_type='goal'))
    db.session.commit()
    return jsonify({'goal': goal.to_dict()}), 200


@goals_bp.route('/<int:goal_id>/share', methods=['POST'])
@jwt_required()
@role_required('manager', 'admin')
def share_goal(goal_id):
    current_user = get_current_user()
    goal = Goal.query.get_or_404(goal_id)
    if goal.user_id != current_user.id and not can_manage_goal(current_user, goal):
        return jsonify({'error': 'Not authorized to share this goal'}), 403
    data = request.get_json()
    user_ids = data.get('user_ids', [])
    created = []
    for uid in user_ids:
        if uid == goal.user_id:
            continue
        if SharedGoalLink.query.filter_by(goal_id=goal.id, shared_user_id=uid).first():
            continue
        db.session.add(SharedGoalLink(goal_id=goal.id, shared_user_id=uid, weightage=data.get('weightage')))
        db.session.add(Notification(user_id=uid, title='Goal Shared With You',
            message=f'A goal "{goal.title}" has been shared with you', type='goal_shared',
            reference_id=goal.id, reference_type='goal'))
        created.append(uid)
    db.session.commit()
    return jsonify({'message': f'Goal shared with {len(created)} users', 'goal': goal.to_dict()}), 200


@goals_bp.route('/<int:goal_id>/unlock', methods=['POST'])
@jwt_required()
@role_required('admin')
def unlock_goal(goal_id):
    current_user = get_current_user()
    goal = Goal.query.get_or_404(goal_id)
    if goal.status != 'approved':
        return jsonify({'error': 'Only approved goals can be unlocked'}), 400
    before = {'status': goal.status, 'approved_by': goal.approved_by, 'approved_at': goal.approved_at.isoformat() if goal.approved_at else None}
    goal.status = 'draft'
    goal.approved_by = None
    goal.approved_at = None
    after = {'status': goal.status, 'approved_by': goal.approved_by, 'approved_at': None}
    db.session.add(AuditLog(actor_id=current_user.id, goal_id=goal.id, action='goal_unlock', changes={
        field: {'from': before[field], 'to': after[field]} for field in before if before[field] != after[field]
    }))
    db.session.commit()
    return jsonify({'goal': goal.to_dict()}), 200


@goals_bp.route('/pending', methods=['GET'])
@jwt_required()
@role_required('manager', 'admin')
def pending_goals():
    current_user = get_current_user()
    if current_user.role == 'admin':
        goals = Goal.query.filter_by(status='pending').all()
    else:
        team_ids = [u.id for u in User.query.filter_by(manager_id=current_user.id).all()]
        goals = Goal.query.filter(Goal.user_id.in_(team_ids), Goal.status == 'pending').all()
    return jsonify({'goals': [g.to_dict() for g in goals]}), 200


@goals_bp.route('/submit-all', methods=['POST'])
@jwt_required()
@role_required('employee', 'manager')
def submit_all_goals():
    current_user = get_current_user()
    all_total = db.session.query(db.func.coalesce(db.func.sum(Goal.weightage), 0)).filter(
        Goal.user_id == current_user.id, Goal.status != 'deleted').scalar()
    if all_total != Config.TOTAL_WEIGHTAGE:
        return jsonify({'error': f'Total weightage must be exactly {Config.TOTAL_WEIGHTAGE}%. Current: {all_total}%'}), 400
    goals = Goal.query.filter(Goal.user_id == current_user.id, Goal.status.in_(['draft', 'rejected'])).all()
    for goal in goals:
        goal.status = 'pending'
        goal.submitted_at = datetime.utcnow()
    db.session.commit()
    if current_user.manager_id:
        db.session.add(Notification(user_id=current_user.manager_id, title='Goals Submitted',
            message=f'{current_user.name} submitted {len(goals)} goals for approval',
            type='goal_submitted', reference_type='goal'))
        db.session.commit()
    return jsonify({'message': f'{len(goals)} goals submitted', 'goals': [g.to_dict() for g in goals]}), 200
