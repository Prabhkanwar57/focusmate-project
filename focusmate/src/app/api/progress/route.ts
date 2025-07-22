import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import jwt from 'jsonwebtoken';
import JournalEntry from '@/lib/models/JournalEntry';
import Task from '@/lib/models/Task';
import MoodEntry from '@/lib/models/MoodEntry';

interface TokenPayload {
  userId: string;
  email: string;
}

// ✅ Convert mood to a score (used only for averaging mood)
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

// ✅ Format date based on Canadian local time
const formatLocalDate = (date: Date): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto', // Set to your timezone
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;

  return `${year}-${month}-${day}`; // e.g., 2025-07-09
};

export async function GET(req: Request) {
  await connectDB();

  try {
    const token = req.headers.get('authorization')?.split(' ')[1] || '';
    const { userId } = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    const journals = await JournalEntry.find({ userId });
    const tasks = await Task.find({ userId, completed: true });
    const moods = await MoodEntry.find({ userId });

    const progressMap: Record<string, {
      journalCount: number;
      taskCount: number;
      moodScores: number[];
    }> = {};

    // 📝 Journal entries per day
    for (const entry of journals) {
      const date = formatLocalDate(new Date(entry.date));
      if (!progressMap[date]) progressMap[date] = { journalCount: 0, taskCount: 0, moodScores: [] };
      progressMap[date].journalCount++;
    }

    // ✅ Completed tasks per day
    for (const task of tasks) {
      const date = formatLocalDate(new Date(task.createdAt));
      if (!progressMap[date]) progressMap[date] = { journalCount: 0, taskCount: 0, moodScores: [] };
      progressMap[date].taskCount++;
    }

    // 😊 Mood scores per day
    for (const mood of moods) {
      const date = formatLocalDate(new Date(mood.date));
      const score = moodToScore(mood.moodLevel);
      if (!progressMap[date]) progressMap[date] = { journalCount: 0, taskCount: 0, moodScores: [] };
      progressMap[date].moodScores.push(score);
    }

    // 📊 Construct final dataset
    const result = Object.entries(progressMap)
      .map(([date, data]) => ({
        date,
        journalCount: data.journalCount,     // ✅ Unlimited
        taskCount: data.taskCount,           // ✅ Unlimited
        avgMood: data.moodScores.length > 0  // ✅ Avg out of 5 only for mood
          ? Number((data.moodScores.reduce((a, b) => a + b, 0) / data.moodScores.length).toFixed(1))
          : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(result);
  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress data' }, { status: 500 });
  }
}
