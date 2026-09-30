const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/admin/dashboard - Admin dashboard stats
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalFeedbacks = await Feedback.countDocuments();

    const recentFeedbacks = await Feedback.find()
      .populate('student', 'name email')
      .populate('teacher', 'name department subject')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ totalStudents, totalTeachers, totalFeedbacks, recentFeedbacks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/feedbacks - All feedbacks with student names (admin only)
router.get('/feedbacks', protect, adminOnly, async (req, res) => {
  try {
    const { teacherId, page = 1, limit = 20 } = req.query;
    const query = teacherId ? { teacher: teacherId } : {};

    const feedbacks = await Feedback.find(query)
      .populate('student', 'name email department')
      .populate('teacher', 'name department subject')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.json({ feedbacks, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users - All users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin' });

    await User.findByIdAndDelete(req.params.id);
    if (user.role === 'teacher') {
      await Feedback.deleteMany({ teacher: req.params.id });
    }
    if (user.role === 'student') {
      await Feedback.deleteMany({ student: req.params.id });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/feedbacks/:id - Delete specific feedback
router.delete('/feedbacks/:id', protect, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/teacher-summary - Summary per teacher
router.get('/teacher-summary', protect, adminOnly, async (req, res) => {
  try {
    const summary = await Feedback.aggregate([
      {
        $group: {
          _id: '$teacher',
          avgRating: { $avg: '$rating' },
          totalFeedbacks: { $sum: 1 },
          avgTeaching: { $avg: '$teachingQuality' },
          avgCommunication: { $avg: '$communication' },
          avgAvailability: { $avg: '$availability' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'teacher',
        },
      },
      { $unwind: '$teacher' },
      {
        $project: {
          'teacher.password': 0,
        },
      },
      { $sort: { avgRating: -1 } },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
