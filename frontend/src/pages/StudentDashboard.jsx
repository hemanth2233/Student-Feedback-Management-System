import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { RatingDisplay } from '../components/StarRating';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teachers');

  useEffect(() => {
    Promise.all([
      API.get('/teachers'),
      API.get('/feedback/my-submissions'),
    ])
      .then(([t, s]) => {
        setTeachers(t.data);
        setSubmissions(s.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const submittedTeacherIds = submissions.map((s) => s.teacher?._id);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Welcome, {user.name}</h1>
        <p>
          {user.department && `${user.department} • `}Your feedback helps improve teaching quality
        </p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{teachers.length}</div>
          <div className="stat-label">Total Teachers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{submissions.length}</div>
          <div className="stat-label">Feedback Given</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#43a047' }}>
            {teachers.length - submissions.length}
          </div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'teachers' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('teachers')}
        >
          Give Feedback
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'history' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('history')}
        >
          My Submissions ({submissions.length})
        </button>
      </div>

      {activeTab === 'teachers' && (
        <div style={styles.grid}>
          {teachers.map((teacher) => {
            const done = submittedTeacherIds.includes(teacher._id);
            return (
              <div key={teacher._id} style={styles.card}>
                <div style={styles.cardHead}>
                  <div style={styles.avatar}>
                    {teacher.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={styles.tName}>{teacher.name}</div>
                    {teacher.department && (
                      <div style={styles.tDept}>{teacher.department}</div>
                    )}
                    {teacher.subject && (
                      <span style={styles.subjectTag}>{teacher.subject}</span>
                    )}
                  </div>
                </div>
                {done ? (
                  <div style={styles.doneBadge}>Feedback Submitted</div>
                ) : (
                  <Link to={`/student/feedback/${teacher._id}`} style={styles.feedbackBtn}>
                    Give Feedback
                  </Link>
                )}
              </div>
            );
          })}
          {teachers.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">👩‍🏫</div>
              <p>No teachers registered yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ marginBottom: 40 }}>
          {submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>You haven't submitted any feedback yet</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {submissions.map((sub) => (
                <div key={sub._id} style={styles.card}>
                  <div style={styles.cardHead}>
                    <div style={styles.avatar}>
                      {sub.teacher?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={styles.tName}>{sub.teacher?.name}</div>
                      {sub.teacher?.subject && (
                        <span style={styles.subjectTag}>{sub.teacher.subject}</span>
                      )}
                    </div>
                  </div>
                  <RatingDisplay value={sub.rating} size={13} />
                  {sub.comment && (
                    <p style={styles.comment}>"{sub.comment}"</p>
                  )}
                  <div style={styles.date}>
                    {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  tabs: { display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #e0ecf8' },
  tab: {
    padding: '10px 20px',
    border: 'none',
    background: 'none',
    fontSize: 14,
    fontWeight: 600,
    color: '#546e7a',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    transition: 'all 0.2s',
  },
  tabActive: { color: '#2196f3', borderBottom: '2px solid #2196f3' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 18,
    paddingBottom: 40,
  },
  card: {
    background: 'white',
    borderRadius: 14,
    padding: 20,
    border: '1px solid #e0ecf8',
    boxShadow: '0 2px 12px rgba(33,150,243,0.07)',
  },
  cardHead: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2196f3, #0097a7)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 17,
    flexShrink: 0,
  },
  tName: { fontWeight: 700, color: '#1a2540', fontSize: 15 },
  tDept: { fontSize: 12, color: '#546e7a', marginTop: 2 },
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
  feedbackBtn: {
    display: 'block',
    width: '100%',
    padding: '9px 0',
    background: 'linear-gradient(135deg, #2196f3, #0288d1)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  doneBadge: {
    textAlign: 'center',
    padding: '9px 0',
    background: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
  },
  comment: {
    fontSize: 13,
    color: '#546e7a',
    fontStyle: 'italic',
    margin: '10px 0 6px',
    lineHeight: 1.5,
  },
  date: { fontSize: 12, color: '#90a4ae', marginTop: 6 },
};
