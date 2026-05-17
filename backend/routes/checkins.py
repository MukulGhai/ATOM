from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import db
from models.quarterly_checkin import QuarterlyCheckin
from models.goal import Goal
from models.comment import Comment
from models.notification import Notification
from models.user import User
from middleware.auth import role_required, get_current_user

checkins_bp = Blueprint('checkins', __name__, url_prefix='/api/checkins')

VALID_QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']


def can_access_goal(user, goal):
    if goal.user_id == user.id or user.role == 'admin':
        return True
    if user.role == 'manager':
        owner = User.query.get(goal.user_id)
        return owner and owner.manager_id == user.id
    return False


@checkins_bp.route('', methods=['POST'])
@jwt_required()
@role_required('employee', 'manager')
def create_checkin():
    """Submit quarterly achievement."""
    current_user = get_current_user()
    data = request.get_json()
    goal_id = data.get('goal_id')
    quarter = data.get('quarter')
    if quarter not in VALID_QUARTERS:
        return jsonify({'error': 'Invalid quarter. Must be Q1, Q2, Q3, or Q4'}), 400
    goal = Goal.query.get_or_404(goal_id)
    if not can_access_goal(current_user, goal):
        return jsonify({'error': 'Not authorized'}), 403
    if goal.status != 'approved':
        return jsonify({'error': 'Goal must be approved before check-in'}), 400
    existing = QuarterlyCheckin.query.filter_by(goal_id=goal_id, quarter=quarter).first()
    if existing:
        existing.planned = data.get('planned', existing.planned)
        existing.actual = data.get('actual', existing.actual)
        existing.progress_status = data.get('progress_status', existing.progress_status)
        existing.status = 'submitted'
        existing.submitted_at = datetime.utcnow()
        checkin = existing
    else:
        checkin = QuarterlyCheckin(
            goal_id=goal_id, quarter=quarter, planned=data.get('planned'),
            actual=data.get('actual'), progress_status=data.get('progress_status', 'not_started'),
            status='submitted', submitted_at=datetime.utcnow()
        )
        db.session.add(checkin)
    # Compute score based on UoM
    checkin.score = compute_score(goal.uom_type, data.get('actual'), goal.target)
    # Update goal progress
    update_goal_progress(goal)
    db.session.commit()
    return jsonify({'checkin': checkin.to_dict()}), 201


@checkins_bp.route('/goal/<int:goal_id>', methods=['GET'])
@jwt_required()
def get_goal_checkins(goal_id):
    """Get all check-ins for a goal."""
    current_user = get_current_user()
    goal = Goal.query.get_or_404(goal_id)
    if not can_access_goal(current_user, goal):
        return jsonify({'error': 'Not authorized'}), 403
    checkins = QuarterlyCheckin.query.filter_by(goal_id=goal_id).order_by(QuarterlyCheckin.quarter).all()
    return jsonify({'checkins': [c.to_dict() for c in checkins]}), 200


@checkins_bp.route('/<int:checkin_id>', methods=['PUT'])
@jwt_required()
def update_checkin(checkin_id):
    """Update a check-in."""
    current_user = get_current_user()
    checkin = QuarterlyCheckin.query.get_or_404(checkin_id)
    goal = Goal.query.get(checkin.goal_id)
    data = request.get_json()
    if not can_access_goal(current_user, goal):
        return jsonify({'error': 'Not authorized'}), 403
    if 'actual' in data:
        checkin.actual = data['actual']
    if 'planned' in data:
        checkin.planned = data['planned']
    if 'progress_status' in data:
        checkin.progress_status = data['progress_status']
    if 'status' in data and current_user.role in ('manager', 'admin'):
        checkin.status = data['status']
        checkin.reviewed_at = datetime.utcnow()
    if 'manager_comment' in data and current_user.role in ('manager', 'admin'):
        checkin.manager_comment = data['manager_comment']
    checkin.score = compute_score(goal.uom_type, checkin.actual, goal.target)
    update_goal_progress(goal)
    db.session.commit()
    return jsonify({'checkin': checkin.to_dict()}), 200


