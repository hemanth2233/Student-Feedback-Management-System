// seed.js - Run once to create demo users
// Usage: node seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/feedback_system';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  department: String,
  subject: String,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

const users = [
  { name: 'Admin User', email: 'admin@college.com', password: 'admin123', role: 'admin', department: 'Administration' },
  { name: 'Prof. Sharma', email: 'teacher@college.com', password: 'teacher123', role: 'teacher', department: 'Computer Science', subject: 'Data Structures' },
  { name: 'Prof. Gupta', email: 'gupta@college.com', password: 'teacher123', role: 'teacher', department: 'Mathematics', subject: 'Linear Algebra' },
  { name: 'Prof. Verma', email: 'verma@college.com', password: 'teacher123', role: 'teacher', department: 'Physics', subject: 'Quantum Mechanics' },
  { name: 'Prof. Singh', email: 'singh@college.com', password: 'teacher123', role: 'teacher', department: 'Computer Science', subject: 'Database Management' },
  { name: 'Student One', email: 'student@college.com', password: 'student123', role: 'student', department: 'Computer Science' },
  { name: 'Rahul Mehta', email: 'rahul@college.com', password: 'student123', role: 'student', department: 'Computer Science' },
  { name: 'Priya Joshi', email: 'priya@college.com', password: 'student123', role: 'student', department: 'Mathematics' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    for (const u of users) {
      const user = new User(u);
      await user.save();
      console.log(`Created: ${u.role} - ${u.email}`);
    }

    console.log('\nSeeding complete!');
    console.log('\nDemo Credentials:');
    console.log('Admin:   admin@college.com / admin123');
    console.log('Teacher: teacher@college.com / teacher123');
    console.log('Student: student@college.com / student123');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
