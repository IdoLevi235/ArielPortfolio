import { v2 as cloudinary } from 'cloudinary';

const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: apiSecret,
  secure: true,
});

/**
 * Generate a Cloudinary API signature for a direct browser upload.
 * The API secret never leaves the server.
 */
export function signUpload(paramsToSign: Record<string, string | number>): string {
  if (!apiSecret) {
    throw new Error('CLOUDINARY_API_SECRET is not configured');
  }
  return cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
}

export { cloudinary };
