import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { env } from '../../config/env.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';
import { createError } from '../../utils/jwt.js';

export const uploadRouter = Router();

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const allowedFolders = new Set(['clubs', 'events', 'posts']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.cloudinary.maxImageBytes,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(createError(400, 'Only JPG, PNG, WebP, and GIF images are allowed'));
      return;
    }

    callback(null, true);
  },
});

function handleImageUpload(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      next(createError(400, 'Image must be 5MB or smaller'));
      return;
    }

    next(error);
  });
}

function assertCloudinaryConfigured() {
  if (
    !env.cloudinary.cloudName ||
    !env.cloudinary.apiKey ||
    !env.cloudinary.apiSecret
  ) {
    throw createError(
      500,
      'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to backend/.env.'
    );
  }

  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

function normalizeFolder(value) {
  const folder = typeof value === 'string' ? value.trim().toLowerCase() : '';
  const safeFolder = allowedFolders.has(folder) ? folder : 'posts';
  return `${env.cloudinary.folder}/${safeFolder}`;
}

function uploadBuffer(file, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
}

uploadRouter.post(
  '/image',
  requireAuth,
  requireRole('club', 'admin'),
  handleImageUpload,
  async (req, res, next) => {
    try {
      assertCloudinaryConfigured();

      if (!req.file) {
        throw createError(400, 'Image file is required');
      }

      const result = await uploadBuffer(req.file, normalizeFolder(req.body?.folder));

      res.status(201).json({
        message: 'Image uploaded',
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      next(error);
    }
  }
);
