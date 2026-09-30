import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import StarRating from '../components/StarRating';

export default function SubmitFeedback() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    rating: 0,
    teachingQuality: 0,
    communication: 0,
    availability: 0,
    comment: '',
    semester: '',
  });

  useEffect(() => {
    Promise.all([
      API.get('/teachers'),
      API.get(`/feedback/check/${teacherId}`),
    ])
      .then(([teachersRes, checkRes]) => {
        const found = teachersRes.data.find((t) => t._id === teacherId);
        setTeacher(found);
        setAlreadySubmitted(checkRes.data.submitted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [teacherId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) {
      toast.error('Please give an overall rating');
      return;
    }
    setSubmitting(true);
    try {
      await API.post('/feedback', { teacherId, ...form });
      toast.success('Feedback submitted successfully!');
      navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!teacher) return <div className="loading">Teacher not found</div>;

  if (alreadySubmitted) {
    return (
      <div className="container" style={{ maxWidth: 500, paddingTop: 40 }}>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
          <h2 style={{ fontFamily: 'Sora', marginBottom: 8 }}>Already Submitted</h2>
          <p style={{ color: '#546e7a' }}>
            You have already submitted feedback for {teacher.name}.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 20 }}
            onClick={() => navigate('/student')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 560, paddingBottom: 40 }}>
      <div className="page-header">
        <button
          onClick={() => navigate('/student')}
          style={{ background: 'none', border: 'none', color: '#2196f3', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}
        >
          ← Back to Dashboard
        </button>
        <h1>Submit Feedback</h1>
        <p>Your feedback is anonymous and helps improve teaching quality</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={styles.avatar}>{teacher.name.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 17, color: '#1a2540' }}>
              {teacher.name}
            </div>
            {teacher.department && (
              <div style={{ fontSize: 13, color: '#546e7a' }}>{teacher.department}</div>
            )}
            {teacher.subject && (
              <span style={styles.subjectTag}>{teacher.subject}</span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={styles.sectionTitle}>Overall Rating *</h3>
          <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} size={36} />
          {form.rating > 0 && (
            <div style={{ marginTop: 8, fontSize: 14, color: '#546e7a' }}>
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={styles.sectionTitle}>Detailed Ratings</h3>
          <div style={styles.ratingRow}>
            <label style={styles.ratingLabel}>Teaching Quality</label>
            <StarRating
              value={form.teachingQuality}
              onChange={(v) => setForm({ ...form, teachingQuality: v })}
              size={26}
            />
          </div>
          <div style={styles.ratingRow}>
            <label style={styles.ratingLabel}>Communication Skills</label>
            <StarRating
              value={form.communication}
              onChange={(v) => setForm({ ...form, communication: v })}
              size={26}
            />
          </div>
          <div style={styles.ratingRow}>
            <label style={styles.ratingLabel}>Availability & Support</label>
            <StarRating
              value={form.availability}
              onChange={(v) => setForm({ ...form, availability: v })}
              size={26}
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={styles.sectionTitle}>Additional Details</h3>
          <div className="form-group">
            <label>Semester (optional)</label>
            <input
              type="text"
              placeholder="e.g. Semester 4, 2024"
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Comments (optional)</label>
            <textarea
              rows={4}
              placeholder="Share your experience..."
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              maxLength={500}
              style={{ resize: 'vertical' }}
            />
            <div style={{ fontSize: 12, color: '#90a4ae', marginTop: 4, textAlign: 'right' }}>
              {form.comment.length}/500
            </div>
          </div>
        </div>

        <div style={styles.notice}>
          <span>🔒</span>
          <span>Your feedback is completely anonymous. Your name will not be shown to the teacher.</span>
        </div>

        <button
          type="submit"
          style={styles.submitBtn}
          disabled={submitting || form.rating === 0}
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2196f3, #0097a7)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 20,
    flexShrink: 0,
  },
  subjectTag: {
    display: 'inline-block',
    background: '#e3f2fd',
    color: '#1565c0',
    borderRadius: 20,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Sora, sans-serif',
    fontSize: 15,
    fontWeight: 600,
    color: '#1a2540',
    marginBottom: 16,
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f0f7ff',
  },
  ratingLabel: { fontSize: 14, color: '#546e7a', fontWeight: 500 },
  notice: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    background: '#e3f2fd',
    border: '1px solid #bbdefb',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 13,
    color: '#1565c0',
    marginBottom: 16,
  },
  submitBtn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #2196f3, #0288d1)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 0.3,
    opacity: 1,
  },
};
