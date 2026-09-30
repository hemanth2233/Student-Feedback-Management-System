import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { RatingDisplay } from '../components/StarRating';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/teachers/my-stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading your stats...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Feedback Stats</h1>
        <p>
          {user.department && `${user.department} • `}
          {user.subject && `${user.subject} • `}
          Student names are kept anonymous
        </p>
      </div>

      {!stats || stats.totalFeedbacks === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>No feedback received yet</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            Students will submit feedback and it will appear here
          </p>
        </div>
      ) : (
        <>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <div className="stat-card">
              <div className="stat-value">{stats.averageRating}</div>
              <div className="stat-label">Overall Rating</div>
              <div style={{ marginTop: 6 }}>
                <RatingDisplay value={stats.averageRating} showNumber={false} size={13} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalFeedbacks}</div>
              <div className="stat-label">Total Responses</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#43a047' }}>
                {stats.teachingQuality || 'N/A'}
              </div>
              <div className="stat-label">Teaching Quality</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#0097a7' }}>
                {stats.communication || 'N/A'}
              </div>
              <div className="stat-label">Communication</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#fb8c00' }}>
                {stats.availability || 'N/A'}
              </div>
              <div className="stat-label">Availability</div>
            </div>
          </div>

          <div style={styles.gridTwo}>
            <div className="card">
              <h3 style={styles.cardTitle}>Rating Distribution</h3>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.ratingDistribution[star] || 0;
                const pct = stats.totalFeedbacks > 0 ? (count / stats.totalFeedbacks) * 100 : 0;
                return (
                  <div className="rating-bar-wrap" key={star}>
                    <span className="bar-label">{star}★</span>
                    <div className="rating-bar-bg">
                      <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="bar-count">{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="card">
              <h3 style={styles.cardTitle}>Performance Overview</h3>
              {[
                { label: 'Teaching Quality', value: stats.teachingQuality, color: '#43a047' },
                { label: 'Communication', value: stats.communication, color: '#0097a7' },
                { label: 'Availability', value: stats.availability, color: '#fb8c00' },
                { label: 'Overall Rating', value: stats.averageRating, color: '#2196f3' },
              ].map((item) => (
                <div key={item.label} style={styles.perfRow}>
                  <span style={styles.perfLabel}>{item.label}</span>
                  <div style={styles.perfBarBg}>
                    <div
                      style={{
                        ...styles.perfBarFill,
                        width: `${((item.value || 0) / 5) * 100}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                  <span style={{ ...styles.perfVal, color: item.color }}>
                    {item.value ? item.value.toFixed(1) : '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {stats.recentComments?.length > 0 && (
            <div className="card" style={{ marginTop: 24, marginBottom: 40 }}>
              <h3 style={styles.cardTitle}>Student Comments (Anonymous)</h3>
              <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
                {stats.recentComments.map((c, i) => (
                  <div key={i} style={styles.commentCard}>
                    <div style={styles.commentHeader}>
                      <RatingDisplay value={c.rating} showNumber={false} size={12} />
                      {c.semester && (
                        <span style={styles.semesterTag}>{c.semester}</span>
                      )}
                      <span style={styles.commentDate}>
                        {new Date(c.date).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p style={styles.commentText}>"{c.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20,
    marginTop: 8,
  },
  cardTitle: {
    fontFamily: 'Sora, sans-serif',
    fontSize: 15,
    fontWeight: 600,
    color: '#1a2540',
    marginBottom: 16,
  },
  perfRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  perfLabel: { fontSize: 13, color: '#546e7a', width: 130, flexShrink: 0 },
  perfBarBg: {
    flex: 1,
    height: 8,
    background: '#e0ecf8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  perfBarFill: { height: '100%', borderRadius: 4, transition: 'width 0.6s ease' },
  perfVal: { width: 28, fontSize: 13, fontWeight: 700, textAlign: 'right' },
  commentCard: {
    background: '#f8fbff',
    borderRadius: 10,
    padding: 14,
    border: '1px solid #e0ecf8',
  },
  commentHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  semesterTag: {
    background: '#e3f2fd',
    color: '#1565c0',
    borderRadius: 20,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
  },
  commentDate: { fontSize: 11, color: '#90a4ae', marginLeft: 'auto' },
  commentText: { fontSize: 14, color: '#546e7a', fontStyle: 'italic', lineHeight: 1.5 },
};
