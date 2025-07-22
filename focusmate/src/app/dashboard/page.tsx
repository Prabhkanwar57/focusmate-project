'use client';

import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ProgressSection = dynamic(() => import('./components/ProgressSection'), { ssr: false });

interface TokenPayload {
  userId: string;
  email: string;
  name?: string;
}

interface MoodEntry {
  moodLevel: string;
  date: string;
}

interface FocusSession {
  duration: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [taskCount, setTaskCount] = useState(0);
  const [focusCount, setFocusCount] = useState(0);
  const [latestMood, setLatestMood] = useState<string>('Not recorded');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      setUser(decoded);
      fetchDashboardData(token);
    } catch (error) {
      console.error('Invalid token:', error);
      router.push('/auth/login');
    }
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      // ✅ Fetch Tasks
      const taskRes = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (taskRes.ok) {
        const taskData = await taskRes.json();
        const completedTasks = taskData.filter((task: any) => task.completed);
        setTaskCount(completedTasks.length);
      } else {
        console.warn('Failed to fetch tasks');
      }

      // ✅ Fetch Mood
      const moodRes = await fetch('/api/mood', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (moodRes.ok) {
        const moodData: MoodEntry[] = await moodRes.json();
        if (moodData.length > 0) {
          setLatestMood(moodData[0].moodLevel);
        }
      } else {
        console.warn('Failed to fetch mood');
      }

      // ✅ Fetch Focus Sessions
      const focusRes = await fetch('/api/focus', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (focusRes.ok) {
        const focusData: FocusSession[] = await focusRes.json();
        setFocusCount(focusData.length);
      } else {
        console.warn('Failed to fetch focus sessions');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0d1117', color: '#fff' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        background: '#161b22',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ color: '#58a6ff' }}>🎯 FocusMate</h2>
          <nav style={{ marginTop: '2rem' }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ margin: '1rem 0' }}>
                <Link href="/dashboard" style={{ color: '#c9d1d9', textDecoration: 'none' }}>📊 Dashboard</Link>
              </li>
              <li style={{ margin: '1rem 0' }}>
                <Link href="/tasks" style={{ color: '#c9d1d9', textDecoration: 'none' }}>✅ Tasks</Link>
              </li>
              <li style={{ margin: '1rem 0' }}>
                <Link href="/mood" style={{ color: '#c9d1d9', textDecoration: 'none' }}>😊 Mood Tracker</Link>
              </li>
              <li style={{ margin: '1rem 0' }}>
                <Link href="/journal" style={{ color: '#c9d1d9', textDecoration: 'none' }}>📓 Journal</Link>
              </li>
              <li style={{ margin: '1rem 0' }}>
                <Link href="/stats" style={{ color: '#c9d1d9', textDecoration: 'none' }}>📈 Statistics</Link>
              </li>
            </ul>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: '#da3633',
            color: '#fff',
            padding: '10px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
          🔒 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ color: '#c9d1d9' }}>Welcome to your Dashboard</h1>
          {user && (
            <div style={{ fontSize: '1rem', color: '#58a6ff' }}>
              👤 {user.name || user.email}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, background: '#21262d', padding: '1rem', borderRadius: '10px' }}>
            <h3>✅ Tasks Completed</h3>
            <p>{taskCount}</p>
          </div>
          <div style={{ flex: 1, background: '#21262d', padding: '1rem', borderRadius: '10px' }}>
            <h3>⏱ Focus Sessions</h3>
            <p>{focusCount}</p>
          </div>
          <div style={{ flex: 1, background: '#21262d', padding: '1rem', borderRadius: '10px' }}>
            <h3>😊 Current Mood</h3>
            <p>{latestMood}</p>
          </div>
        </div>

        {/* ✅ Progress Section */}
        <ProgressSection />
      </main>
    </div>
  );
}
