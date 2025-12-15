import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './MyRegistrations.module.css';
import { useNavigate } from 'react-router-dom';

function MyRegistrations(){
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user')) || null } catch { return null } })();
      if (!currentUser) { setError('Please sign in'); setLoading(false); return; }
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/registration-events/user/${currentUser._id || currentUser.id}/registrations`);
        setRegs(res.data || []);
      } catch (err) {
        console.error('Load my registrations', err);
        setError(err.response?.data?.message || err.message || 'Failed to load');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const cancel = async (registrationId) => {
    if (!confirm('Cancel your registration?')) return;
    try {
      await axios.put(`http://localhost:3000/registration-events/registration/${registrationId}/cancel`);
      setRegs(prev => prev.filter(r => String(r._id) !== String(registrationId)));
      alert('Cancelled');
    } catch (err) {
      console.error('Cancel error', err);
      alert(err.response?.data?.message || err.message || 'Failed');
    }
  };

  const markAttended = async (registrationId) => {
    try {
      await axios.put(`http://localhost:3000/registration-events/registration/${registrationId}/attend`);
      setRegs(prev => prev.map(r => r._id === registrationId ? { ...r, status: 'attended' } : r));
      alert('Marked attended');
    } catch (err) {
      console.error('Attend error', err);
      alert(err.response?.data?.message || err.message || 'Failed');
    }
  };

  return (
    <div className={styles.page}>
      <h1>My Registrations</h1>
      {loading && <p className={styles.message}>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && regs.length === 0 && (<p className={styles.message}>You have no registrations.</p>)}
      <ul className={styles.list}>
        {regs.map(reg => (
          <li key={reg._id} className={styles.item}>
            <div className={styles.left}>
              <div className={styles.title}>{reg.eventId?.title || 'Event'}</div>
              <div className={styles.meta}>{reg.eventId?.location || ''} • {reg.eventId?.date ? new Date(reg.eventId.date).toLocaleString() : 'TBA'}</div>
            </div>
            <div className={styles.right}>
              <div className={styles.status}>{reg.status}</div>
              <div className={styles.actions}>
                {reg.status !== 'cancelled' && <button className={styles.cancelBtn} onClick={() => cancel(reg._id)}>Cancel</button>}
                {reg.status !== 'attended' && <button className={styles.attendBtn} onClick={() => markAttended(reg._id)}>Mark Attended</button>}
                <button className={styles.viewBtn} onClick={() => navigate(`/events/${reg.eventId?._id || reg.eventId}`)}>View</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyRegistrations;
