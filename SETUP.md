# Smart College Notice Board & Communication Portal - Setup Guide

## Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud database)
3. **Git** (optional)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartnoticeboard
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000

# Email Configuration (Optional - for email notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**For MongoDB Atlas (Cloud):**
- Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string
- Replace `MONGODB_URI` with your Atlas connection string

**For Email Notifications:**
- For Gmail: Use an [App Password](https://support.google.com/accounts/answer/185833)
- Email notifications are optional - the app will work without them

### 3. Create Uploads Directory

```bash
mkdir uploads
```

### 4. Seed Admin User

Run the seed script to create the default admin user:

```bash
node backend/utils/seedAdmin.js
```

**Default Admin Credentials:**
- Email: `admin@college.edu`
- Password: `Admin@123`

**⚠️ IMPORTANT:** Change these credentials after first login!

### 5. Start the Application

**Option 1: Run both backend and frontend together**
```bash
npm run dev-all
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run client
```

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage Guide

### Admin Features

1. **Login** with admin credentials
2. **Create Notices** - Click "Create Notice" button
3. **Filter Notices by Date** - Use the date filter in the admin dashboard
4. **Manage Users** - View and manage all users
5. **View Analytics** - See notice engagement statistics
6. **Archive Notices** - Archive old notices
7. **Schedule Notices** - Set future publication dates

### Faculty Features

1. **Register** as faculty or login
2. **Create Notices** - Post departmental or class-specific notices
3. **Attach Files** - Upload PDFs, images, or documents
4. **Track Views** - See how many students viewed your notices
5. **Manage Your Notices** - Edit or delete your own notices

### Student Features

1. **Register** as student or login
2. **View Personalized Notices** - See notices relevant to your department/year/course
3. **Real-Time Updates** - Get instant notifications for new notices
4. **Acknowledge Notices** - Mark important notices as acknowledged
5. **Comment on Notices** - Ask questions or provide feedback
6. **Search & Filter** - Find notices by category or search term

## Project Structure

```
SmartNoticeBoard/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── authController.js   # Authentication logic
│   └── noticeController.js # Notice CRUD operations
│   ├── middleware/       # Auth & file upload middleware
│   ├── models/          # MongoDB models
│   │   ├── User.js
│   │   └── Notice.js
│   ├── routes/          # API routes
│   ├── utils/          # Utilities (email, scheduled notices)
│   └── server.js        # Main server file
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/  # Reusable components
│       ├── context/     # React context (Auth, Socket)
│       ├── pages/       # Page components
│       └── App.js       # Main app component
├── uploads/            # File uploads directory
├── .env                # Environment variables
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Notices
- `GET /api/notices` - Get all notices (with filters)
- `GET /api/notices/:id` - Get single notice
- `POST /api/notices` - Create notice (Admin/Faculty)
- `PUT /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice
- `PATCH /api/notices/:id/archive` - Archive notice (Admin)
- `POST /api/notices/:id/comment` - Add comment
- `POST /api/notices/:id/acknowledge` - Acknowledge notice

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Analytics (Admin only)
- `GET /api/analytics` - Get analytics data

## Features Implemented

✅ Role-based authentication (Admin, Faculty, Student)
✅ JWT token-based security
✅ Notice CRUD operations
✅ Date-based filtering for admin
✅ Real-time notifications (Socket.io)
✅ File uploads (PDFs, images)
✅ Email notifications (optional)
✅ Notice scheduling
✅ Comments and acknowledgments
✅ Analytics dashboard
✅ Responsive design
✅ Search and filter functionality

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For local MongoDB: `mongodb://localhost:27017/smartnoticeboard`

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using the port

### Email Not Working
- Email is optional - app works without it
- Check your email credentials in `.env`
- For Gmail, use App Password, not regular password

### File Upload Issues
- Ensure `uploads/` directory exists
- Check file size limits (max 10MB)
- Verify file types are allowed

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Use MongoDB Atlas or secure MongoDB instance
4. Configure proper CORS settings
5. Use a cloud storage service (AWS S3) for file uploads
6. Deploy backend to services like Render, Heroku, or AWS
7. Deploy frontend to Vercel, Netlify, or similar

## Support

For issues or questions, check the code comments or create an issue in the repository.

