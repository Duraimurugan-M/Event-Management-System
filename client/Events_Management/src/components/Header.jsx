import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import HeaderCss from './Header.module.css';

function Header() {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      return token && userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();

  // Update header if localStorage changes in another tab/window
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');
        try {
          setUser(token && userJson ? JSON.parse(userJson) : null);
        } catch {
          setUser(null);
        }
      }
    };
    const onAuth = (e) => {
      // custom event dispatched from signin/signup in same tab - delay 800ms for visual effect
      setTimeout(() => {
        if (e?.detail?.user) setUser(e.detail.user);
        else {
          const token = localStorage.getItem('token');
          const userJson = localStorage.getItem('user');
          try { setUser(token && userJson ? JSON.parse(userJson) : null); } catch { setUser(null); }
        }
      }, 800);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth', onAuth);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth', onAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/signin');
  };

  const avatarInitials = user ? (user.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : user.email?.[0].toUpperCase()) : '';

  return (
    <div className={HeaderCss['parent-div']}>
      <h1 className={HeaderCss['head-text']}>Events Management Portal</h1>

      <div className={HeaderCss.rightArea}>
        <ul className={HeaderCss['ul-items']}>
          <li className={HeaderCss['list-items']}><Link to="/">Home</Link></li>
          {!user && (
            <>
              <li className={HeaderCss['list-items']}><Link to="/signup">Sign Up</Link></li>
              <li className={HeaderCss['list-items']}><Link to="/signin">Sign In</Link></li>
            </>
          )}
          {user && (
            <>
              <li className={HeaderCss['list-items']}><Link to="/events">Events</Link></li>
            </>
          )}
        </ul>

        {user ? (
          <div className={HeaderCss.profile}>
            <div className={HeaderCss.avatar}>{avatarInitials}</div>
            <div className={HeaderCss.info}>
              <div className={HeaderCss.name}>{user.name || user.email}</div>
              <div className={HeaderCss.role}>{user.role}</div>
            </div>
            <button className={HeaderCss.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Header