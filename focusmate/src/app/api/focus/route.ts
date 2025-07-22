import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import FocusSession from '@/lib/models/FocusSession';
import { connectDB } from '@/lib/db';

// GET: Fetch all focus sessions for the logged-in user
export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = verifyToken(token); // decode as any to access .userId
    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const sessions = await FocusSession.find({ userId });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

// POST: Save a new focus session for the user
export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { duration } = await req.json();

    const session = await FocusSession.create({
      userId,
      duration,
      createdAt: new Date(),
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error saving session:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
