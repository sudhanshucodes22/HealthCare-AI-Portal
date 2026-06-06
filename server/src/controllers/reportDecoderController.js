import { decodeMedicalReport } from '../services/geminiService.js';
import fs from 'fs';

export const decodeReport = async (req, res) => {
    try {
        console.log('📄 Received report decode request...');
        if (!req.file) {
            console.error('❌ No file received in request.');
            return res.status(400).json({ error: 'No file uploaded or file too large.' });
        }

        console.log(`📂 Processing file: ${req.file.originalname} (${req.file.mimetype})`);
        const { path, mimetype } = req.file;

        // Process the report using Gemini GenAI
        console.log('🤖 Calling Gemini Vision API...');
        const result = await decodeMedicalReport(path, mimetype, req.file.originalname);
        console.log('✅ Gemini analysis complete.');

        // Clean up the uploaded file from the server after processing
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
            console.log('🧹 Temp file cleaned up.');
        }

        res.json(result);
    } catch (error) {
        console.error('❌ Error processing report decoder request:', error);

        // Ensure the temporary file is deleted even on error
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // STRICT DEBUG MODE: Send exact error message back to frontend
        res.status(500).json({
            error: 'AI Analysis Error',
            details: error.message,
            debug: {
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                fileReceived: !!req.file,
                mimetype: req.file?.mimetype
            }
        });
    }
};
