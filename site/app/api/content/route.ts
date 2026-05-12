import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const contentPath = path.join(process.cwd(), 'data', 'content.json');

export async function GET() {
  try {
    const raw = readFileSync(contentPath, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    writeFileSync(contentPath, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to write content' }, { status: 500 });
  }
}