@checkins_bp.route('/review/<int:checkin_id>', methods=['POST'])
@jwt_required()
@role_required('manager', 'admin')
def review_checkin(checkin_id):
    """Manager reviews a check-in."""
    current_user = get_current_user()
    checkin = QuarterlyCheckin.query.get_or_404(checkin_id)
    data = request.get_json()
    goal = Goal.query.get(checkin.goal_id)
    if not can_access_goal(current_user, goal):
        return jsonify({'error': 'Not authorized'}), 403
    checkin.status = data.get('status', 'approved')
    checkin.manager_comment = data.get('comment', '')
    checkin.reviewed_at = datetime.utcnow()
    if data.get('comment'):
        comment = Comment(goal_id=checkin.goal_id, user_id=current_user.id,
                          text=data['comment'], quarter=checkin.quarter)
        db.session.add(comment)
    db.session.add(Notification(user_id=goal.user_id, title='Check-in Reviewed',
        message=f'Your {checkin.quarter} check-in for "{goal.title}" has been reviewed',
        type='checkin_reviewed', reference_id=goal.id, reference_type='checkin'))
    db.session.commit()
    return jsonify({'checkin': checkin.to_dict()}), 200


@checkins_bp.route('/my', methods=['GET'])
@jwt_required()
def my_checkins():
    """Get all check-ins for the current user's goals."""
    current_user = get_current_user()
    goals = Goal.query.filter_by(user_id=current_user.id).all()
    goal_ids = [g.id for g in goals]
    checkins = QuarterlyCheckin.query.filter(QuarterlyCheckin.goal_id.in_(goal_ids)).all()
    return jsonify({'checkins': [c.to_dict() for c in checkins]}), 200


@checkins_bp.route('/team', methods=['GET'])
@jwt_required()
@role_required('manager', 'admin')
def team_checkins():
    """Get check-ins for team members."""
    current_user = get_current_user()
    if current_user.role == 'admin':
        checkins = QuarterlyCheckin.query.all()
    else:
        team_ids = [u.id for u in User.query.filter_by(manager_id=current_user.id).all()]
        goals = Goal.query.filter(Goal.user_id.in_(team_ids)).all()
        goal_ids = [g.id for g in goals]
        checkins = QuarterlyCheckin.query.filter(QuarterlyCheckin.goal_id.in_(goal_ids)).all()
    result = []
    for c in checkins:
        d = c.to_dict()
        d['goal_title'] = c.goal.title if c.goal else None
        d['employee_name'] = c.goal.owner.name if c.goal and c.goal.owner else None
        result.append(d)
    return jsonify({'checkins': result}), 200


def compute_score(uom_type, actual, target):
    """Compute progress score based on UoM type."""
    try:
        if not actual or not target:
            return 0.0
        actual_val = float(actual)
        target_val = float(target)
        if target_val == 0:
            return 100.0 if actual_val == 0 else 0.0
        if uom_type in ('numeric', 'percentage', 'numeric_min', 'percentage_min'):
            return min(round((actual_val / target_val) * 100, 2), 100)
        elif uom_type in ('numeric_max', 'percentage_max'):
            return min(round((target_val / actual_val) * 100, 2), 100) if actual_val else 100.0
        elif uom_type == 'zero':
            return 100.0 if actual_val == 0 else 0.0
        elif uom_type == 'timeline':
            return 100.0 if actual_val <= target_val else max(0, round((target_val / actual_val) * 100, 2))
        return 0.0
    except (ValueError, ZeroDivisionError):
        return 0.0


def update_goal_progress(goal):
    """Update goal overall progress based on check-in scores."""
    checkins = QuarterlyCheckin.query.filter_by(goal_id=goal.id).all()
    if checkins:
        scores = [c.score for c in checkins if c.score is not None]
        goal.progress = round(sum(scores) / len(scores), 2) if scores else 0.0
        completed = all(c.progress_status == 'completed' for c in checkins)
        if completed:
            goal.achievement_status = 'completed'
        elif any(c.progress_status == 'on_track' for c in checkins):
            goal.achievement_status = 'on_track'
        else:
            goal.achievement_status = 'not_started'
