import sequelize from '../config/database.js';
import User from './User.js';
import HealthRecord from './HealthRecord.js';
import BloodDonor from './BloodDonor.js';
import OrganDonor from './OrganDonor.js';
import ChatHistory from './ChatHistory.js';
import Medication from './Medication.js';
import Insurance from './Insurance.js';
import Appointment from './Appointment.js';
import Facility from './Facility.js';

// Define associations
User.hasMany(HealthRecord, { foreignKey: 'userId', onDelete: 'CASCADE' });
HealthRecord.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(BloodDonor, { foreignKey: 'userId', onDelete: 'CASCADE' });
BloodDonor.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(OrganDonor, { foreignKey: 'userId', onDelete: 'CASCADE' });
OrganDonor.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ChatHistory, { foreignKey: 'userId', onDelete: 'CASCADE' });
ChatHistory.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Medication, { foreignKey: 'userId', onDelete: 'CASCADE' });
Medication.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Insurance, { foreignKey: 'userId', onDelete: 'CASCADE' });
Insurance.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Appointment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Appointment.belongsTo(User, { foreignKey: 'userId' });

// Sync database
export const syncDatabase = async () => {
    try {
        // Try to alter tables without dropping columns for smooth dev/production schema changes
        await sequelize.sync({ alter: { drop: false } });
        console.log('✅ Database synchronized successfully (schema updated safely).');
    } catch (error) {
        console.warn('⚠️ Safe schema alteration failed, falling back to standard sync:', error.message);
        try {
            await sequelize.sync();
            console.log('✅ Database synchronized successfully.');
        } catch (syncError) {
            console.error('❌ Error synchronizing database:', syncError);
            throw syncError;
        }
    }
};

export {
    User,
    HealthRecord,
    BloodDonor,
    OrganDonor,
    ChatHistory,
    Medication,
    Insurance,
    Appointment,
    Facility
};
