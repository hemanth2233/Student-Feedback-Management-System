import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { RatingDisplay } from '../components/StarRating';

const TABS = ['Overview', 'All Feedbacks', 'Teachers', 'Students'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [dashboard, setDashboard] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [teacherSummary, setTeacherSummary] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTeacher, setFilterTeacher] = useState('');

  const fetchDashboard = () => API.get('/admin/dashboard').then(({ data }) => setDashboard(data));
  const fetchFeedbacks = (teacherId = '') =>
    API.get(`/admin/feedbacks${teacherId ? `?teacherId=${teacherId}` : ''}`).then(({ data }) =>
      setFeedbacks(data.feedbacks)
    );
  const fetchTeacherSummary = () =>
    API.get('/admin/teacher-summary').then(({ data }) => setTeacherSummary(data));
  const fetchUsers = (role) =>
    API.get(`/admin/users${role ? `?role=${role}` : ''}`).then(({ data }) => setUsers(data));

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchFeedbacks(), fetchTeacherSummary()])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'Students') fetchUsers('student').catch(console.error);
    if (activeTab === 'Teachers') fetchUsers('teacher').catch(console.error);
  }, [activeTab]);

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await API.delete(`/admin/feedbacks/${id}`);
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      toast.success('Feedback deleted');
      fetchDashboard();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user? All their feedback will also be removed.')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
      fetchDashboard();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleFilterTeacher = async (e) => {
    const tid = e.target.value;
    setFilterTeacher(tid);
    await fetchFeedbacks(tid);
  };

  if (loading) return <div className="loading">Loading admin panel...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Full visibility over all feedback, users, and ratings</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{dashboard?.totalStudents || 0}</div>
          <div className="stat-label">Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#2e7d32' }}>
            {dashboard?.totalTeachers || 0}
          </div>
          <div className="stat-label">Teachers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#e65100' }}>
            {dashboard?.totalFeedbacks || 0}
          </div>
          <div className="stat-label">Total Feedbacks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0097a7' }}>
            {teacherSummary.length > 0
              ? (teacherSummary.reduce((s, t) => s + t.avgRating, 0) / teacherSummary.length).toFixed(1)
              : 'N/A'}
          </div>
          <div className="stat-label">College Avg Rating</div>
        </div>
      </div>

      <div style={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div>
          <h3 style={styles.sectionTitle}>Teacher Summary (Ranked by Rating)</h3>
          <div style={{ overflowX: 'auto', marginBottom: 32 }}>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Teacher</th>
                  <th>Department</th>
                  <th>Subject</th>
                  <th>Avg Rating</th>
                  <th>Teaching</th>
                  <th>Communication</th>
                  <th>Availability</th>
                  <th>Responses</th>
                </tr>
              </thead>
              <tbody>
                {teacherSummary.map((item, idx) => (
                  <tr key={item._id}>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: idx < 3 ? '#2196f3' : '#546e7a',
                        }}
                      >
                        #{idx + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={styles.miniAvatar}>
                          {item.teacher?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{item.teacher?.name}</span>
                      </div>
                    </td>
                    <td>{item.teacher?.department || '-'}</td>
                    <td>{item.teacher?.subject || '-'}</td>
                    <td>
                      <RatingDisplay value={item.avgRating || 0} size={12} />
                    </td>
                    <td>{item.avgTeaching ? item.avgTeaching.toFixed(1) : '-'}</td>
                    <td>{item.avgCommunication ? item.avgCommunication.toFixed(1) : '-'}</td>
                    <td>{item.avgAvailability ? item.avgAvailability.toFixed(1) : '-'}</td>
                    <td>
                      <span style={styles.countBadge}>{item.totalFeedbacks}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={styles.sectionTitle}>Recent Feedback Activity</h3>
          <div style={{ overflowX: 'auto', marginBottom: 40 }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Teacher</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard?.recentFeedbacks || []).map((fb) => (
                  <tr key={fb._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{fb.student?.name}</div>
                        <div style={{ fontSize: 11, color: '#90a4ae' }}>{fb.student?.email}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{fb.teacher?.name}</div>
                      {fb.teacher?.subject && (
                        <div style={{ fontSize: 11, color: '#2196f3' }}>{fb.teacher.subject}</div>
                      )}
                    </td>
                    <td>
                      <RatingDisplay value={fb.rating} showNumber={false} size={12} />
                    </td>
                    <td style={{ maxWidth: 200, fontSize: 13, color: '#546e7a' }}>
                      {fb.comment || <span style={{ color: '#ccc' }}>—</span>}
                    </td>
                    <td style={{ fontSize: 12, color: '#90a4ae', whiteSpace: 'nowrap' }}>
                      {new Date(fb.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'All Feedbacks' && (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <select
              value={filterTeacher}
              onChange={handleFilterTeacher}
              style={styles.filterSelect}
            >
              <option value="">All Teachers</option>
              {teacherSummary.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.teacher?.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ overflowX: 'auto', marginBottom: 40 }}>
            <table>
              <thead>
                <tr>
                  <th>Student (Visible to Admin)</th>
                  <th>Email</th>
                  <th>Teacher</th>
                  <th>Rating</th>
                  <th>Teaching</th>
                  <th>Comm.</th>
                  <th>Avail.</th>
                  <th>Comment</th>
                  <th>Semester</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((fb) => (
                  <tr key={fb._id}>
                    <td style={{ fontWeight: 600 }}>{fb.student?.name}</td>
                    <td style={{ fontSize: 12, color: '#546e7a' }}>{fb.student?.email}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{fb.teacher?.name}</div>
                    </td>
                    <td>
                      <RatingDisplay value={fb.rating} showNumber={false} size={12} />
                    </td>
                    <td>{fb.teachingQuality || '-'}</td>
                    <td>{fb.communication || '-'}</td>
                    <td>{fb.availability || '-'}</td>
                    <td style={{ maxWidth: 160, fontSize: 12, color: '#546e7a' }}>
                      {fb.comment || '—'}
                    </td>
                    <td style={{ fontSize: 12 }}>{fb.semester || '—'}</td>
                    <td style={{ fontSize: 11, color: '#90a4ae', whiteSpace: 'nowrap' }}>
                      {new Date(fb.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteFeedback(fb._id)}
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {feedbacks.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', color: '#90a4ae', padding: 32 }}>
                      No feedbacks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(activeTab === 'Teachers' || activeTab === 'Students') && (
        <div style={{ marginBottom: 40 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                {activeTab === 'Teachers' && <th>Subject</th>}
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={styles.miniAvatar}>{u.name.charAt(0).toUpperCase()}</div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: '#546e7a' }}>{u.email}</td>
                  <td>{u.department || '—'}</td>
                  {activeTab === 'Teachers' && <td>{u.subject || '—'}</td>}
                  <td style={{ fontSize: 12, color: '#90a4ae' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <button onClick={() => handleDeleteUser(u._id)} style={styles.deleteBtn}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: 'center', color: '#90a4ae', padding: 32 }}
                  >
                    No {activeTab.toLowerCase()} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid #e0ecf8', flexWrap: 'wrap' },
  tab: {
    padding: '10px 18px',
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
  sectionTitle: {
    fontFamily: 'Sora, sans-serif',
    fontSize: 16,
    fontWeight: 600,
    color: '#1a2540',
    marginBottom: 14,
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2196f3, #0097a7)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 13,
    flexShrink: 0,
  },
  countBadge: {
    background: '#e3f2fd',
    color: '#1565c0',
    borderRadius: 20,
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 700,
  },
  filterSelect: {
    padding: '9px 14px',
    border: '1.5px solid #e0ecf8',
    borderRadius: 8,
    fontSize: 13,
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
    minWidth: 200,
  },
  deleteBtn: {
    padding: '5px 12px',
    background: '#ffebee',
    color: '#e53935',
    border: '1px solid #ffcdd2',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};
