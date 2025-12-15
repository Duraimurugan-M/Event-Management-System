import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import styles from './Signup.module.css';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';

function Signup() {
  
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
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
      // Ensure payload keys match server's User model: name, email, password, role
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      const res = await axios.post('http://localhost:3000/auth/users/signup', payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      setSuccess(res.data && res.data.message ? res.data.message : 'Signup successful');
      setForm({ name: '', email: '', password: '', role: 'user' });
    } catch (err) {
      // axios error handling
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Signup failed');
      }
      console.error('Signup error:', err);
    } finally {
        setLoading(false);
      }
    };

    // Redirect to signin after successful signup
    useEffect(() => {
      if (!success) return;
      const t = setTimeout(() => {
        navigate('/signin');
      }, 800);
      return () => clearTimeout(t);
    }, [success, navigate]);

    return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create Account</h2>
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="on">
          <label className={styles.label}>
            Name
            <input className={styles.input} name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label className={styles.label}>
            Email
            <input className={styles.input} type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label className={styles.label}>
            Password
            <input className={styles.input} type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
          </label>

          <button type="submit" className={styles.submit} disabled={loading}>{loading ? 'Signing...' : 'Sign Up'}</button>
        </form>

        {error && <p style={{ color: '#b91c1c', marginTop: 12 }}>{error}</p>}
        {success && <p style={{ color: '#064e3b', marginTop: 12 }}>{success}</p>}

        <p className={styles.footerText}>
          Already have an account? <Link to="/signin" className={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup