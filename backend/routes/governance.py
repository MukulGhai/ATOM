from flask import Blueprint, jsonify, Response
from flask_jwt_extended import jwt_required
from io import StringIO
import csv

from models.goal import Goal
from models.user import User
from models.quarterly_checkin import QuarterlyCheckin
from models.audit_log import AuditLog
from middleware.auth import role_required, get_current_user

governance_bp = Blueprint('governance', __name__, url_prefix='/api/governance')


def visible_user_ids(user):
    if user.role == 'admin':
        return [u.id for u in User.query.all()]
    if user.role == 'manager':
        team_ids = [u.id for u in User.query.filter_by(manager_id=user.id).all()]
        return team_ids + [user.id]
    return [user.id]


@governance_bp.route('/achievement-report.csv', methods=['GET'])
@jwt_required()
def achievement_report_csv():
    current_user = get_current_user()
    user_ids = visible_user_ids(current_user)
    goals = Goal.query.filter(Goal.user_id.in_(user_ids)).order_by(Goal.user_id, Goal.id).all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'Employee', 'Department', 'Manager', 'Goal Title', 'Thrust Area', 'UoM',
        'Target', 'Weightage', 'Status', 'Quarter', 'Planned', 'Actual',
        'Progress Status', 'Score', 'Manager Comment'
    ])
    for goal in goals:
        checkins = goal.checkins.order_by(QuarterlyCheckin.quarter).all()
        rows = checkins or [None]
        for checkin in rows:
            writer.writerow([
                goal.owner.name if goal.owner else '',
                goal.owner.department if goal.owner else '',
                goal.owner.manager.name if goal.owner and goal.owner.manager else '',
                goal.title,
                goal.thrust_area,
                goal.uom_type,
                goal.target,
                goal.weightage,
                goal.status,
                checkin.quarter if checkin else '',
                checkin.planned if checkin else '',
                checkin.actual if checkin else '',
                checkin.progress_status if checkin else '',
                checkin.score if checkin else '',
                checkin.manager_comment if checkin else '',
            ])

    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=achievement-report.csv'}
    )


@governance_bp.route('/completion-dashboard', methods=['GET'])
@jwt_required()
def completion_dashboard():
    current_user = get_current_user()
    user_ids = visible_user_ids(current_user)
    users = User.query.filter(User.id.in_(user_ids), User.is_active == True).all()
    goals = Goal.query.filter(Goal.user_id.in_(user_ids), Goal.status == 'approved').all()
    goal_ids = [g.id for g in goals]
    checkins = QuarterlyCheckin.query.filter(QuarterlyCheckin.goal_id.in_(goal_ids)).all() if goal_ids else []

    submitted = [c for c in checkins if c.status in ('submitted', 'approved')]
    reviewed = [c for c in checkins if c.status == 'approved']
    expected = len(goals) * 4

    employee_rows = []
    for user in users:
        user_goals = [g for g in goals if g.user_id == user.id]
        expected_user = len(user_goals) * 4
        user_goal_ids = {g.id for g in user_goals}
        user_submitted = [c for c in submitted if c.goal_id in user_goal_ids]
        employee_rows.append({
            'id': user.id,
            'name': user.name,
            'role': user.role,
            'department': user.department,
            'manager_name': user.manager.name if user.manager else None,
            'approved_goals': len(user_goals),
            'submitted_checkins': len(user_submitted),
            'expected_checkins': expected_user,
            'completion_rate': round((len(user_submitted) / expected_user) * 100, 1) if expected_user else 0,
        })

    manager_rows = []
    managers = [u for u in users if u.role == 'manager']
    for manager in managers:
        report_ids = [u.id for u in User.query.filter_by(manager_id=manager.id).all()]
        report_goals = [g for g in goals if g.user_id in report_ids]
        report_goal_ids = {g.id for g in report_goals}
        report_checkins = [c for c in checkins if c.goal_id in report_goal_ids]
        report_reviewed = [c for c in report_checkins if c.status == 'approved']
        manager_rows.append({
            'id': manager.id,
            'name': manager.name,
            'team_goals': len(report_goals),
            'reviewed_checkins': len(report_reviewed),
            'submitted_checkins': len([c for c in report_checkins if c.status in ('submitted', 'approved')]),
            'review_rate': round((len(report_reviewed) / len(report_checkins)) * 100, 1) if report_checkins else 0,
        })

    return jsonify({
        'expected_checkins': expected,
        'submitted_checkins': len(submitted),
        'reviewed_checkins': len(reviewed),
        'employee_completion_rate': round((len(submitted) / expected) * 100, 1) if expected else 0,
        'manager_review_rate': round((len(reviewed) / len(checkins)) * 100, 1) if checkins else 0,
        'employees': employee_rows,
        'managers': manager_rows,
    }), 200


@governance_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@role_required('admin')
def audit_logs():
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(100).all()
    return jsonify({'logs': [log.to_dict() for log in logs]}), 200
