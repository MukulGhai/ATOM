# AtomQuest Goal Setting & Tracking Portal

An enterprise-grade employee performance management system built for the AtomQuest Hackathon 1.0.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Socket.IO Client, Recharts, Lucide Icons
- **Backend**: Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-SocketIO
- **Database**: SQLite (Development), PostgreSQL (Production ready)

## Features
1. **Role-Based Access Control**: Employee, Manager, and Admin dashboards.
2. **Goal Management & Workflows**: Strict weightage validation (min 10%, max 8 goals, total exactly 100%), manager approval workflows, and goal sharing via relational links.
3. **Quarterly Check-ins**: Periodic tracking with score computation and status updates.
4. **Escalation Engine**: Automated business logic checks for stagnation, missed check-ins, and approval delays.
5. **Real-time Notifications**: Socket.IO integration for instant event alerts.
6. **Analytics Dashboards**: Interactive charts using Recharts for org-wide and team performance.

## Running Locally

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Seed the database with demo data
python app.py --seed

# Run the development server
python app.py
```
*Backend runs on http://localhost:5000*

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on http://localhost:5173*

## Deployment Instructions (Render & Vercel)

### Backend (Render Web Service)
1. Push your code to GitHub.
2. Create a new "Web Service" on Render.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn -k gevent -w 1 app:app` (Install `gunicorn` and `gevent` first)
5. Environment Variables:
   - `DATABASE_URL`: Add your PostgreSQL connection string (e.g., from Neon or Render DB).
   - `SECRET_KEY`: A highly secure random string.
   - `JWT_SECRET_KEY`: A highly secure random string for tokens.

### Frontend (Vercel)
1. Import the `frontend` directory as a new project on Vercel.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Environment Variables:
   - `VITE_API_URL`: Your deployed Render backend URL (e.g., `https://atomquest-api.onrender.com`).

## Demo Accounts
- **Admin**: admin@atomquest.com / admin123
- **Manager**: manager@atomquest.com / manager123
- **Employee**: employee1@atomquest.com / emp123
