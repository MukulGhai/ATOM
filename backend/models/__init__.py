from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from models.user import User
from models.goal import Goal
from models.shared_goal_link import SharedGoalLink
from models.quarterly_checkin import QuarterlyCheckin
from models.escalation import Escalation
from models.notification import Notification
from models.comment import Comment
from models.audit_log import AuditLog
