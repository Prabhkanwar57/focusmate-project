'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MoodPage() {
  const router = useRouter();
  const [moodLevel, setMoodLevel] = useState('');
  const [note, setNote] = useState('');
  const [moods, setMoods] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const emojis = [
    { label: 'Happy', icon: '😊' },
    { label: 'Neutral', icon: '😐' },
    { label: 'Stressed', icon: '😰' },
    { label: 'Tired', icon: '😴' },
    { label: 'Excited', icon: '🚀' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/auth/login');

    fetch('/api/mood', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setMoods)
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!moodLevel) {
      setError('Please select a mood.');
      return;
    }

    const url = editingId ? `/api/mood/${editingId}` : '/api/mood';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ moodLevel, note }),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingId) {
        setMoods(moods.map((m) => (m._id === editingId ? data : m)));
        setEditingId(null);
      } else {
        setMoods([data, ...moods]);
      }
      setMoodLevel('');
      setNote('');
      setError('');
    } else {
      const errData = await res.json();
      setError(errData.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/mood/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setMoods(moods.filter((m) => m._id !== id));
    } else {
      const errData = await res.json();
      setError(errData.message || 'Failed to delete mood');
    }
  };

  const handleEdit = (entry: any) => {
    setMoodLevel(entry.moodLevel);
    setNote(entry.note || ''); // Pre-fill note if available
    setEditingId(entry._id);
  };

  const formatDate = (dateStr: Date | string) => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">How are you feeling today?</h2>

      <div className="flex flex-wrap gap-4 mb-4">
        {emojis.map(({ label, icon }) => (
          <button
            key={label}
            className={`border rounded-lg p-4 text-center w-28 ${
              moodLevel === label ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
            onClick={() => setMoodLevel(label)}
          >
            <div className="text-3xl">{icon}</div>
            <div>{label}</div>
          </button>
        ))}
      </div>

      <textarea
        className="w-full p-3 bg-gray-800 rounded mb-4 text-white"
        placeholder="Add a note about your mood (optional)..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        onClick={handleSave}
      >
        {editingId ? 'Update Mood' : 'Save Mood'}
      </button>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Mood History</h3>
        <ul className="space-y-3">
          {moods.length > 0 ? (
            moods.map((entry) => (
              <li
                key={entry._id}
                className="bg-gray-800 rounded px-4 py-3 flex justify-between items-center"
              >
                <span>
                  <strong>Created: {formatDate(entry.date)}</strong>{' '}
                  <span className="text-lg">{getEmoji(entry.moodLevel)}</span>{' '}
                  {entry.moodLevel}
                  {entry.note && (
                    <span className="ml-2 text-sm">📝 {entry.note}</span>
                  )}
                </span>
                <span className="text-sm space-x-2">
                  <button
                    className="text-blue-400 hover:underline"
                    onClick={() => handleEdit(entry)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="text-red-400 hover:underline"
                    onClick={() => handleDelete(entry._id)}
                  >
                    🗑️ Delete
                  </button>
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-400">No moods recorded yet.</p>
          )}
        </ul>
      </div>
    </div>
  );

  function getEmoji(label: string) {
    const found = emojis.find((e) => e.label === label);
    return found ? found.icon : '';
  }
}