import { OrganDonor, User } from '../models/index.js';
import { Op } from 'sequelize';

export const registerDonor = async (req, res) => {
    try {
        const { organType, location, city, state, pledgeDate } = req.body;
        const userId = req.user.id;

        // Check if user has already pledged this specific organ
        const existingPledge = await OrganDonor.findOne({
            where: { userId, organType }
        });

        if (existingPledge) {
            return res.status(400).json({ error: `You have already pledged to donate a ${organType}` });
        }

        const donor = await OrganDonor.create({
            userId,
            organType,
            location,
            city,
            state,
            pledgeDate: pledgeDate || new Date()
        });

        res.status(201).json({
            message: 'Successfully registered as an organ donor',
            donor
        });
    } catch (error) {
        console.error('Register Organ Donor error:', error);
        res.status(500).json({ error: 'Failed to register as donor' });
    }
};

export const searchDonors = async (req, res) => {
    try {
        const { organType, city } = req.query;
        const whereClause = { status: 'available' };

        if (organType) {
            whereClause.organType = organType;
        }

        if (city) {
            whereClause.city = {
                [Op.like]: `%${city}%`
            };
        }

        const donors = await OrganDonor.findAll({
            where: whereClause,
            include: [{
                model: User,
                attributes: ['name', 'phone', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(donors);
    } catch (error) {
        console.error('Search Organ Donors error:', error);
        res.status(500).json({ error: 'Failed to search donors' });
    }
};

export const updateAvailability = async (req, res) => {
    try {
        const { status, organId } = req.body;
        const userId = req.user.id;

        const donor = await OrganDonor.findOne({ where: { id: organId, userId } });

        if (!donor) {
            return res.status(404).json({ error: 'Donor profile not found' });
        }

        donor.status = status;
        await donor.save();

        res.json({ message: 'Availability updated successfully', donor });
    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({ error: 'Failed to update availability' });
    }
};

export const getMyDonorProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const pledges = await OrganDonor.findAll({
            where: { userId }
        });

        res.json(pledges);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
