import type { MediaItem } from '@/types';

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video';
  width?: number;
  height?: number;
}

/**
 * Upload a single file directly to Cloudinary using a server-signed request.
 * The API secret never reaches the browser — we only fetch a one-time signature.
 */
export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  const sign = await fetch('/api/upload-sign', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  }).then((r) => r.json());

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`);
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const up = JSON.parse(xhr.responseText);
        resolve({
          url: up.secure_url,
          publicId: up.public_id,
          resourceType: up.resource_type,
          width: up.width,
          height: up.height,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });
    xhr.addEventListener('error', () => reject(new Error('Upload network error')));
    xhr.send(form);
  });
}

/** Convert an upload result into a MediaItem (image or video). */
export function toMediaItem(r: UploadResult): MediaItem {
  return r.resourceType === 'video'
    ? { kind: 'video', url: r.url, publicId: r.publicId }
    : { kind: 'image', url: r.url, publicId: r.publicId, width: r.width, height: r.height };
}
