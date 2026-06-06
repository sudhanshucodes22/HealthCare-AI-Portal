import { Sequelize } from 'sequelize';
import config from './env.js';

let sequelize;

if (config.databaseUrl) {
    const isSslDisabled = process.env.DB_SSL === 'false';
    sequelize = new Sequelize(config.databaseUrl, {
        dialect: 'postgres',
        logging: config.nodeEnv === 'development' ? console.log : false,
        minifyAliases: true,
        dialectOptions: {
            ssl: isSslDisabled ? false : {
                require: true,
                rejectUnauthorized: false
            },
            // Safe settings for pgbouncer (transaction mode) in cloud hosting
            prepare: false
        },
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000
        }
    });
} else {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: config.dbPath,
        logging: config.nodeEnv === 'development' ? console.log : false,
    });
}

export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        throw error;
    }
};

export default sequelize;
