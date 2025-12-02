import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
export const configureCloudinary = (): void => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

interface UploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: object[];
}

// Upload image from buffer
export const uploadImage = async (
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'web3economy',
        public_id: options.public_id,
        transformation: options.transformation,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );

    // Convert buffer to readable stream and pipe to upload stream
    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

// Upload image from URL
export const uploadImageFromUrl = async (
  url: string,
  options: UploadOptions = {}
): Promise<UploadApiResponse> => {
  return cloudinary.uploader.upload(url, {
    folder: options.folder || 'web3economy',
    public_id: options.public_id,
    transformation: options.transformation,
    resource_type: 'image',
  });
};

// Delete image by public_id
export const deleteImage = async (publicId: string): Promise<{ result: string }> => {
  return cloudinary.uploader.destroy(publicId);
};

// Get optimized image URL
export const getOptimizedUrl = (
  publicId: string,
  width?: number,
  height?: number
): string => {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    width,
    height,
    crop: width && height ? 'fill' : undefined,
  });
};

// Verify Cloudinary connection
export const verifyCloudinaryConnection = async (): Promise<boolean> => {
  try {
    configureCloudinary();
    await cloudinary.api.ping();
    console.log('Cloudinary connection verified successfully');
    return true;
  } catch (error) {
    console.error('Cloudinary connection verification failed:', error);
    return false;
  }
};

export { cloudinary };
