import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { RatingDisplay } from '../components/StarRating';

export default function PublicRatings() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    API.get('/public/ratings')
      .then(({ data }) => setRatings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = ratings
    .filter((r) => {
      const name = r.teacher?.name?.toLowerCase() || '';
      const dept = r.teacher?.department?.toLowerCase() || '';
      const subj = r.teacher?.subject?.toLowerCase() || '';
      const q = search.toLowerCase();
      return name.includes(q) || dept.includes(q) || subj.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.avgRating - a.avgRating;
      if (sortBy === 'feedback') return b.totalFeedbacks - a.totalFeedbacks;
      return (a.teacher?.name || '').localeCompare(b.teacher?.name || '');
    });

  return (
    <div className="container">
      <div className="page-header">
        <h1>Public Teacher Ratings</h1>
        <p>Overall ratings based on anonymous student feedback</p>
      </div>

      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search by name, department or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={styles.sortSelect}
        >
          <option value="rating">Sort: Highest Rated</option>
          <option value="feedback">Sort: Most Feedback</option>
          <option value="name">Sort: A - Z</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading ratings...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No teachers found</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((item, idx) => (
            <TeacherRatingCard key={item._id || idx} item={item} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function TeacherRatingCard({ item, rank }) {
  const t = item.teacher || {};
  const avg = item.avgRating || 0;

  const getRankStyle = () => {
    if (rank === 1) return { background: '#fff8e1', border: '2px solid #ffd54f' };
    if (rank === 2) return { background: '#f5f5f5', border: '2px solid #bdbdbd' };
    if (rank === 3) return { background: '#fff3e0', border: '2px solid #ffb74d' };
    return {};
  };

  return (
    <div style={{ ...styles.card, ...getRankStyle() }}>
      <div style={styles.cardTop}>
        <div style={styles.rankBadge(rank)}>#{rank}</div>
        <div style={styles.avatar}>{(t.name || '?').charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={styles.teacherName}>{t.name || 'Unknown'}</div>
          {t.department && <div style={styles.dept}>{t.department}</div>}
          {t.subject && <div style={styles.subject}>{t.subject}</div>}
        </div>
      </div>

      <div style={styles.ratingRow}>
        <RatingDisplay value={avg} size={14} />
      </div>

      {item.totalFeedbacks > 0 && (
        <div style={styles.subStats}>
          <StatPill label="Teaching" value={item.avgTeaching} />
          <StatPill label="Communication" value={item.avgCommunication} />
          <StatPill label="Availability" value={item.avgAvailability} />
        </div>
      )}

      <div style={styles.feedbackCount}>
        {item.totalFeedbacks > 0
          ? `${item.totalFeedbacks} student${item.totalFeedbacks !== 1 ? 's' : ''} rated`
          : 'No feedback yet'}
      </div>
    </div>
  );
}

function StatPill({ label, value }) {
  if (!value) return null;
  return (
    <div style={styles.pill}>
      <span style={styles.pillLabel}>{label}</span>
      <span style={styles.pillValue}>{value.toFixed(1)}</span>
    </div>
  );
}

const styles = {
  controls: {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  search: {
    flex: 1,
    minWidth: 200,
    padding: '10px 16px',
    border: '1.5px solid #e0ecf8',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    background: 'white',
  },
  sortSelect: {
    padding: '10px 14px',
    border: '1.5px solid #e0ecf8',
    borderRadius: 10,
    fontSize: 14,
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
    paddingBottom: 40,
  },
  card: {
    background: 'white',
    borderRadius: 14,
    padding: 20,
    boxShadow: '0 2px 12px rgba(33,150,243,0.08)',
    border: '1px solid #e0ecf8',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  rankBadge: (rank) => ({
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: rank <= 3 ? '#2196f3' : '#e0ecf8',
    color: rank <= 3 ? 'white' : '#546e7a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  }),
  avatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2196f3, #0097a7)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 18,
    fontFamily: 'Sora, sans-serif',
    flexShrink: 0,
  },
  teacherName: {
    fontFamily: 'Sora, sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: '#1a2540',
  },
  dept: { fontSize: 12, color: '#546e7a', marginTop: 2 },
  subject: {
    fontSize: 12,
    color: '#2196f3',
    fontWeight: 600,
    marginTop: 2,
    background: '#e3f2fd',
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 20,
  },
  ratingRow: { marginBottom: 12 },
  subStats: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  pill: {
    background: '#f0f7ff',
    borderRadius: 20,
    padding: '3px 10px',
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  pillLabel: { fontSize: 11, color: '#546e7a' },
  pillValue: { fontSize: 11, fontWeight: 700, color: '#2196f3' },
  feedbackCount: { fontSize: 12, color: '#90a4ae', marginTop: 4 },
};
