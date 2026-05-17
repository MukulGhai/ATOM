"""Seed database with demo data for hackathon presentation."""
from models import db
from models.user import User
from models.goal import Goal
from models.quarterly_checkin import QuarterlyCheckin
from models.escalation import Escalation
from models.notification import Notification
from datetime import datetime, timedelta


def seed_database():
    """Create demo users, goals, check-ins, and escalations."""
    print("Seeding database...")

    # Clear existing data
    db.session.query(Notification).delete()
    db.session.query(Escalation).delete()
    db.session.query(QuarterlyCheckin).delete()
    from models.shared_goal_link import SharedGoalLink
    db.session.query(SharedGoalLink).delete()
    from models.comment import Comment
    db.session.query(Comment).delete()
    db.session.query(Goal).delete()
    db.session.query(User).delete()
    db.session.commit()

    # Create users
    admin = User(email='admin@atomquest.com', name='Priya Sharma', role='admin', department='HR')
    admin.set_password('admin123')

    manager = User(email='manager@atomquest.com', name='Rahul Verma', role='manager', department='Engineering')
    manager.set_password('manager123')

    manager2 = User(email='manager2@atomquest.com', name='Anita Desai', role='manager', department='Sales')
    manager2.set_password('manager123')

    db.session.add_all([admin, manager, manager2])
    db.session.flush()

    emp1 = User(email='employee1@atomquest.com', name='Aarav Patel', role='employee',
                department='Engineering', manager_id=manager.id)
    emp1.set_password('emp123')

    emp2 = User(email='employee2@atomquest.com', name='Sneha Gupta', role='employee',
                department='Engineering', manager_id=manager.id)
    emp2.set_password('emp123')

    emp3 = User(email='employee3@atomquest.com', name='Vikram Singh', role='employee',
                department='Engineering', manager_id=manager.id)
    emp3.set_password('emp123')

    emp4 = User(email='employee4@atomquest.com', name='Meera Joshi', role='employee',
                department='Sales', manager_id=manager2.id)
    emp4.set_password('emp123')

    emp5 = User(email='employee5@atomquest.com', name='Arjun Reddy', role='employee',
                department='Sales', manager_id=manager2.id)
    emp5.set_password('emp123')

    db.session.add_all([emp1, emp2, emp3, emp4, emp5])
    db.session.flush()

    # Employee 1 goals (approved, with check-ins)
    g1 = Goal(user_id=emp1.id, title='Increase API Response Time', description='Optimize backend API response time by 40%',
              thrust_area='Technical Excellence', uom_type='percentage', target='40', weightage=25,
              status='approved', progress=65.0, achievement_status='on_track',
              approved_by=manager.id, approved_at=datetime.utcnow() - timedelta(days=60),
              submitted_at=datetime.utcnow() - timedelta(days=65))
    g2 = Goal(user_id=emp1.id, title='Complete Microservices Migration', description='Migrate 5 monolith modules to microservices',
              thrust_area='Architecture', uom_type='numeric', target='5', weightage=30,
              status='approved', progress=40.0, achievement_status='on_track',
              approved_by=manager.id, approved_at=datetime.utcnow() - timedelta(days=55),
              submitted_at=datetime.utcnow() - timedelta(days=60))
    g3 = Goal(user_id=emp1.id, title='Zero Critical Production Bugs', description='Maintain zero critical bugs in production',
              thrust_area='Quality', uom_type='zero', target='0', weightage=20,
              status='approved', progress=100.0, achievement_status='completed',
              approved_by=manager.id, approved_at=datetime.utcnow() - timedelta(days=50),
              submitted_at=datetime.utcnow() - timedelta(days=55))
    g4 = Goal(user_id=emp1.id, title='Mentor Junior Developers', description='Conduct 12 mentoring sessions',
              thrust_area='Leadership', uom_type='numeric', target='12', weightage=15,
              status='approved', progress=50.0, achievement_status='on_track',
              approved_by=manager.id, approved_at=datetime.utcnow() - timedelta(days=50),
              submitted_at=datetime.utcnow() - timedelta(days=55))
    g5 = Goal(user_id=emp1.id, title='Documentation Coverage', description='Achieve 80% API documentation coverage',
              thrust_area='Process', uom_type='percentage', target='80', weightage=10,
              status='approved', progress=30.0, achievement_status='on_track',
              approved_by=manager.id, approved_at=datetime.utcnow() - timedelta(days=45),
              submitted_at=datetime.utcnow() - timedelta(days=50))

    # Employee 2 goals (mix of statuses)
    g6 = Goal(user_id=emp2.id, title='Deliver Customer Portal', description='Ship customer-facing portal v2.0',
              thrust_area='Delivery', uom_type='timeline', target='90', weightage=35,
              status='approved', progress=70.0, achievement_status='on_track',
              approved_by=manager.id, approved_at=datetime.utcnow() - timedelta(days=40))
    g7 = Goal(user_id=emp2.id, title='Reduce Bug Backlog', description='Clear 80% of P2 bug backlog',
              thrust_area='Quality', uom_type='percentage', target='80', weightage=25,
              status='approved', progress=45.0, achievement_status='on_track',
              approved_by=manager.id, approved_at=datetime.utcnow() - timedelta(days=35))
    g8 = Goal(user_id=emp2.id, title='Team Code Reviews', description='Complete 50 code reviews',
              thrust_area='Collaboration', uom_type='numeric', target='50', weightage=20,
              status='pending', submitted_at=datetime.utcnow() - timedelta(days=5))
    g9 = Goal(user_id=emp2.id, title='Test Automation', description='Increase test coverage to 75%',
              thrust_area='Quality', uom_type='percentage', target='75', weightage=20,
              status='draft')

    # Employee 3 goals (some stagnant for escalation demo)
    g10 = Goal(user_id=emp3.id, title='Client Demos', description='Conduct 8 client demo sessions',
               thrust_area='Business', uom_type='numeric', target='8', weightage=30,
               status='approved', progress=12.5, achievement_status='not_started',
               approved_by=manager.id, approved_at=datetime.utcnow() - timedelta(days=45),
               updated_at=datetime.utcnow() - timedelta(days=35))
    g11 = Goal(user_id=emp3.id, title='Revenue Target', description='Achieve quarterly revenue target of 50L',
               thrust_area='Revenue', uom_type='numeric', target='50', weightage=40,
               status='approved', progress=20.0, achievement_status='on_track',
               approved_by=manager.id, approved_at=datetime.utcnow() - timedelta(days=40))
    g12 = Goal(user_id=emp3.id, title='Team Training', description='Complete 4 technical training modules',
               thrust_area='Learning', uom_type='numeric', target='4', weightage=30,
               status='rejected', rejection_count=3, rejection_reason='Training modules need to be more specific',
               submitted_at=datetime.utcnow() - timedelta(days=10))

    db.session.add_all([g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12])
    db.session.flush()

    # Quarterly check-ins for Employee 1
    checkins = [
        QuarterlyCheckin(goal_id=g1.id, quarter='Q1', planned='15', actual='12', status='approved',
                         progress_status='on_track', score=80.0, submitted_at=datetime.utcnow() - timedelta(days=30)),
        QuarterlyCheckin(goal_id=g1.id, quarter='Q2', planned='25', actual='26', status='submitted',
                         progress_status='on_track', score=100.0, submitted_at=datetime.utcnow() - timedelta(days=5)),
        QuarterlyCheckin(goal_id=g2.id, quarter='Q1', planned='2', actual='2', status='approved',
                         progress_status='on_track', score=100.0, submitted_at=datetime.utcnow() - timedelta(days=30)),
        QuarterlyCheckin(goal_id=g3.id, quarter='Q1', planned='0', actual='0', status='approved',
                         progress_status='completed', score=100.0, submitted_at=datetime.utcnow() - timedelta(days=30)),
        QuarterlyCheckin(goal_id=g4.id, quarter='Q1', planned='3', actual='3', status='approved',
                         progress_status='on_track', score=100.0, submitted_at=datetime.utcnow() - timedelta(days=30)),
        QuarterlyCheckin(goal_id=g4.id, quarter='Q2', planned='6', actual='3', status='submitted',
                         progress_status='on_track', score=50.0, submitted_at=datetime.utcnow() - timedelta(days=3)),
        # Employee 2 check-ins
        QuarterlyCheckin(goal_id=g6.id, quarter='Q1', planned='30', actual='28', status='approved',
                         progress_status='on_track', score=93.3, submitted_at=datetime.utcnow() - timedelta(days=25)),
        QuarterlyCheckin(goal_id=g7.id, quarter='Q1', planned='20', actual='18', status='approved',
                         progress_status='on_track', score=90.0, submitted_at=datetime.utcnow() - timedelta(days=20)),
    ]
    db.session.add_all(checkins)

    # Shared goal: share g1 with emp2 and emp3
    link1 = SharedGoalLink(goal_id=g1.id, shared_user_id=emp2.id, weightage=15)
    link2 = SharedGoalLink(goal_id=g1.id, shared_user_id=emp3.id, weightage=10)
    db.session.add_all([link1, link2])

    # Escalations
    esc1 = Escalation(type='approval_delay', user_id=emp2.id, goal_id=g8.id, severity='medium',
                      message='Goal "Team Code Reviews" pending approval for 5 days', delay_days=5,
                      suggested_action='Manager should review and approve/reject promptly')
    esc2 = Escalation(type='goal_stagnation', user_id=emp3.id, goal_id=g10.id, severity='medium',
                      message='Goal "Client Demos" has no updates for 35 days', delay_days=35,
                      suggested_action='Employee should update progress or discuss blockers')
    esc3 = Escalation(type='repeated_rejection', user_id=emp3.id, goal_id=g12.id, severity='high',
                      message='Goal "Team Training" rejected 3 times',
                      suggested_action='Manager-employee alignment meeting recommended')
    db.session.add_all([esc1, esc2, esc3])

    # Notifications
    notifs = [
        Notification(user_id=emp1.id, title='Goal Approved', message='Your goal "Increase API Response Time" was approved',
                     type='goal_approved', reference_id=g1.id, reference_type='goal'),
        Notification(user_id=emp2.id, title='Goal Shared', message='Goal "Increase API Response Time" shared with you',
                     type='goal_shared', reference_id=g1.id, reference_type='goal'),
        Notification(user_id=manager.id, title='Goals Submitted', message='Sneha Gupta submitted goals for approval',
                     type='goal_submitted', reference_type='goal'),
        Notification(user_id=emp3.id, title='Goal Rejected', message='Your goal "Team Training" was rejected',
                     type='goal_rejected', reference_id=g12.id, reference_type='goal', read=True),
        Notification(user_id=manager.id, title='Escalation Alert', message='Approval delay detected for Sneha Gupta',
                     type='escalation', reference_id=esc1.id if esc1.id else None, reference_type='escalation'),
    ]
    db.session.add_all(notifs)
    db.session.commit()
    print("Database seeded successfully!")
    print(f"  Users: admin/admin123, manager/manager123, employee1/emp123, employee2/emp123, employee3/emp123")
