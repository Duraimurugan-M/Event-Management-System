import React, { useState, useEffect } from 'react'
import EventsPageCss from './EventsPage.module.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchEvents = async () => {
        setLoading(true);
        setError('');
        try {
            // Use the registration endpoint which returns events with registered users
            const response = await axios.get('http://localhost:3000/registration-events/all-registered-events', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const results = Array.isArray(response.data) ? response.data : [];
            // Map to a flat event object but keep registeredUsers array and registeredCount
            const mapped = results.map(r => {
                const evt = r.event || {};
                return { ...evt, registeredUsers: Array.isArray(r.registeredUsers) ? r.registeredUsers : [], registeredCount: Array.isArray(r.registeredUsers) ? r.registeredUsers.length : 0 };
            });
            setEvents(mapped);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError(err.response?.data?.message || err.message || 'Error fetching events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch { return null; }
    })();

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await axios.delete(`http://localhost:3000/events/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setEvents(prev => prev.filter(ev => ev._id !== id));
        } catch (err) {
            console.error('Delete event error:', err);
            alert(err.response?.data?.message || err.message || 'Failed to delete event');
        }
    };

    const registerForEvent = async (event) => {
        try {
            const user = currentUser;
            if (!user) return alert('Please sign in to register');
            // prevent double register on client side
            const already = event.registeredUsers && event.registeredUsers.find(r => {
                const uid = r.userId?._id || r.userId?.id || r.userId;
                const cu = user._id || user.id;
                return String(uid) === String(cu);
            });
            if (already) return alert('You are already registered for this event');

            const res = await axios.post('http://localhost:3000/registration-events/register', { eventId: event._id, userId: (user._id || user.id) }, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            // update UI: increase registeredCount and push user lightly
            setEvents(prev => prev.map(ev => {
                if (ev._id !== event._id) return ev;
                const newCount = (res.data && res.data.registeredCount) ? res.data.registeredCount : ((ev.registeredCount || 0) + 1);
                const userObj = { userId: { _id: (currentUser._id || currentUser.id), name: currentUser.name, email: currentUser.email } };
                return { ...ev, registeredCount: newCount, registeredUsers: (ev.registeredUsers || []).concat([userObj]) };
            }));
            alert(res.data?.message || 'Registered successfully');
        } catch (err) {
            console.error('Register error:', err);
            alert(err.response?.data?.message || err.message || 'Failed to register');
        }
    };

    const startEdit = (event) => {
        setEditingId(event._id);
        setEditForm({
            title: event.title || '',
            description: event.description || '',
            category: event.category || '',
            date: event.date ? new Date(event.date).toISOString().slice(0,16) : '',
            location: event.location || '',
            capacity: event.capacity || ''
        });
    };

    const cancelEdit = () => { setEditingId(null); setEditForm({}); };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const submitEdit = async (e, id) => {
        e.preventDefault();
        try {
            const payload = {
                title: editForm.title,
                description: editForm.description,
                category: editForm.category,
                date: editForm.date ? new Date(editForm.date).toISOString() : null,
                location: editForm.location,
                capacity: Number(editForm.capacity)
            };
            const res = await axios.put(`http://localhost:3000/events/${id}`, payload, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            // update local state — preserve organizer name if server returned only an id
            const updated = res.data && (res.data.event || res.data);
            setEvents(prev => prev.map(ev => {
                if (ev._id !== id) return ev;
                // if updated.organizer is a string/id (or doesn't have a name), keep previous organizer object
                let organizer = updated && updated.organizer ? updated.organizer : ev.organizer;
                if (organizer && typeof organizer === 'object' && organizer.name) {
                    // updated has populated organizer
                } else {
                    organizer = ev.organizer;
                }
                return { ...ev, ...updated, organizer };
            }));
            setEditingId(null);
            setEditForm({});
        } catch (err) {
            console.error('Update event error:', err);
            alert(err.response?.data?.message || err.message || 'Failed to update event');
        }
    };

    return (
        <div className={EventsPageCss.page}>
                        <header className={EventsPageCss.header}>
                                <h1>All Events</h1>
                                {currentUser && currentUser.role === 'admin' && (
                                    <Link to="/create-event" className={EventsPageCss.createBtn}>+ Create Event</Link>
                                )}
                        </header>

            {loading && <p className={EventsPageCss.message}>Loading events...</p>}
            {error && <p className={EventsPageCss.error}>{error}</p>}

            {!loading && !error && events.length === 0 && (
                <p className={EventsPageCss.message}>No events found.</p>
            )}

            <div className={EventsPageCss.grid}>
                {events.map(event => {
                    const ownerId = event.organizer && (typeof event.organizer === 'object' ? event.organizer._id : event.organizer);
                    const userId = currentUser ? (currentUser._id || currentUser.id || null) : null;
                    const isOwner = Boolean(userId && ownerId && String(ownerId) === String(userId));
                    return (
                        <article key={event._id} className={EventsPageCss.eventCard}>
                            {editingId === event._id ? (
                                <form className={EventsPageCss.editForm} onSubmit={(e) => submitEdit(e, event._id)}>
                                    <input name="title" value={editForm.title || ''} onChange={handleEditChange} placeholder="Title" />
                                    <textarea name="description" value={editForm.description || ''} onChange={handleEditChange} placeholder="Description" />
                                    <input name="category" value={editForm.category || ''} onChange={handleEditChange} placeholder="Category" />
                                    <input type="datetime-local" name="date" value={editForm.date || ''} onChange={handleEditChange} />
                                    <input name="location" value={editForm.location || ''} onChange={handleEditChange} placeholder="Location" />
                                    <input name="capacity" value={editForm.capacity || ''} onChange={handleEditChange} placeholder="Capacity" />
                                    <div className={EventsPageCss.editActions}>
                                        <button type="submit" className={EventsPageCss.saveBtn}>Save</button>
                                        <button type="button" onClick={cancelEdit} className={EventsPageCss.cancelBtn}>Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <h2 className={EventsPageCss.title}>{event.title}</h2>
                                    <p className={EventsPageCss.description}>{event.description}</p>
                                    <div className={EventsPageCss.meta}>
                                        <span className={EventsPageCss.category}>{event.category}</span>
                                        <time className={EventsPageCss.date}>{event.date ? new Date(event.date).toLocaleString() : 'TBA'}</time>
                                    </div>
                                    <div className={EventsPageCss.metaRow}>
                                        <span className={EventsPageCss.location}>{event.location}</span>
                                        <span className={EventsPageCss.capacity}>{(event.registeredCount || 0)}/{event.capacity}</span>
                                    </div>
                                    <div className={EventsPageCss.organizer}>Organizer: {event.organizer?.name || event.organizer || '—'}</div>
                                    <div className={EventsPageCss.actions}>
                                        <Link to={`/events/${event._id}`} className={EventsPageCss.viewBtn}>View</Link>
                                        <button
                                            className={EventsPageCss.registerBtn}
                                            onClick={() => registerForEvent(event)}
                                            disabled={ (event.registeredCount || 0) >= (event.capacity || Infinity) }
                                        >
                                            {(event.registeredCount || 0) >= (event.capacity || Infinity) ? 'Sold Out' : 'Register'}
                                        </button>
                                        {isOwner && (
                                            <>
                                                <button onClick={() => startEdit(event)} className={EventsPageCss.editBtn}>Edit</button>
                                                <button onClick={() => handleDelete(event._id)} className={EventsPageCss.deleteBtn}>Delete</button>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </article>
                    )
                })}
            </div>
        </div>
    )
}

export default EventsPage