from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from models import db
from models.goal import Goal
from models.user import User
from models.escalation import Escalation
from models.quarterly_checkin import QuarterlyCheckin
from models.notification import Notification
from middleware.auth import role_required, get_current_user

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')


@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
def overview():
    """Get analytics overview based on role."""
    current_user = get_current_user()
    if current_user.role == 'employee':
        return employee_analytics(current_user)
    elif current_user.role == 'manager':
        return manager_analytics(current_user)
    else:
        return admin_analytics()


def employee_analytics(user):
    goals = Goal.query.filter_by(user_id=user.id).all()
    total_goals = len(goals)
    approved = sum(1 for g in goals if g.status == 'approved')
    completed = sum(1 for g in goals if g.achievement_status == 'completed')
    avg_progress = round(sum(g.progress for g in goals) / total_goals, 1) if total_goals > 0 else 0
    goal_ids = [g.id for g in goals]
    checkins = QuarterlyCheckin.query.filter(QuarterlyCheckin.goal_id.in_(goal_ids)).all() if goal_ids else []
    submitted_checkins = sum(1 for c in checkins if c.status == 'submitted')
    total_possible = total_goals * 4
    quarter_completion = round((submitted_checkins / total_possible) * 100, 1) if total_possible > 0 else 0
    return jsonify({
        'total_goals': total_goals, 'approved_goals': approved, 'completed_goals': completed,
        'avg_progress': avg_progress, 'quarter_completion': quarter_completion,
        'submitted_checkins': submitted_checkins, 'total_checkins_possible': total_possible,
        'goals_by_status': {s: sum(1 for g in goals if g.status == s) for s in ['draft','pending','approved','rejected']},
        'goals_by_achievement': {s: sum(1 for g in goals if g.achievement_status == s) for s in ['not_started','on_track','completed']},
    }), 200


def manager_analytics(user):
    team = User.query.filter_by(manager_id=user.id).all()
    team_ids = [u.id for u in team]
    team_ids.append(user.id)
    goals = Goal.query.filter(Goal.user_id.in_(team_ids)).all()
    total_goals = len(goals)
    pending = sum(1 for g in goals if g.status == 'pending')
    approved = sum(1 for g in goals if g.status == 'approved')
    avg_progress = round(sum(g.progress for g in goals) / total_goals, 1) if total_goals > 0 else 0
    escalations = Escalation.query.filter(Escalation.user_id.in_(team_ids), Escalation.status == 'open').count()
    # Team performance
    team_perf = []
    for member in team:
        member_goals = [g for g in goals if g.user_id == member.id]
        mg_count = len(member_goals)
        mp = round(sum(g.progress for g in member_goals) / mg_count, 1) if mg_count else 0
        team_perf.append({'id': member.id, 'name': member.name, 'goals': mg_count,
                          'avg_progress': mp, 'pending': sum(1 for g in member_goals if g.status == 'pending')})
    return jsonify({
        'team_size': len(team), 'total_goals': total_goals, 'pending_approvals': pending,
        'approved_goals': approved, 'avg_progress': avg_progress, 'open_escalations': escalations,
        'team_performance': team_perf,
        'goals_by_status': {s: sum(1 for g in goals if g.status == s) for s in ['draft','pending','approved','rejected']},
    }), 200


def admin_analytics():
    total_users = User.query.filter_by(is_active=True).count()
    total_employees = User.query.filter_by(role='employee', is_active=True).count()
    total_managers = User.query.filter_by(role='manager', is_active=True).count()
    total_goals = Goal.query.count()
    goals = Goal.query.all()
    avg_progress = round(sum(g.progress for g in goals) / total_goals, 1) if total_goals else 0
    open_escalations = Escalation.query.filter_by(status='open').count()
    total_checkins = QuarterlyCheckin.query.count()
    submitted_checkins = QuarterlyCheckin.query.filter_by(status='submitted').count()
    # Department stats
    dept_stats = db.session.query(User.department, func.count(Goal.id), func.avg(Goal.progress)).join(
        Goal, Goal.user_id == User.id).group_by(User.department).all()
    departments = [{'department': d[0] or 'Unknown', 'goal_count': d[1],
                     'avg_progress': round(d[2] or 0, 1)} for d in dept_stats]
    return jsonify({
        'total_users': total_users, 'total_employees': total_employees, 'total_managers': total_managers,
        'total_goals': total_goals, 'avg_progress': avg_progress, 'open_escalations': open_escalations,
        'total_checkins': total_checkins, 'submitted_checkins': submitted_checkins,
        'goals_by_status': {s: sum(1 for g in goals if g.status == s) for s in ['draft','pending','approved','rejected']},
        'departments': departments,
    }), 200
