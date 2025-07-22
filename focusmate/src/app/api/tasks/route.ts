import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Task from '@/models/Task';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded?.userId) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const tasks = await Task.find({ userId: decoded.userId }).sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (err) {
    console.error('GET /api/tasks error:', err);
    return NextResponse.json({ message: 'Error fetching tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded?.userId) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const { title } = await req.json();
    if (!title?.trim()) return NextResponse.json({ message: 'Title is required' }, { status: 400 });

    const newTask = await Task.create({
      userId: decoded.userId,
      title,
      date: new Date(),
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (err) {
    console.error('POST /api/tasks error:', err);
    return NextResponse.json({ message: 'Error creating task' }, { status: 500 });
  }
}
