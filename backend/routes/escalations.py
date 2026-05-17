from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from models import db
from models.escalation import Escalation
from models.notification import Notification
from models.goal import Goal
from models.user import User
from models.quarterly_checkin import QuarterlyCheckin
from middleware.auth import role_required, get_current_user
from config import Config

escalations_bp = Blueprint('escalations', __name__, url_prefix='/api/escalations')


def visible_user_ids(user):
    if user.role == 'admin':
        return [u.id for u in User.query.all()]
    if user.role == 'manager':
        team_ids = [u.id for u in User.query.filter_by(manager_id=user.id).all()]
        return team_ids + [user.id]
    return [user.id]


def can_access_escalation(user, escalation):
    return escalation.user_id in visible_user_ids(user)


@escalations_bp.route('', methods=['GET'])
@jwt_required()
def list_escalations():
    """List escalations based on role."""
    current_user = get_current_user()
    if current_user.role == 'admin':
        escalations = Escalation.query.order_by(Escalation.created_at.desc()).all()
    elif current_user.role == 'manager':
        team_ids = [u.id for u in User.query.filter_by(manager_id=current_user.id).all()]
        team_ids.append(current_user.id)
        escalations = Escalation.query.filter(Escalation.user_id.in_(team_ids)).order_by(Escalation.created_at.desc()).all()
    else:
        escalations = Escalation.query.filter_by(user_id=current_user.id).order_by(Escalation.created_at.desc()).all()
    return jsonify({'escalations': [e.to_dict() for e in escalations]}), 200


@escalations_bp.route('/<int:esc_id>/resolve', methods=['POST'])
@jwt_required()
@role_required('manager', 'admin')
def resolve_escalation(esc_id):
    """Resolve an escalation."""
    current_user = get_current_user()
    esc = Escalation.query.get_or_404(esc_id)
    if not can_access_escalation(current_user, esc):
        return jsonify({'error': 'Not authorized'}), 403
    esc.status = 'resolved'
    esc.resolved_at = datetime.utcnow()
    esc.resolved_by = current_user.id
    db.session.commit()
    return jsonify({'escalation': esc.to_dict()}), 200


@escalations_bp.route('/<int:esc_id>/acknowledge', methods=['POST'])
@jwt_required()
def acknowledge_escalation(esc_id):
    """Acknowledge an escalation."""
    current_user = get_current_user()
    esc = Escalation.query.get_or_404(esc_id)
    if current_user.role == 'employee' and esc.user_id != current_user.id:
        return jsonify({'error': 'Not authorized'}), 403
    if current_user.role == 'manager':
        owner = User.query.get(esc.user_id)
        if esc.user_id != current_user.id and (not owner or owner.manager_id != current_user.id):
            return jsonify({'error': 'Not authorized'}), 403
    esc.status = 'acknowledged'
    db.session.commit()
    return jsonify({'escalation': esc.to_dict()}), 200


@escalations_bp.route('/trigger', methods=['POST'])
@jwt_required()
@role_required('manager', 'admin')
def manual_trigger():
    """Manually trigger escalation check."""
    results = run_escalation_checks()
    return jsonify({'message': f'Escalation check completed. {len(results)} new escalations.', 'escalations': results}), 200


@escalations_bp.route('/stats', methods=['GET'])
@jwt_required()
@role_required('manager', 'admin')
def escalation_stats():
    """Get escalation statistics."""
    current_user = get_current_user()
    scope = Escalation.query.filter(Escalation.user_id.in_(visible_user_ids(current_user)))
    total = scope.count()
    open_count = scope.filter_by(status='open').count()
    acknowledged = scope.filter_by(status='acknowledged').count()
    resolved = scope.filter_by(status='resolved').count()
    by_severity = {}
    for sev in ['low', 'medium', 'high', 'critical']:
        by_severity[sev] = scope.filter_by(severity=sev, status='open').count()
    by_type = {}
    for t in ['missed_checkin', 'approval_delay', 'goal_stagnation', 'repeated_rejection']:
        by_type[t] = scope.filter_by(type=t, status='open').count()
    return jsonify({'total': total, 'open': open_count, 'acknowledged': acknowledged,
                    'resolved': resolved, 'by_severity': by_severity, 'by_type': by_type}), 200


def run_escalation_checks():
    """Run automated escalation checks."""
    results = []
    now = datetime.utcnow()

    # 1. Approval delay: pending goals older than APPROVAL_DELAY_DAYS
    pending_goals = Goal.query.filter_by(status='pending').all()
    for goal in pending_goals:
        if goal.submitted_at:
            days = (now - goal.submitted_at).days
            if days >= Config.APPROVAL_DELAY_DAYS:
                existing = Escalation.query.filter_by(type='approval_delay', goal_id=goal.id, status='open').first()
                if not existing:
                    esc = Escalation(type='approval_delay', user_id=goal.user_id, goal_id=goal.id,
                        severity='high' if days > 7 else 'medium', delay_days=days,
                        message=f'Goal "{goal.title}" pending approval for {days} days',
                        suggested_action='Manager should review and approve/reject the goal promptly')
                    db.session.add(esc)
                    results.append(esc.to_dict())

    # 2. Goal stagnation: approved goals with no progress update in STAGNATION_DAYS
    approved_goals = Goal.query.filter_by(status='approved').all()
    for goal in approved_goals:
        if goal.updated_at:
            days = (now - goal.updated_at).days
            if days >= Config.STAGNATION_DAYS:
                existing = Escalation.query.filter_by(type='goal_stagnation', goal_id=goal.id, status='open').first()
                if not existing:
                    esc = Escalation(type='goal_stagnation', user_id=goal.user_id, goal_id=goal.id,
                        severity='medium', delay_days=days,
                        message=f'Goal "{goal.title}" has no updates for {days} days',
                        suggested_action='Employee should update progress or mark achievement status')
                    db.session.add(esc)
                    results.append(esc.to_dict())

    # 3. Repeated rejection
    rejected_goals = Goal.query.filter(Goal.rejection_count >= Config.MAX_REJECTIONS).all()
    for goal in rejected_goals:
        existing = Escalation.query.filter_by(type='repeated_rejection', goal_id=goal.id, status='open').first()
        if not existing:
            esc = Escalation(type='repeated_rejection', user_id=goal.user_id, goal_id=goal.id,
                severity='high', message=f'Goal "{goal.title}" rejected {goal.rejection_count} times',
                suggested_action='Requires manager-employee discussion to realign the goal')
            db.session.add(esc)
            results.append(esc.to_dict())

    db.session.commit()
    return results
