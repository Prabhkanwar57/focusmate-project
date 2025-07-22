import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import jwt from 'jsonwebtoken';
import Task from '@/lib/models/Task';
import MoodEntry from '@/lib/models/MoodEntry';
import JournalEntry from '@/lib/models/JournalEntry';
import { formatLocalDate, moodToScore } from '@/lib/utils/stats';

interface TokenPayload {
  userId: string;
  email: string;
}

export async function GET(req: Request) {
  await connectDB();

  try {
    const token = req.headers.get('authorization')?.split(' ')[1] || '';
    const { userId } = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    const tasks = await Task.find({ userId });
    const moods = await MoodEntry.find({ userId });
    const journals = await JournalEntry.find({ userId });

    const statsByDate: Record<string, {
      taskCount: number;
      completedTasks: number;
      moodScores: number[];
      journalCount: number;
    }> = {};

    // ✅ Process Tasks
    for (const t of tasks) {
      const date = formatLocalDate(new Date(t.createdAt));
      if (!statsByDate[date]) statsByDate[date] = { taskCount: 0, completedTasks: 0, moodScores: [], journalCount: 0 };
      
      statsByDate[date].taskCount++;
      if (t.completed) statsByDate[date].completedTasks++;

      if (t.moodAtStart) statsByDate[date].moodScores.push(moodToScore(t.moodAtStart));
      if (t.moodAtCompletion) statsByDate[date].moodScores.push(moodToScore(t.moodAtCompletion));
    }

    // ✅ Process Mood Entries
    for (const m of moods) {
      const date = formatLocalDate(new Date(m.date));
      if (!statsByDate[date]) statsByDate[date] = { taskCount: 0, completedTasks: 0, moodScores: [], journalCount: 0 };
      
      statsByDate[date].moodScores.push(moodToScore(m.moodLevel));
    }

    // ✅ Process Journals
    for (const j of journals) {
      const date = formatLocalDate(new Date(j.date));
      if (!statsByDate[date]) statsByDate[date] = { taskCount: 0, completedTasks: 0, moodScores: [], journalCount: 0 };

      statsByDate[date].journalCount++;
      if (j.moodLevel) statsByDate[date].moodScores.push(moodToScore(j.moodLevel));
    }

    // ✅ Format response
    const response = Object.entries(statsByDate).map(([date, stats]) => ({
      date,
      totalTasks: stats.taskCount,
      completedTasks: stats.completedTasks,
      journalEntries: stats.journalCount,
      avgMood: stats.moodScores.length
        ? Number((stats.moodScores.reduce((a, b) => a + b, 0) / stats.moodScores.length).toFixed(1))
        : 0,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({ error: 'Error fetching statistics' }, { status: 500 });
  }
}
