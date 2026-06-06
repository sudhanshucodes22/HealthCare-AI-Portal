import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Facility = sequelize.define('Facility', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    placeId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lat: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    lng: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'hospital'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 4.0
    },
    isOpen: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    emergencyServices: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    specialties: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    doctors: {
        type: DataTypes.JSON,
        defaultValue: []
    }
});

export default Facility;
