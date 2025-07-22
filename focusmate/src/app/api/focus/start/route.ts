import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import FocusSession from '@/lib/models/FocusSession';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as { userId: string };
    const { startTime } = await req.json();

    const session = await FocusSession.create({
      userId: decoded.userId,
      startTime: new Date(startTime), 
      duration: 0,
    });

    return NextResponse.json({ sessionId: session._id }, { status: 200 });
  } catch (err) {
    console.error('❌ Start session error:', err);
    return NextResponse.json({ message: 'Error starting session' }, { status: 500 });
  }
}
