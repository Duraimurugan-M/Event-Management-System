import React, { useState, useEffect } from 'react'
import styles from './CreateEvent.module.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function CreateEvent() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    location: '',
    capacity: '',
    organizer: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Basic client-side validation
    if (!form.title || !form.description || !form.category || !form.date || !form.location || !form.capacity) {
      setError('Please fill all required fields.')
      return
    }

    setLoading(true)
    try {
      // date input is expected as ISO string by backend
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        date: new Date(form.date).toISOString(),
        location: form.location,
        capacity: form.capacity,
        // organizer optional: if provided, send it; otherwise server may use authenticated user
        ...(form.organizer ? { organizer: form.organizer } : {})
      }

      const res = await axios.post('http://localhost:3000/events', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      setSuccess(res.data?.message || 'Event created successfully')
      setForm({ title: '', description: '', category: '', date: '', location: '', capacity: '', organizer: '' })
    } catch (err) {
      console.error('Create event error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  // redirect to events list after success
  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => navigate('/events'), 900)
    return () => clearTimeout(t)
  }, [success, navigate])

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create Event</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Title *
            <input className={styles.input} name="title" value={form.title} onChange={handleChange} />
          </label>

          <label className={styles.label}>
            Description *
            <textarea className={styles.textarea} name="description" value={form.description} onChange={handleChange} required />
          </label>

          <div className={styles.row}>
            <label className={styles.labelSmall}>
              Category *
              <input className={styles.input} name="category" value={form.category} onChange={handleChange} required />
            </label>

            <label className={styles.labelSmall}>
              Date & Time *
              <input className={styles.input} type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.labelSmall}>
              Location *
              <input className={styles.input} name="location" value={form.location} onChange={handleChange} required />
            </label>

            <label className={styles.labelSmall}>
              Capacity *
              <input className={styles.input} type="number" min="1" name="capacity" value={form.capacity} onChange={handleChange} required />
            </label>
          </div>

          <label className={styles.label}>
            Organizer *
            <input className={styles.input} name="organizer" value={form.organizer} onChange={handleChange} placeholder="Organizer user id" required />
          </label>

          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={loading}>{loading ? 'Creating...' : 'Create Event'}</button>
            <button type="button" className={styles.secondary} onClick={() => { setForm({ title: '', description: '', category: '', date: '', location: '', capacity: '', organizer: '' }); setError(''); setSuccess('') }}>Reset</button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success} — redirecting...</p>}
        </form>
      </div>
    </div>
  )
}

export default CreateEvent
