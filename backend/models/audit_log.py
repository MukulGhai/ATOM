from models import db
from datetime import datetime


class AuditLog(db.Model):
    """Tracks governed changes after goal lock or manager/admin intervention."""
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    actor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False, index=True)
    action = db.Column(db.String(80), nullable=False)
    changes = db.Column(db.JSON, nullable=False, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    actor = db.relationship('User', foreign_keys=[actor_id])
    goal = db.relationship('Goal', foreign_keys=[goal_id])

    def to_dict(self):
        return {
            'id': self.id,
            'actor_id': self.actor_id,
            'actor_name': self.actor.name if self.actor else None,
            'goal_id': self.goal_id,
            'goal_title': self.goal.title if self.goal else None,
            'employee_name': self.goal.owner.name if self.goal and self.goal.owner else None,
            'action': self.action,
            'changes': self.changes or {},
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
