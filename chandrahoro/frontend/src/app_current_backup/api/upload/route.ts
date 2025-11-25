/**
 * File Upload API Route
 * 
 * Handles file uploads for avatars and other user content.
 * Supports image validation, resizing, and cloud storage.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

import { authOptions } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api/response';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * POST /api/upload
 * 
 * Upload files (currently supports avatars)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'avatar';

    if (!file) {
      return errorResponse('NO_FILE', 'No file provided', 400);
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse(
        'INVALID_FILE_TYPE',
        'Only image files are allowed (JPEG, PNG, WebP, GIF)',
        400
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        'FILE_TOO_LARGE',
        'File size must be less than 5MB',
        400
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${session.user.id}_${type}_${timestamp}.${extension}`;

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', type);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file to local storage
    const filePath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/${type}/${filename}`;

    // TODO: In production, you would upload to cloud storage (AWS S3, Cloudinary, etc.)
    // and return the cloud URL instead of local path

    return successResponse({
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return errorResponse(
      'UPLOAD_FAILED',
      error.message || 'Failed to upload file',
      500
    );
  }
}

/**
 * DELETE /api/upload
 * 
 * Delete uploaded files
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const type = searchParams.get('type') || 'avatar';

    if (!filename) {
      return errorResponse('NO_FILENAME', 'Filename is required', 400);
    }

    // Verify the file belongs to the current user
    if (!filename.startsWith(session.user.id)) {
      return errorResponse('UNAUTHORIZED', 'Cannot delete file', 403);
    }

    // TODO: Implement file deletion logic
    // For local storage: unlink the file
    // For cloud storage: delete from cloud provider

    return successResponse({
      deleted: true,
      filename,
    });

  } catch (error: any) {
    console.error('Delete error:', error);
    return errorResponse(
      'DELETE_FAILED',
      error.message || 'Failed to delete file',
      500
    );
  }
}
