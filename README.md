# Smart College Notice Board & Communication Portal (SCNBCP)

A comprehensive MERN stack application for digital communication and information management in academic institutions.

## Features

- **Role-Based Access Control**: Admin, Faculty, and Student roles with different permissions
- **Real-Time Notifications**: Live updates using Socket.io
- **Notice Management**: Create, edit, delete, and schedule notices
- **Date Filtering**: Admin can filter notices by date range
- **File Uploads**: Support for PDFs and images
- **Email Notifications**: Automated email alerts for new notices
- **Analytics Dashboard**: Track notice engagement and views
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Real-Time**: Socket.io
- **Authentication**: JWT
- **File Storage**: Local (can be configured for AWS S3)

## Installation

1. Install backend dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Create a `.env` file in the root directory (see `.env.example`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartnoticeboard
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

4. Create the uploads directory:
```bash
mkdir uploads
```

5. Seed the admin user:
```bash
npm run seed-admin
```

6. Run the application:
```bash
# Run backend and frontend concurrently
npm run dev-all

# Or run separately:
npm run dev        # Backend only
npm run client     # Frontend only
```

## Default Admin Credentials

- Email: admin@college.edu
- Password: Admin@123

(Change these after first login!)

## Project Structure

```
SmartNoticeBoard/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── public/
└── package.json
```

