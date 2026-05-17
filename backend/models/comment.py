from models import db
from datetime import datetime


class Comment(db.Model):
    """Comments on goals and check-ins."""
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    text = db.Column(db.Text, nullable=False)
    quarter = db.Column(db.String(10), nullable=True)  # Optional: ties comment to specific quarter
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    author = db.relationship('User', backref='comments')

    def to_dict(self):
        return {
            'id': self.id,
            'goal_id': self.goal_id,
            'user_id': self.user_id,
            'author_name': self.author.name if self.author else None,
            'text': self.text,
            'quarter': self.quarter,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
