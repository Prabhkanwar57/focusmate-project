// /app/api/journal/route.ts
import { connectDB } from '@/lib/db';
import JournalEntry from '@/lib/models/JournalEntry';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
}

// GET all entries for user
export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const token = req.headers.get('authorization')?.split(' ')[1] || '';
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    const entries = await JournalEntry.find({ userId: decoded.userId }).sort({ date: -1 });
    return NextResponse.json(entries);
  } catch (error) {
    console.error('GET /api/journal error:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }
}

// POST a new entry
export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const token = req.headers.get('authorization')?.split(' ')[1] || '';
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }

    const newEntry = await JournalEntry.create({
      title,
      content,
      userId: decoded.userId,
      date: new Date(),
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('POST /api/journal error:', error);
    return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 });
  }
}