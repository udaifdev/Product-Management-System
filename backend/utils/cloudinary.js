

// === utils/cloudinary.js ===

import { v2 as cloudinaryV2 } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (fileBuffer, filename) => {
    return new Promise((resolve, reject) => {
        cloudinaryV2.uploader.upload_stream({
            resource_type: 'image',
            public_id: `products/${filename}`,
            folder: 'products',
            transformation: [
                { width: 800, height: 600, crop: 'limit' },
                { quality: 'auto' }
            ]
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
            } else {
                resolve(result.secure_url);
            }
        }).end(fileBuffer);
    });
};