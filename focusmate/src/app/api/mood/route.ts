import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import MoodEntry from '@/models/MoodEntry';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    const moods = await MoodEntry.find({ userId: decoded.userId }).sort({ createdAt: -1 });

    return NextResponse.json(moods);
  } catch (err) {
    return NextResponse.json({ message: 'Error fetching moods' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    const { moodLevel, note, tags } = await req.json();

    const newMood = await MoodEntry.create({
      userId: decoded.userId,
      moodLevel,
      note,
      tags,
    });

    return NextResponse.json(newMood, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'Error saving mood' }, { status: 500 });
  }
}
