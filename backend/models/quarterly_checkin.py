from models import db
from datetime import datetime


class QuarterlyCheckin(db.Model):
    """Quarterly check-in for tracking planned vs actual achievement."""
    __tablename__ = 'quarterly_checkins'

    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False, index=True)
    quarter = db.Column(db.String(10), nullable=False)  # Q1, Q2, Q3, Q4
    
    # Achievement tracking
    planned = db.Column(db.String(100), nullable=True)   # Planned target for the quarter
    actual = db.Column(db.String(100), nullable=True)     # Actual achievement
    
    # Status: pending, submitted, approved, rejected
    status = db.Column(db.String(20), default='pending')
    
    # Progress status: not_started, on_track, completed
    progress_status = db.Column(db.String(20), default='not_started')
    
    # Computed score (for tracking, not rating)
    score = db.Column(db.Float, nullable=True)
    
    # Manager feedback
    manager_comment = db.Column(db.Text, nullable=True)
    
    submitted_at = db.Column(db.DateTime, nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('goal_id', 'quarter', name='uq_goal_quarter'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'goal_id': self.goal_id,
            'quarter': self.quarter,
            'planned': self.planned,
            'actual': self.actual,
            'status': self.status,
            'progress_status': self.progress_status,
            'score': self.score,
            'manager_comment': self.manager_comment,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
