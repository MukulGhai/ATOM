from models import db
from datetime import datetime


class SharedGoalLink(db.Model):
    """
    Links a shared goal to additional users.
    
    CRITICAL: This is a relational reference, NOT a data copy.
    The shared user references the owner's goal and achievement data.
    Only weightage can differ per shared user.
    """
    __tablename__ = 'shared_goal_links'

    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False, index=True)
    shared_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    weightage = db.Column(db.Integer, nullable=True)  # Can override weightage for their sheet
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Unique constraint: a user can only be linked to a goal once
    __table_args__ = (
        db.UniqueConstraint('goal_id', 'shared_user_id', name='uq_shared_goal_user'),
    )

    # Relationships
    shared_user = db.relationship('User', backref='shared_goal_links')

    def to_dict(self):
        return {
            'id': self.id,
            'goal_id': self.goal_id,
            'shared_user_id': self.shared_user_id,
            'shared_user_name': self.shared_user.name if self.shared_user else None,
            'weightage': self.weightage,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
