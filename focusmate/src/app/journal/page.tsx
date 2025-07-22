'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs'; // For date formatting
import Sidebar from '@/app/components/Sidebar';

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  date: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const fetchEntries = async () => {
      const token = localStorage.getItem('token');

      try {
        const res = await fetch('/api/journal', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load journal entries');
        const data = await res.json();
        setEntries(data || []);
      } catch (err) {
        console.error(err);
        setError('Error loading journal');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) throw new Error('Failed to add journal');

      const newEntry = await res.json();
      setEntries([newEntry, ...entries]); // Add new to top
      setTitle('');
      setContent('');
    } catch (err) {
      console.error(err);
      setError('Error adding journal entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    // Ensure title and content are not undefined
    const safeTitle = entry.title ?? ''; // Use empty string if title is undefined
    const safeContent = entry.content ?? ''; // Use empty string if content is undefined

    setEditingEntry(entry);
    setEditTitle(safeTitle);
    setEditContent(safeContent);
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleUpdate = async () => {
    if (!editingEntry || !editTitle.trim() || !editContent.trim()) {
      setError('Please fill in both title and content.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/journal/${editingEntry._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Unknown error');
      }

      const updatedEntry = await res.json();
      setEntries(
        entries.map((e) => (e._id === updatedEntry._id ? updatedEntry : e))
      );
      handleCancelEdit();
    } catch (err) {
      console.error(err);
      setError('Error updating journal entry');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this entry?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete');

      setEntries(entries.filter((e) => e._id !== id));
    } catch (err) {
      console.error(err);
      setError('Error deleting journal entry');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📓 My Journal</h1>

      {/* New Entry Form */}
      <form onSubmit={handleSubmit} className="bg-[#1e293b] p-4 rounded-lg mb-6 shadow-md space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-[#334155] text-white placeholder-gray-400"
          required
        />
        <textarea
          placeholder="Write your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 rounded bg-[#334155] text-white placeholder-gray-400"
          rows={4}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold disabled:opacity-50"
        >
          {submitting ? 'Adding...' : 'Add Entry'}
        </button>
      </form>

      {/* Loading/Error States */}
      {loading && <p className="text-gray-400">Loading entries...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {entries.length === 0 && !loading && (
        <p className="text-gray-400">No journal entries found.</p>
      )}

      {/* Entries List */}
      <ul className="space-y-4">
        {entries.map((entry) => (
          <li key={entry._id} className="bg-[#1e293b] p-4 rounded shadow relative group">
            <h3 className="text-lg font-semibold">{entry.title}</h3>
            <p className="mt-2 text-gray-300">{entry.content}</p>
            <p className="text-sm text-gray-400 mt-1">
              Created: {dayjs(entry.date).format('YYYY-MM-DD')}
            </p>

            {/* Edit/Delete Buttons */}
            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(entry)}
                className="text-blue-400 hover:text-blue-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(entry._id)}
                className="text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Edit Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Entry</h3>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-2 mb-4 border dark:border-gray-600 rounded dark:bg-gray-700"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Content"
              className="w-full p-2 mb-4 border dark:border-gray-600 rounded dark:bg-gray-700"
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}