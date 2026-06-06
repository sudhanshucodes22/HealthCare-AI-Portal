import express from 'express';
import multer from 'multer';
import path from 'path';
import { decodeReport } from '../controllers/reportDecoderController.js';

const router = express.Router();

// Multer configuration for temporary file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/decode-report
router.post('/decode-report', upload.single('report'), decodeReport);

export default router;
