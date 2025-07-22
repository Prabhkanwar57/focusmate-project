// app/api/journal/[id]/route.ts
import { connectDB } from '@/lib/db';
import JournalEntry from '@/lib/models/JournalEntry';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
}

// DELETE an entry
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();

  try {
    const token = req.headers.get('authorization')?.split(' ')[1] || '';
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    const entryId = params.id;

    const deletedEntry = await JournalEntry.findOneAndDelete({
      _id: entryId,
      userId: decoded.userId,
    });

    if (!deletedEntry) {
      return NextResponse.json({ error: 'Entry not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/journal/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete journal entry' }, { status: 500 });
  }
}

// UPDATE an entry
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();

  try {
    const token = req.headers.get('authorization')?.split(' ')[1] || '';
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    const entryId = params.id;
    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }

    const updatedEntry = await JournalEntry.findOneAndUpdate(
      { _id: entryId, userId: decoded.userId },
      { title, content, date: new Date() },
      { new: true }
    );

    if (!updatedEntry) {
      return NextResponse.json({ error: 'Entry not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('PUT /api/journal/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update journal entry' }, { status: 500 });
  }
}