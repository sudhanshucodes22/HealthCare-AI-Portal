import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrganDonor = sequelize.define('OrganDonor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    organType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Intestines', 'Corneas', 'Bone Marrow', 'Skin']]
        }
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pledgeDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'available',
        validate: {
            isIn: [['available', 'donated', 'unavailable']]
        }
    }
});

export default OrganDonor;
