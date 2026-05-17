from models import db
from datetime import datetime


class Notification(db.Model):
    """Real-time notification for users."""
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Notification content
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # goal_approved, goal_rejected, escalation, reminder
    
    # Reference
    reference_id = db.Column(db.Integer, nullable=True)   # goal_id or escalation_id
    reference_type = db.Column(db.String(50), nullable=True)  # goal, escalation, checkin
    
    # Status
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'reference_id': self.reference_id,
            'reference_type': self.reference_type,
            'read': self.read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
