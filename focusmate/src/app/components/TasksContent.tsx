'use client'
import { useState } from 'react'

export default function TaskForm({ onSubmit }: { onSubmit: (form: any) => void }) {
  const [form, setForm] = useState({
    title: '',
    moodAtStart: '',
    moodAtCompletion: ''
  })

  const handleSubmit = (e: any) => {
    e.preventDefault()
    onSubmit(form)
    setForm({ title: '', moodAtStart: '', moodAtCompletion: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        placeholder="Enter task title"
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
        required
      />

      <select
        value={form.moodAtStart}
        onChange={e => setForm({ ...form, moodAtStart: e.target.value })}
        required
      >
        <option value="">Mood at Start</option>
        <option>Happy</option>
        <option>Neutral</option>
        <option>Stressed</option>
        <option>Sad</option>
        <option>Excited</option>
      </select>

      <select
        value={form.moodAtCompletion}
        onChange={e => setForm({ ...form, moodAtCompletion: e.target.value })}
        required
      >
        <option value="">Mood at Completion</option>
        <option>Happy</option>
        <option>Neutral</option>
        <option>Stressed</option>
        <option>Sad</option>
        <option>Relieved</option>
      </select>

      <button type="submit">Add Task</button>

      <style jsx>{`
        .task-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 400px;
        }
        input, select, button {
          padding: 0.7rem;
          font-size: 1rem;
        }
        button {
          background: #333;
          color: #fff;
          border: none;
          cursor: pointer;
        }
        button:hover {
          background: #555;
        }
      `}</style>
    </form>
  )
}
