const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Feedback = require('../models/Feedback');

// GET /api/public/ratings - Public teacher ratings (no student info)
router.get('/ratings', async (req, res) => {
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
          'teacher.email': 0,
        },
      },
      { $sort: { avgRating: -1 } },
    ]);

    // Also include teachers with 0 feedback
    const allTeachers = await User.find({ role: 'teacher' }).select('-password -email');
    const teacherIdsWithFeedback = summary.map((s) => s._id.toString());
    const teachersWithoutFeedback = allTeachers
      .filter((t) => !teacherIdsWithFeedback.includes(t._id.toString()))
      .map((t) => ({
        _id: t._id,
        teacher: t,
        avgRating: 0,
        totalFeedbacks: 0,
        avgTeaching: 0,
        avgCommunication: 0,
        avgAvailability: 0,
      }));

    res.json([...summary, ...teachersWithoutFeedback]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
