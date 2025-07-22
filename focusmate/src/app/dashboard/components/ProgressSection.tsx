'use client';

import { useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';

interface FocusSession {
  duration: number;
  createdAt?: string;
  startTime?: string;
  userId: string;
}

interface TokenPayload {
  userId: string;
  email: string;
}

export default function ProgressSection() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [bestDay, setBestDay] = useState({ date: '', minutes: 0 });
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get logged-in user ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode<TokenPayload>(token);
      setUserId(decoded.userId);
    }
  }, []);

  // Fetch sessions once user ID is available
  useEffect(() => {
    if (userId) fetchSessions();
  }, [userId]);

  // Fetch all focus sessions
  const fetchSessions = async () => {
    const res = await fetch('/api/focus', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await res.json();
    const userSessions = data.filter((s: FocusSession) => s.userId === userId);
    setSessions(userSessions);
    calculateStats(userSessions);
  };

  // Calculate today, weekly and best day stats
  const calculateStats = (data: FocusSession[]) => {
    const today = dayjs().startOf('day');
    const weekAgo = dayjs().subtract(6, 'day').startOf('day');
    let todayTotal = 0;
    let weeklyTotal = 0;
    const dailyTotals: { [key: string]: number } = {};

    data.forEach(session => {
      const created = dayjs(session.startTime || session.createdAt); // ✅ fix
      if (created.isAfter(today)) {
        todayTotal += session.duration;
      }
      if (created.isAfter(weekAgo)) {
        weeklyTotal += session.duration;
      }
      const dayKey = created.format('YYYY-MM-DD');
      dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + session.duration;
    });

    const best = Object.entries(dailyTotals).sort((a, b) => b[1] - a[1])[0];
    setTodayMinutes(todayTotal);
    setWeeklyMinutes(weeklyTotal);
    setBestDay(best ? { date: dayjs(best[0]).format('MMM DD'), minutes: best[1] } : { date: '', minutes: 0 });
  };

  // Start 1-minute timer
  const startTimer = async () => {
    setTimerRunning(true);
    setSecondsLeft(60);

    const res = await fetch('/api/focus/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ startTime: new Date().toISOString() }),
    });

    const data = await res.json();
    localStorage.setItem('currentSessionId', data.sessionId);

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimerRunning(false);
          stopAndSaveSession();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Save finished session
  const stopAndSaveSession = async () => {
    const sessionId = localStorage.getItem('currentSessionId');
    if (!sessionId) return;

    await fetch('/api/focus/stop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        sessionId,
        endTime: new Date().toISOString(),
      }),
    });

    await fetchSessions(); // Refresh stats
    localStorage.removeItem('currentSessionId');
  };

  return (
    <div className="bg-[#111827] p-4 rounded-xl shadow-md mt-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-2">🎯 Focus Progress</h2>
      <p>🕒 Today: {todayMinutes} min</p>
      <p>🗓️ Weekly: {weeklyMinutes} min</p>
      <p>🏆 Best Day: {bestDay.date} ({bestDay.minutes} min)</p>
      <button
        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
        onClick={startTimer}
        disabled={timerRunning}
      >
        {timerRunning ? `⏳ ${secondsLeft}s...` : '▶ Start 1-Min Timer'}
      </button>
    </div>
  );
}
