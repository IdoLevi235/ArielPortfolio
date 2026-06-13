import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/devAuth';
import { signUpload } from '@/lib/cloudinary';

const DEFAULT_FOLDER = 'ariel-portfolio';
const SAFE_FOLDER_RE = /^[a-z0-9/_-]+$/;

export async function POST(request: NextRequest) {
  // Auth guard — defense in depth; proxy also protects this route.
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    // Parse optional folder from request body.
    let folder = DEFAULT_FOLDER;
    try {
      const body = await request.json() as Record<string, unknown>;
      if (typeof body.folder === 'string' && SAFE_FOLDER_RE.test(body.folder)) {
        folder = body.folder;
      }
    } catch {
      // Body absent or not JSON — use default folder.
    }

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign: Record<string, string | number> = { timestamp, folder };
    const signature = signUpload(paramsToSign);

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (err) {
    console.error('[upload-sign] Error generating signature:', err);
    return NextResponse.json({ error: 'Failed to generate upload signature' }, { status: 500 });
  }
}
