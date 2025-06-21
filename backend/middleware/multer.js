// === middlewares/multer.js ===
import multer from 'multer';


const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB max per file
        files: 10 // Maximum 10 files
    },
    fileFilter
});

export default upload;