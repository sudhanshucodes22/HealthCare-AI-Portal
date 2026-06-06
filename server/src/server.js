import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import { testConnection } from './config/database.js';
import { syncDatabase } from './models/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import diseaseRoutes from './routes/disease.js';
import bloodRoutes from './routes/blood.js';
import mentalRoutes from './routes/mental.js';
import medicineRoutes from './routes/medicine.js';
import emergencyRoutes from './routes/emergency.js';
import insuranceRoutes from './routes/insurance.js';
import appointmentsRoutes from './routes/appointment.js';
import configRoutes from './routes/config.js';
import organRoutes from './routes/organ.js';
import reportDecoderRoutes from './routes/reportDecoderRoutes.js';

const app = express();

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);

        const allowedOrigins = Array.isArray(config.frontendUrl) ? config.frontendUrl : [config.frontendUrl];

        // Check if origin matches allowed list, wildcard, or dev environment
        const isAllowed = config.nodeEnv === 'development' || 
            allowedOrigins.includes('*') || 
            allowedOrigins.includes(origin) ||
            allowedOrigins.some(allowed => {
                if (allowed.includes('*')) {
                    const regex = new RegExp('^' + allowed.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
                    return regex.test(origin);
                }
                return false;
            });

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy blocks access from origin: ${origin}`));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Healthcare API is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/mental', mentalRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/organ', organRoutes);
app.use('/api/report-decoder', reportDecoderRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
    try {
        console.log('🚀 Starting Healthcare API Server...\n');

        // Test database connection
        await testConnection();

        // Sync database models
        await syncDatabase();

        // Start listening
        app.listen(config.port, () => {
            console.log(`\n✅ Server is running on port ${config.port}`);
            console.log(`📍 API URL: http://localhost:${config.port}`);
            console.log(`🏥 Health check: http://localhost:${config.port}/health`);
            console.log(`🌐 Frontend URL: ${Array.isArray(config.frontendUrl) ? config.frontendUrl.join(', ') : config.frontendUrl}\n`);

            if (!config.geminiApiKey) {
                console.warn('⚠️  Warning: GEMINI_API_KEY not set. AI features will use fallback responses.\n');
            }

            if (!config.googleMapsApiKey) {
                console.warn('⚠️  Warning: GOOGLE_MAPS_API_KEY not set. Emergency locator will use mock data.\n');
            }
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
