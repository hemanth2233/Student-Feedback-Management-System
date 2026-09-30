import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = () => {
    if (!user) return [{ label: 'Public Ratings', to: '/ratings' }];
    if (user.role === 'student')
      return [
        { label: 'Dashboard', to: '/student' },
        { label: 'Public Ratings', to: '/ratings' },
      ];
    if (user.role === 'teacher')
      return [
        { label: 'My Stats', to: '/teacher' },
        { label: 'Public Ratings', to: '/ratings' },
      ];
    if (user.role === 'admin')
      return [
        { label: 'Admin Panel', to: '/admin' },
        { label: 'Public Ratings', to: '/ratings' },
      ];
    return [];
  };

  const roleColor = {
    student: '#1565c0',
    teacher: '#2e7d32',
    admin: '#e65100',
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.navInner}>
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>🎓</span>
          <div>
            <div style={styles.brandName}>FeedbackHub</div>
            <div style={styles.brandSub}>Student Feedback System</div>
          </div>
        </Link>

        <div style={styles.links}>
          {navLinks().map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...styles.link,
                ...(location.pathname === link.to ? styles.linkActive : {}),
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={styles.right}>
          {user ? (
            <div style={styles.userArea}>
              <div style={styles.userInfo}>
                <div style={styles.avatar}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={styles.userName}>{user.name}</div>
                  <div
                    style={{
                      ...styles.userRole,
                      color: roleColor[user.role] || '#546e7a',
                    }}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login" style={styles.loginBtn}>
                Login
              </Link>
              <Link to="/register" style={styles.registerBtn}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'white',
    borderBottom: '1px solid #e0ecf8',
    boxShadow: '0 2px 12px rgba(33,150,243,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    flexShrink: 0,
  },
  brandIcon: { fontSize: 28 },
  brandName: {
    fontFamily: 'Sora, sans-serif',
    fontWeight: 700,
    fontSize: 18,
    color: '#1a2540',
  },
  brandSub: { fontSize: 10, color: '#90a4ae', letterSpacing: 0.3 },
  links: { display: 'flex', gap: 4, alignItems: 'center' },
  link: {
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: '#546e7a',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  linkActive: {
    background: '#e3f2fd',
    color: '#1565c0',
    fontWeight: 600,
  },
  right: { flexShrink: 0 },
  userArea: { display: 'flex', alignItems: 'center', gap: 16 },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2196f3, #0288d1)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 15,
    fontFamily: 'Sora, sans-serif',
  },
  userName: { fontSize: 14, fontWeight: 600, color: '#1a2540' },
  userRole: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  logoutBtn: {
    padding: '7px 16px',
    borderRadius: 8,
    border: '1.5px solid #e0ecf8',
    background: 'white',
    color: '#e53935',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  loginBtn: {
    padding: '7px 16px',
    borderRadius: 8,
    border: '1.5px solid #e0ecf8',
    background: 'white',
    color: '#2196f3',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
  },
  registerBtn: {
    padding: '7px 16px',
    borderRadius: 8,
    background: '#2196f3',
    color: 'white',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
  },
};
