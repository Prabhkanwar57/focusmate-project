import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import FocusSession from '@/lib/models/FocusSession';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string };
    const { sessionId, endTime } = await req.json();

    const session = await FocusSession.findById(sessionId);
    if (!session) {
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }

    if (session.userId.toString() !== decoded.userId) {
      return NextResponse.json({ message: 'Unauthorized session access' }, { status: 403 });
    }

    const start = new Date(session.startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;

    const duration = Math.min(1, Math.floor(durationMs / 60000)); // ⬅ Fix applied here

    if (duration <= 0 || isNaN(duration)) {
      return NextResponse.json({ message: 'Invalid duration' }, { status: 400 });
    }

    session.endTime = new Date(endTime);
    session.duration = duration;
    await session.save();

    return NextResponse.json(session, { status: 200 });

  } catch (err) {
    console.error('❌ Stop session error:', err);
    return NextResponse.json({ message: 'Error stopping session' }, { status: 500 });
  }
}
