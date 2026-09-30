# Student Feedback Management System


A full-stack college project using **React + Node.js + Express + MongoDB**.

## Features

- **Students** can submit feedback for teachers (1 feedback per teacher)
- **Teachers** see their average rating and anonymous comments (student names hidden)
- **Admin** sees full data including who submitted feedback
- **Public** ratings page (no login required)

## Project Structure

```
feedback-system/
  backend/       -> Node.js + Express + MongoDB API
  frontend/      -> React app
```

## Quick Setup

### Prerequisites
- Node.js (v16 or later)
- MongoDB running locally OR MongoDB Atlas URI

---

### Step 1: Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set your MONGO_URI if needed
npm install
```

### Step 2: Seed Demo Data

```bash
cd backend
node seed.js
```

### Step 3: Start Backend

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Step 4: Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## Demo Login Credentials

| Role    | Email                   | Password    |
|---------|-------------------------|-------------|
| Admin   | admin@college.com       | admin123    |
| Teacher | teacher@college.com     | teacher123  |
| Student | student@college.com     | student123  |

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Student
- `GET /api/teachers` - List all teachers
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/my-submissions` - View submitted feedbacks
- `GET /api/feedback/check/:teacherId` - Check if feedback submitted

### Teacher
- `GET /api/teachers/my-stats` - View own rating (anonymous)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/feedbacks` - All feedbacks (with student names)
- `GET /api/admin/users` - All users
- `GET /api/admin/teacher-summary` - Ranked teacher stats
- `DELETE /api/admin/feedbacks/:id` - Delete feedback
- `DELETE /api/admin/users/:id` - Delete user

### Public
- `GET /api/public/ratings` - Public teacher ratings (no login needed)

---

## Tech Stack

- **Frontend**: React 18, React Router 6, Axios, React Toastify
- **Backend**: Node.js, Express 4, Mongoose
- **Database**: MongoDB
- **Auth**: JWT (JSON Web Tokens) + bcryptjs

---

## Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/feedback_system
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```
