'use client'
import { useEffect, useState } from 'react'

export default function MoodContent() {
  const [form, setForm] = useState({
    moodLevel: '',
    note: '',
    tags: '',
    taskId: '',
    journalId: ''
  })

  const [moods, setMoods] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [journals, setJournals] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/moods').then(res => res.json()).then(setMoods)
    fetch('/api/tasks').then(res => res.json()).then(setTasks)
    fetch('/api/journals').then(res => res.json()).then(setJournals)
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const payload = {
      ...form,
      tags: form.tags.split(',').map(tag => tag.trim())
    }

    const res = await fetch('/api/moods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      setForm({ moodLevel: '', note: '', tags: '', taskId: '', journalId: '' })
      const updated = await res.json()
      setMoods([updated, ...moods])
    }
  }

  return (
    <div className="mood-container">
      <h2>😊 Mood Tracker</h2>
      <form onSubmit={handleSubmit}>
        <select
          value={form.moodLevel}
          onChange={e => setForm({ ...form, moodLevel: e.target.value })}
          required
        >
          <option value="">Select Mood</option>
          <option>Happy</option>
          <option>Neutral</option>
          <option>Stressed</option>
          <option>Sad</option>
          <option>Excited</option>
        </select>

        <input
          type="text"
          placeholder="Note (optional)"
          value={form.note}
          onChange={e => setForm({ ...form, note: e.target.value })}
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={e => setForm({ ...form, tags: e.target.value })}
        />

        <select
          value={form.taskId}
          onChange={e => setForm({ ...form, taskId: e.target.value })}
        >
          <option value="">Linked Task (optional)</option>
          {tasks.map(t => (
            <option key={t._id} value={t._id}>{t.title}</option>
          ))}
        </select>

        <select
          value={form.journalId}
          onChange={e => setForm({ ...form, journalId: e.target.value })}
        >
          <option value="">Linked Journal (optional)</option>
          {journals.map(j => (
            <option key={j._id} value={j._id}>{j.content.slice(0, 40)}...</option>
          ))}
        </select>

        <button type="submit">Save Mood</button>
      </form>

      <div className="mood-history">
        <h3>📅 Mood History</h3>
        <ul>
          {moods.map(m => (
            <li key={m._id}>{new Date(m.date).toLocaleDateString()} – {m.moodLevel}</li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .mood-container {
          max-width: 600px;
          margin: auto;
          padding: 2rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        input, select, button {
          padding: 0.75rem;
          font-size: 1rem;
        }
        button {
          background: #1e88e5;
          color: white;
          border: none;
          cursor: pointer;
        }
        button:hover {
          background: #1565c0;
        }
        .mood-history ul {
          list-style: none;
          padding: 0;
        }
      `}</style>
    </div>
  )
}
