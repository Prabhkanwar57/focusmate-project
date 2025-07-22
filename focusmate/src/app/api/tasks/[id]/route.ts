import { connectDB } from '@/lib/db';
import Task from '@/models/Task';
import { verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface JwtPayload {
  userId: string;
  email: string;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as JwtPayload;
    const taskId = params.id;
    const body = await req.json();
    const { title, completed } = body;

    const updateData: Partial<typeof body> = {};
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = completed;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: decoded.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ message: 'Task not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(updatedTask);
  } catch (err) {
    console.error('PUT /api/tasks/[id] error:', err);
    return NextResponse.json({ message: 'Error updating task' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as JwtPayload;
    const taskId = params.id;

    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      userId: decoded.userId,
    });

    if (!deletedTask) {
      return NextResponse.json({ message: 'Task not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/tasks/[id] error:', err);
    return NextResponse.json({ message: 'Error deleting task' }, { status: 500 });
  }
}
