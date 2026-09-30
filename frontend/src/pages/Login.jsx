import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrap}>🎓</div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={{ color: '#546e7a', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#2196f3', fontWeight: 600 }}>
              Register here
            </Link>
          </p>
          <p style={{ marginTop: 12, fontSize: 13, color: '#90a4ae' }}>
            <Link to="/ratings" style={{ color: '#90a4ae' }}>
              View public ratings without login →
            </Link>
          </p>
        </div>

        <div style={styles.demoBox}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#546e7a', marginBottom: 6 }}>
            DEMO ACCOUNTS (after seeding)
          </p>
          <div style={{ fontSize: 12, color: '#78909c', lineHeight: 1.8 }}>
            <div>Admin: admin@college.com / admin123</div>
            <div>Teacher: teacher@college.com / teacher123</div>
            <div>Student: student@college.com / student123</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: 40,
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 4px 32px rgba(33,150,243,0.12)',
    border: '1px solid #e0ecf8',
  },
  header: { textAlign: 'center', marginBottom: 28 },
  iconWrap: { fontSize: 48, marginBottom: 12 },
  title: {
    fontFamily: 'Sora, sans-serif',
    fontSize: 24,
    fontWeight: 700,
    color: '#1a2540',
    marginBottom: 4,
  },
  subtitle: { color: '#546e7a', fontSize: 14 },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #2196f3, #0288d1)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  footer: { textAlign: 'center', marginTop: 20 },
  demoBox: {
    marginTop: 24,
    padding: 14,
    background: '#f0f7ff',
    borderRadius: 10,
    border: '1px dashed #bbdefb',
  },
};
