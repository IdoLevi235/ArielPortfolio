import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { isAuthed } from '@/lib/devAuth';
import { validateContent } from '@/lib/contentSchema';
import { getRemoteContent, commitContent } from '@/lib/github';

const contentPath = path.join(process.cwd(), 'data', 'content.json');

// ---------------------------------------------------------------------------
// GET /api/content
// ---------------------------------------------------------------------------
// If GITHUB_TOKEN is set → fetch latest from GitHub.
// Otherwise (local dev)  → read from disk.
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse> {
  try {
    if (process.env.GITHUB_TOKEN) {
      const { content } = await getRemoteContent();
      return NextResponse.json(content);
    }

    // Local fallback
    const raw = readFileSync(contentPath, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to read content';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT /api/content
// ---------------------------------------------------------------------------
// Auth guard → Zod validation → GitHub commit (or local write in dev).
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest): Promise<NextResponse> {
  // Auth guard (dev bypass allowed only in local development)
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();

    // Validate against the Content schema
    const validation = validateContent(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const validData = validation.data;

    if (process.env.GITHUB_TOKEN) {
      // Production: commit to GitHub
      await commitContent(validData);
      return NextResponse.json({ ok: true, mode: 'github' });
    }

    // Local dev: write to disk
    writeFileSync(contentPath, JSON.stringify(validData, null, 2) + '\n', 'utf-8');
    return NextResponse.json({ ok: true, mode: 'local' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to write content';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
