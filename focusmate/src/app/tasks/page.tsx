'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface Task {
  _id: string;
  title: string;
  completed: boolean;
  date: Date;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTasks(data);
      } catch {
        setError('Error loading tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      setNewTitle('');
    } catch {
      setError('Error adding task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTitle('');
  };

  const handleUpdate = async () => {
    if (!editingTask) return;

    try {
      const res = await fetch(`/api/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitle }),
      });

      const updatedTask = await res.json();
      setTasks(tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
      handleCancelEdit();
    } catch {
      setError('Error updating task');
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      const updatedTask = await res.json();
      setTasks(tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    } catch {
      setError('Error updating task status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(tasks.filter((t) => t._id !== id));
    } catch {
      setError('Error deleting task');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📝 My Tasks</h1>

      <form onSubmit={handleSubmit} className="bg-[#1e293b] p-4 rounded-lg mb-6 space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full p-2 rounded bg-[#334155] text-white placeholder-gray-400"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold"
        >
          Add Task
        </button>
      </form>

      {loading && <p className="text-gray-400">Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task._id} className="bg-[#1e293b] p-4 rounded shadow relative group">
            <div className="flex items-center justify-between mb-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task)}
                className="mr-2"
              />
              <h3 className="text-lg font-semibold flex-1">{task.title}</h3>
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(task)} className="text-blue-400 hover:text-blue-300">
                  Edit
                </button>
                <button onClick={() => handleDelete(task._id)} className="text-red-400 hover:text-red-300">
                  Delete
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Created: {dayjs(task.date).format('YYYY-MM-DD')}
            </p>
          </li>
        ))}
      </ul>

      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Task</h3>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-2 mb-4 border dark:border-gray-600 rounded dark:bg-gray-700"
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
