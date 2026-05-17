from models import db
from datetime import datetime


class Goal(db.Model):
    """Goal model with lifecycle status tracking."""
    __tablename__ = 'goals'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    thrust_area = db.Column(db.String(100), nullable=False)
    
    # Unit of Measurement
    uom_type = db.Column(db.String(20), nullable=False)  # numeric, percentage, timeline, zero
    target = db.Column(db.String(100), nullable=False)    # target value (flexible string for different UoMs)
    
    # Weightage
    weightage = db.Column(db.Integer, nullable=False)  # percentage, min 10
    
    # Status lifecycle: draft -> pending -> approved / rejected
    status = db.Column(db.String(20), nullable=False, default='draft', index=True)
    
    # Progress tracking
    progress = db.Column(db.Float, default=0.0)  # 0-100
    achievement_status = db.Column(db.String(20), default='not_started')  # not_started, on_track, completed
    
    # Metadata
    rejection_count = db.Column(db.Integer, default=0)
    rejection_reason = db.Column(db.Text, nullable=True)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    approved_at = db.Column(db.DateTime, nullable=True)
    submitted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Shared goal: if this goal is a shared copy, reference the original
    is_shared = db.Column(db.Boolean, default=False)
    original_goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=True)

    # Relationships
    checkins = db.relationship('QuarterlyCheckin', backref='goal', lazy='dynamic', cascade='all, delete-orphan')
    shared_links = db.relationship('SharedGoalLink', backref='goal', lazy='dynamic', 
                                   foreign_keys='SharedGoalLink.goal_id', cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='goal', lazy='dynamic', cascade='all, delete-orphan')
    approver = db.relationship('User', foreign_keys=[approved_by])
    original_goal = db.relationship('Goal', remote_side=[id], foreign_keys=[original_goal_id])

    def to_dict(self, include_checkins=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'owner_name': self.owner.name if self.owner else None,
            'title': self.title,
            'description': self.description,
            'thrust_area': self.thrust_area,
            'uom_type': self.uom_type,
            'target': self.target,
            'weightage': self.weightage,
            'status': self.status,
            'progress': self.progress,
            'achievement_status': self.achievement_status,
            'rejection_count': self.rejection_count,
            'rejection_reason': self.rejection_reason,
            'approved_by': self.approved_by,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_shared': self.is_shared,
            'original_goal_id': self.original_goal_id,
            'shared_users': [link.to_dict() for link in self.shared_links.all()],
        }
        if include_checkins:
            data['checkins'] = [c.to_dict() for c in self.checkins.order_by(QuarterlyCheckin.quarter).all()]
        return data


# Import here to avoid circular imports
from models.quarterly_checkin import QuarterlyCheckin
