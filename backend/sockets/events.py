from flask_socketio import SocketIO, emit, join_room, leave_room

socketio = SocketIO(cors_allowed_origins="*")

# Connected user rooms mapping
connected_users = {}


@socketio.on('connect')
def handle_connect():
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@socketio.on('join')
def handle_join(data):
    """User joins their personal notification room."""
    user_id = data.get('user_id')
    if user_id:
        room = f'user_{user_id}'
        join_room(room)
        connected_users[user_id] = room
        print(f'User {user_id} joined room {room}')


@socketio.on('leave')
def handle_leave(data):
    user_id = data.get('user_id')
    if user_id:
        room = f'user_{user_id}'
        leave_room(room)
        connected_users.pop(user_id, None)


def emit_notification(user_id, notification_data):
    """Send real-time notification to a specific user."""
    room = f'user_{user_id}'
    socketio.emit('notification', notification_data, room=room)


def emit_goal_update(user_id, goal_data):
    """Send real-time goal update to a specific user."""
    room = f'user_{user_id}'
    socketio.emit('goal_update', goal_data, room=room)


def emit_escalation_alert(user_id, escalation_data):
    """Send real-time escalation alert."""
    room = f'user_{user_id}'
    socketio.emit('escalation', escalation_data, room=room)


def emit_dashboard_refresh(user_id):
    """Signal a user's dashboard to refresh."""
    room = f'user_{user_id}'
    socketio.emit('refresh_dashboard', room=room)
