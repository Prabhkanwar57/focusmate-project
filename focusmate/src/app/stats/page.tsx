'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface MoodEntry {
  date: string;
  moodLevel: string;
}

interface ProgressEntry {
  date: string;
  journalCount: number;
  taskCount: number;
  avgMood: number;
}

const moodToScore = (mood: string): number => {
  switch (mood) {
    case 'Happy': return 5;
    case 'Excited': return 4;
    case 'Neutral': return 3;
    case 'Tired': return 2;
    case 'Sad':
    case 'Anxious': return 1;
    default: return 0;
  }
};

export default function StatsPage() {
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchMood = async () => {
      const res = await fetch('/api/mood', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMoodData(data);
      } else {
        setMoodData([]);
        console.warn('Invalid mood data:', data);
      }
    };

    const fetchProgress = async () => {
      const res = await fetch('/api/progress', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProgressData(data);
      } else {
        setProgressData([]);
        console.warn('Invalid progress data:', data);
      }
    };

    fetchMood();
    fetchProgress();
  }, []);

  // === Corrected Date Conversion for Mood Chart ===
  const moodChartData = {
    labels: moodData.map((m) =>
      new Date(new Date(m.date).toLocaleString('en-US', { timeZone: 'America/Toronto' }))
        .toISOString()
        .slice(0, 10)
    ),
    datasets: [
      {
        label: 'Mood Score',
        data: moodData.map((m) => moodToScore(m.moodLevel)),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.3)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // === Corrected Date Conversion for Progress Chart ===
  const progressChartData = {
    labels: progressData.map((p) =>
      new Date(new Date(p.date).toLocaleString('en-US', { timeZone: 'America/Toronto' }))
        .toISOString()
        .slice(0, 10)
    ),
    datasets: [
      {
        label: 'Journal Entries',
        data: progressData.map((p) => p.journalCount),
        borderColor: '#facc15',
        backgroundColor: 'rgba(250, 204, 21, 0.3)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Tasks Completed',
        data: progressData.map((p) => p.taskCount),
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.3)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Average Mood',
        data: progressData.map((p) => p.avgMood),
        borderColor: '#818cf8',
        backgroundColor: 'rgba(129, 140, 248, 0.3)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const progressChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#fff',
        },
      },
      x: {
        ticks: {
          color: '#fff',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
    },
  };

  const moodChartOptions = {
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          color: '#fff',
        },
      },
      x: {
        ticks: {
          color: '#fff',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
    },
  };

  return (
    <div className="p-6 text-white min-h-screen bg-[#0f172a]">
      <h1 className="text-3xl font-semibold mb-6">📊 Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <div className="bg-[#1e293b] rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Weekly Progress</h2>
          <div className="h-64">
            {progressData.length > 0 ? (
              <Line data={progressChartData} options={progressChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <span>Loading progress data...</span>
              </div>
            )}
          </div>
        </div>

        {/* Mood Trends Chart */}
        <div className="bg-[#1e293b] rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Mood Trends</h2>
          <div className="h-64">
            {moodData.length > 0 ? (
              <Line data={moodChartData} options={moodChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <span>Loading mood data...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
