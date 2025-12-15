import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import styles from './Signin.module.css';
import axios from 'axios';

function Signin() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            // Ensure payload keys match server's login expectations: email and password
            const payload = {
                email: form.email,
                password: form.password,
            };

      const res = await axios.post('http://localhost:3000/auth/users/signin', payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Save token and user if provided
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (res.data && res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        // notify same-tab listeners that auth changed
        try { window.dispatchEvent(new CustomEvent('auth', { detail: { user: res.data.user } })); } catch { /* ignore */ }
      }

      setSuccess(res.data && res.data.message ? res.data.message : 'Signin successful');
      setForm({ email: '', password: '' });

      // Redirect will be handled by useEffect after success
    } catch (err) {
      // axios error handling
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Signin failed');
      }
      console.error('Signin error:', err);
    } finally {
        setLoading(false);
      }
    };

  // Redirect to home/dashboard after successful signin
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => navigate('/'), 800);
    return () => clearTimeout(t);
  }, [success, navigate]);
 
  return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>
        <h2 className={styles.title}>Welcome Back</h2>
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="on">
          <label className={styles.label}>
            Email
            <input className={styles.input} type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label className={styles.label}>
            Password
            <input className={styles.input} type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>

          <button type="submit" className={styles.submit} disabled={loading}>{loading ? 'Signing...' : 'Sign In'}</button>
        </form>

        {error && <p style={{ color: '#b91c1c', marginTop: 12 }}>{error}</p>}
        {success && <p style={{ color: '#064e3b', marginTop: 12 }}>{success}</p>}

        <p className={styles.footerText}>
          Don't have an account? <Link to="/signup" className={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  )
};

export default Signin