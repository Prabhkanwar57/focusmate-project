'use client'
import { useEffect, useState } from 'react'

export default function JournalForm({ onSubmit }: { onSubmit: (form: any) => void }) {
  const [form, setForm] = useState({
    content: '',
    taskId: '',
    moodLevel: ''
  })

  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
  }, [])

  const handleSubmit = (e: any) => {
    e.preventDefault()
    onSubmit(form)
    setForm({ content: '', taskId: '', moodLevel: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="journal-form">
      <textarea
        placeholder="Write your thoughts..."
        value={form.content}
        onChange={e => setForm({ ...form, content: e.target.value })}
        required
      />

      <select
        value={form.taskId}
        onChange={e => setForm({ ...form, taskId: e.target.value })}
      >
        <option value="">Link to Task (optional)</option>
        {tasks.map(t => (
          <option key={t._id} value={t._id}>{t.title}</option>
        ))}
      </select>

      <select
        value={form.moodLevel}
        onChange={e => setForm({ ...form, moodLevel: e.target.value })}
      >
        <option value="">Mood (optional)</option>
        <option>Happy</option>
        <option>Neutral</option>
        <option>Stressed</option>
        <option>Sad</option>
        <option>Grateful</option>
      </select>

      <button type="submit">Save Journal</button>

      <style jsx>{`
        .journal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 500px;
        }
        textarea, select, button {
          padding: 0.7rem;
          font-size: 1rem;
        }
        button {
          background: #0066cc;
          color: #fff;
          border: none;
          cursor: pointer;
        }
        button:hover {
          background: #004f99;
        }
      `}</style>
    </form>
  )
}
