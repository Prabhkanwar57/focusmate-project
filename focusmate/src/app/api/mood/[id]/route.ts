import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import MoodEntry from '@/models/MoodEntry';
import { verifyToken } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    const { moodLevel, note, tags } = await req.json();

    const updatedMood = await MoodEntry.findOneAndUpdate(
      { _id: params.id, userId: decoded.userId },
      { moodLevel, note, tags },
      { new: true }
    );

    return NextResponse.json(updatedMood);
  } catch (err) {
    return NextResponse.json({ message: 'Error updating mood' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;

    await MoodEntry.findOneAndDelete({ _id: params.id, userId: decoded.userId });
    return NextResponse.json({ message: 'Mood deleted' });
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting mood' }, { status: 500 });
  }
}
