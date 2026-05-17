from models import db
from datetime import datetime


class Escalation(db.Model):
    """Auto-generated escalation when business rules are violated."""
    __tablename__ = 'escalations'

    id = db.Column(db.Integer, primary_key=True)
    
    # Escalation type
    type = db.Column(db.String(50), nullable=False)
    # Types: missed_checkin, approval_delay, goal_stagnation, repeated_rejection
    
    # References
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=True)
    
    # Severity: low, medium, high, critical
    severity = db.Column(db.String(20), nullable=False, default='medium')
    
    # Details
    message = db.Column(db.Text, nullable=False)
    suggested_action = db.Column(db.Text, nullable=True)
    delay_days = db.Column(db.Integer, nullable=True)
    
    # Status: open, acknowledged, resolved
    status = db.Column(db.String(20), default='open', index=True)
    resolved_at = db.Column(db.DateTime, nullable=True)
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='escalations')
    related_goal = db.relationship('Goal', backref='escalations')
    resolver = db.relationship('User', foreign_keys=[resolved_by])

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'goal_id': self.goal_id,
            'goal_title': self.related_goal.title if self.related_goal else None,
            'severity': self.severity,
            'message': self.message,
            'suggested_action': self.suggested_action,
            'delay_days': self.delay_days,
            'status': self.status,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
