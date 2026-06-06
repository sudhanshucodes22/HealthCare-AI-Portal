import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
    dbPath: process.env.DB_PATH || './database.sqlite',
    databaseUrl: process.env.DATABASE_URL,
    geminiApiKey: process.env.GEMINI_API_KEY,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    frontendUrl: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173'],
};
