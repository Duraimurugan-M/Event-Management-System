import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './RegistrationEvent.module.css';

function RegistrationEvent() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  })();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [evRes, regRes] = await Promise.all([
          axios.get(`http://localhost:3000/events/${id}`),
          axios.get(`http://localhost:3000/registration-events/event/${id}/registrations`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        const evt = evRes.data;
        setEvent(evt);
        setRegisteredUsers((regRes.data && regRes.data.registeredUsers) ? regRes.data.registeredUsers : []);
      } catch (err) {
        console.error('Load event/registrations error', err);
        setError(err.response?.data?.message || err.message || 'Failed to load');
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const isOwner = (() => {
    if (!currentUser || !event) return false;
    const ownerId = event.organizer && (typeof event.organizer === 'object' ? event.organizer._id : event.organizer);
    const userId = currentUser._id || currentUser.id || null;
    return Boolean(ownerId && userId && String(ownerId) === String(userId));
  })();

  const register = async () => {
    if (!currentUser) return alert('Please sign in to register');
    try {
      const res = await axios.post('http://localhost:3000/registration-events/register', { eventId: id, userId: (currentUser._id || currentUser.id) }, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // optimistic update
      const userObj = { userId: { _id: (currentUser._id || currentUser.id), name: currentUser.name, email: currentUser.email } };
      setRegisteredUsers(prev => prev.concat([userObj]));
      alert(res.data?.message || 'Registered');
    } catch (err) {
      console.error('Register error', err);
      alert(err.response?.data?.message || err.message || 'Failed to register');
    }
  };

  const cancelRegistration = async (registrationId) => {
    try {
      await axios.put(`http://localhost:3000/registration-events/registration/${registrationId}/cancel`);
      // remove from local list
      setRegisteredUsers(prev => prev.filter(r => String(r._id) !== String(registrationId)));
      alert('Registration cancelled');
    } catch (err) {
      console.error('Cancel registration error', err);
      alert(err.response?.data?.message || err.message || 'Failed to cancel');
    }
  };

  const markAttended = async (registrationId) => {
    try {
      const res = await axios.put(`http://localhost:3000/registration-events/registration/${registrationId}/attend`);
      // update local list status
      setRegisteredUsers(prev => prev.map(r => {
        if (String(r._id) === String(registrationId) || String(r.userId?._id) === String(registrationId)) {
          return { ...r, status: 'attended' };
        }
        return r;
      }));
      alert(res.data?.message || 'Marked as attended');
    } catch (err) {
      console.error('Mark attended error', err);
      alert(err.response?.data?.message || err.message || 'Failed to mark attended');
    }
  };

  const removeRegistration = async (registrationId) => {
    try {
      await axios.delete(`http://localhost:3000/registration-events/registration/${registrationId}`);
      setRegisteredUsers(prev => prev.filter(r => String(r._id) !== String(registrationId)));
      alert('Registration removed');
    } catch (err) {
      console.error('Remove registration error', err);
      alert(err.response?.data?.message || err.message || 'Failed to remove');
    }
  };

  const removeAll = async () => {
    if (!confirm('Remove all registrations for this event?')) return;
    try {
      await axios.delete(`http://localhost:3000/registration-events/event/${id}/registrations`);
      setRegisteredUsers([]);
      alert('All registrations removed');
    } catch (err) {
      console.error('Remove all error', err);
      alert(err.response?.data?.message || err.message || 'Failed to remove all');
    }
  };

  return (
    <div className={styles.page}>
      {loading && <p className={styles.message}>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {event && (
        <div className={styles.card}>
          <h1 className={styles.title}>{event.title}</h1>
          <p className={styles.when}>{event.date ? new Date(event.date).toLocaleString() : 'TBA'}</p>
          <p className={styles.desc}>{event.description}</p>
          <div className={styles.row}>
            <div className={styles.info}>Location: {event.location}</div>
            <div className={styles.info}>Seats: {(registeredUsers.length || 0)}/{event.capacity}</div>
            <div className={styles.info}>Organizer: {event.organizer?.name || event.organizer || '—'}</div>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.registerBtn}
              onClick={register}
              disabled={(registeredUsers.length || 0) >= (event.capacity || Infinity)}
            >{(registeredUsers.length || 0) >= (event.capacity || Infinity) ? 'Sold Out' : 'Register'}</button>
            {isOwner && (
              <button className={styles.removeAllBtn} onClick={removeAll}>Clear All</button>
            )}
          </div>

          {isOwner && (
            <section className={styles.regList}>
              <h3>Registered Users ({registeredUsers.length})</h3>
              {registeredUsers.length === 0 && <p className={styles.message}>No registrations yet.</p>}
              <ul>
                {registeredUsers.map(reg => {
                  const regId = reg._id || (reg.userId && reg.userId._id) || null;
                  const isRegistrant = currentUser && ((currentUser._id || currentUser.id) === String(reg.userId?._id || reg.userId));
                  return (
                    <li key={regId} className={styles.regItem}>
                      <div>
                        <div className={styles.regName}>{reg.userId?.name || reg.userId}</div>
                        <div className={styles.regEmail}>{reg.userId?.email || ''}</div>
                      </div>
                      <div className={styles.regActions}>
                        {reg.status === 'attended' && <span className={styles.attendedBadge}>Attended</span>}
                        {isRegistrant && (
                          <>
                            <button className={styles.cancelBtn} onClick={() => cancelRegistration(regId)}>Cancel</button>
                            <button className={styles.attendBtn} onClick={() => markAttended(regId)}>Mark Attended</button>
                          </>
                        )}
                        {isOwner && (
                          <>
                            <button className={styles.attendBtn} onClick={() => markAttended(regId)}>Mark Attended</button>
                            <button className={styles.removeBtn} onClick={() => removeRegistration(regId)}>Remove</button>
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default RegistrationEvent