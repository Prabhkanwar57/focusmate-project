'use client'

import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts'

export default function StatsContent() {
  const [data, setData] = useState<any[]>([])
  const [moodPieData, setMoodPieData] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(response => {
        // If it's the time-series array:
        if (Array.isArray(response)) {
          setData(response)
        } else {
          // If it's mood distribution object
          const moodStats = response.moodDistribution || {}
          const pieData = Object.entries(moodStats).map(([mood, count]) => ({
            name: mood,
            value: count
          }))
          setMoodPieData(pieData)
        }
      })
  }, [])

  const showCharts = data.length > 0 || moodPieData.length > 0

  if (!showCharts) return <p>Loading statistics...</p>

  return (
    <div className="stats-container">
      <h2>📊 Productivity Insights Dashboard</h2>

      {data.length > 0 && (
        <>
          <div className="chart-section">
            <h3>📈 Average Mood Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgMood" name="Mood Score" stroke="#8884d8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-section">
            <h3>📊 Tasks & Journals per Day</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completedTasks" name="Tasks Done" fill="#00C49F" />
                <Bar dataKey="journalEntries" name="Journals" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {moodPieData.length > 0 && (
        <div className="chart-section">
          <h3>🥧 Mood Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={moodPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                fill="#8884d8"
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <style jsx>{`
        .stats-container {
          padding: 2rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-width: 960px;
          margin: auto;
        }

        .chart-section {
          margin-top: 2.5rem;
        }

        h2, h3 {
          text-align: center;
          color: #333;
        }
      `}</style>
    </div>
  )
}
