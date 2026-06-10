# DevTrack 🚀

A full-stack developer productivity platform built to help developers track progress, stay consistent, and showcase their growth.

DevTrack combines coding activity tracking, goal management, GitHub integration, analytics, streaks, XP, and leaderboards into a single dashboard designed for developers.

## Features

* Secure Authentication (JWT + HttpOnly Cookies)
* Email Verification
* Forgot Password & Password Reset
* GitHub OAuth Integration
* GitHub Stats & Repository Insights
* Progress Tracking
* Goal Management
* Developer Analytics Dashboard
* XP & Gamification System
* Streak Tracking
* Public Developer Profiles
* Leaderboards
* CSRF Protection
* Rate Limiting & Bot Protection

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* TanStack Query
* Recharts

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Zod Validation
* Nodemailer

### Deployment

* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas

## Project Structure

```bash
client/     # Frontend Application
server/     # Backend API
scripts/    # Utility Scripts
.github/    # CI/CD Workflows
```

## Getting Started

### Clone Repository

```bash
git clone https://github.com/Am4rjeet/DevTrack.git
cd DevTrack
```

### Install Dependencies

```bash
npm install
```

### Environment Setup

Create:

```bash
server/.env
```

using:

```bash
server/.env.example
```

### Start Development Server

Backend:

```bash
npm run dev:server
```

Frontend:

```bash
npm run dev:client
```

## Environment Variables

Required:

```env
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CSRF_SECRET=
CLIENT_URL=
ENCRYPTION_KEY=
```

Optional:

```env
EMAIL_USER=
EMAIL_PASSWORD=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_TOKEN=
```

## Testing

```bash
npm test
npm run test:server
npm run test:client
```

## Deployment

### Frontend

Deploy on Vercel

### Backend

Deploy on Render

### Database

MongoDB Atlas

## Screenshots

Add screenshots here after deployment.

## Future Improvements

* AI Learning Insights
* Coding Streak Predictions
* Team Workspaces
* Project Portfolio Integration
* Advanced Analytics

## Author

Amarjeet

## License

This project is available for educational and portfolio purposes.
