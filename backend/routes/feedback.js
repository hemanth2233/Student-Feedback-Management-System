const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { protect, studentOnly } = require('../middleware/auth');

// POST /api/feedback - Student submits feedback
router.post('/', protect, studentOnly, async (req, res) => {
  try {
    const { teacherId, rating, teachingQuality, communication, availability, comment, semester } =
      req.body;

    if (!teacherId || !rating) {
      return res.status(400).json({ message: 'Teacher and rating are required' });
    }

    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const existing = await Feedback.findOne({ student: req.user._id, teacher: teacherId });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'You have already submitted feedback for this teacher' });
    }

    const feedback = await Feedback.create({
      student: req.user._id,
      teacher: teacherId,
      rating,
      teachingQuality,
      communication,
      availability,
      comment,
      semester,
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'You have already submitted feedback for this teacher' });
    }
    res.status(500).json({ message: error.message });
  }
});

// GET /api/feedback/my-submissions - Student sees their own submitted feedbacks
router.get('/my-submissions', protect, studentOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ student: req.user._id })
      .populate('teacher', 'name department subject')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/feedback/check/:teacherId - Check if student already gave feedback
router.get('/check/:teacherId', protect, studentOnly, async (req, res) => {
  try {
    const existing = await Feedback.findOne({
      student: req.user._id,
      teacher: req.params.teacherId,
    });
    res.json({ submitted: !!existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
