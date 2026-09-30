const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { protect, teacherOnly } = require('../middleware/auth');

// GET /api/teachers - Get all teachers (for students to see)
router.get('/', protect, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/teachers/my-stats - Teacher sees own rating (no student names)
router.get('/my-stats', protect, teacherOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ teacher: req.user._id });

    if (feedbacks.length === 0) {
      return res.json({
        totalFeedbacks: 0,
        averageRating: 0,
        teachingQuality: 0,
        communication: 0,
        availability: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recentComments: [],
      });
    }

    const totalFeedbacks = feedbacks.length;
    const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks;
    const avgTeaching =
      feedbacks.filter((f) => f.teachingQuality).reduce((sum, f) => sum + f.teachingQuality, 0) /
      (feedbacks.filter((f) => f.teachingQuality).length || 1);
    const avgComm =
      feedbacks.filter((f) => f.communication).reduce((sum, f) => sum + f.communication, 0) /
      (feedbacks.filter((f) => f.communication).length || 1);
    const avgAvail =
      feedbacks.filter((f) => f.availability).reduce((sum, f) => sum + f.availability, 0) /
      (feedbacks.filter((f) => f.availability).length || 1);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach((f) => distribution[f.rating]++);

    // Only show comments, NOT student names
    const recentComments = feedbacks
      .filter((f) => f.comment)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map((f) => ({
        comment: f.comment,
        rating: f.rating,
        semester: f.semester,
        date: f.createdAt,
      }));

    res.json({
      totalFeedbacks,
      averageRating: Math.round(avgRating * 10) / 10,
      teachingQuality: Math.round(avgTeaching * 10) / 10,
      communication: Math.round(avgComm * 10) / 10,
      availability: Math.round(avgAvail * 10) / 10,
      ratingDistribution: distribution,
      recentComments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
