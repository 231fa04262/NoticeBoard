# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm run install-all
```

### Step 2: Setup Environment
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartnoticeboard
JWT_SECRET=change-this-secret-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### Step 3: Create Uploads Folder
```bash
mkdir uploads
```

### Step 4: Seed Admin User
```bash
npm run seed-admin
```

### Step 5: Start the Application
```bash
npm run dev-all
```

### Step 6: Access the App
- Open http://localhost:3000
- Login with:
  - Email: `admin@college.edu`
  - Password: `Admin@123`

## 📝 What's Next?

1. **Change Admin Password** - After first login, update your password
2. **Create Users** - Register faculty and students
3. **Post Notices** - Start creating notices
4. **Configure Email** (Optional) - Add email credentials for notifications

## 🎯 Key Features to Try

### As Admin:
- ✅ Filter notices by date range
- ✅ View analytics dashboard
- ✅ Schedule notices for future publishing
- ✅ Archive old notices
- ✅ Manage users

### As Faculty:
- ✅ Create departmental notices
- ✅ Upload attachments (PDFs, images)
- ✅ Track notice views
- ✅ Schedule notices

### As Student:
- ✅ Receive real-time notifications
- ✅ Acknowledge important notices
- ✅ Comment on notices
- ✅ Search and filter notices

## 📚 Full Documentation

See [SETUP.md](./SETUP.md) for detailed setup instructions and [README.md](./README.md) for complete documentation.

