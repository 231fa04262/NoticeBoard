require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'User'));

const MONGO =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/smartnoticeboard';
const EMAIL = 'admin@example.com';
const TEST_PASSWORD = 'NewAdmin123!';

(async function run() {
  await mongoose.connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const user = await User.findOne({ email: EMAIL }).lean();
  if (!user) {
    console.log('User not found:', EMAIL);
    await mongoose.disconnect();
    return;
  }
  console.log('Found user:', {
    email: user.email,
    hashPresent: !!user.password,
  });
  console.log(
    'Password match:',
    await bcrypt.compare(TEST_PASSWORD, user.password || '')
  );
  await mongoose.disconnect();
})();
