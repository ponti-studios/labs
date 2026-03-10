/**
 * File Upload API Route
 *
 * IMPROVEMENTS:
 * - Uses standardized response utilities
 * - Type-safe error handling
 * - ~50% less code
 */

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { httpErrors, httpSuccess } from "~/lib/api/response";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "trackers");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Validation helpers
function validateFile(file: File): { valid: boolean; error?: Response } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: httpErrors.badRequest("Invalid file type. Only JPEG, PNG, GIF, and WebP allowed."),
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: httpErrors.badRequest("File too large. Maximum size is 5MB."),
    };
  }

  return { valid: true };
}

function generateFileName(file: File, userId: string | null): string {
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const prefix = userId || "anonymous";
  return `${prefix}_${timestamp}.${fileExt}`;
}

export const action = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return httpErrors.badRequest("Method not allowed");
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return httpErrors.badRequest("No file provided");
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return validation.error!;
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename and save
    const fileName = generateFileName(file, userId);
    const filePath = join(UPLOAD_DIR, fileName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    // Return public URL
    return httpSuccess.ok({ url: `/uploads/trackers/${fileName}` });
  } catch (error) {
    console.error("Upload error:", error);
    return httpErrors.internalError("Upload failed");
  }
};
