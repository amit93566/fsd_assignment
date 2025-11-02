import User from '../models/User.js';
import logger from '../config/logger.js';
import jwt from 'jsonwebtoken';

export const adminCreateUser = async (req, res) => {
    try {
        const { name, email, password, sclass, role } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Name, email, and password are required',
                data: null
            });
        }

        // Validate class field for STAFF and STUDENT roles
        const userRole = role || 'STAFF'; // Default to STAFF if role not provided
        if ((userRole === 'STAFF' || userRole === 'STUDENT') && !sclass) {
            return res.status(400).json({
                status: 'error',
                message: 'Class field is required for STAFF role',
                data: null
            });
        }

        // Create user object based on role
        const userData = { name, email, password, role: userRole };
        if (sclass) {
            userData.sclass = sclass;
        }

        const user = new User(userData);
        await user.save();

        return res.status(201).json({
            status: 'success',
            message: `${userRole} registered successfully`,
            data: []
        });
    } catch (error) {
        logger.error('Error creating user:', error);

        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already exists',
                data: null
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Failed to create user',
            data: null
        });
    }
};

export const getAllStaffList = async (req, res) => {
   try {
    const { search, class: classFilter, page = 1, limit = 10 } = req.query;
    
    // Parse page and limit as integers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Validate pagination parameters
    const validPage = pageNum > 0 ? pageNum : 1;
    const validLimit = limitNum > 0 && limitNum <= 100 ? limitNum : 10;
    
    logger.info(`Fetching all staffs data with search: ${search}, class: ${classFilter}, page: ${validPage}, limit: ${validLimit}`);
    
    // Build query - filter by role
    const query = { role: 'STAFF' };
    
    // Add email search if provided
    if (search && search.trim()) {
        query.email = { $regex: search.trim(), $options: 'i' };
        logger.info(`Searching staff by email: ${search.trim()}`);
    }
    
    // Add class filter if provided
    if (classFilter && classFilter.trim()) {
        query.sclass = { $regex: `^${classFilter.trim()}$`, $options: 'i' };
        logger.info(`Filtering staff by class: ${classFilter.trim()}`);
    }
    
    // Get total count for pagination
    const totalCount = await User.countDocuments(query);
    
    // Calculate skip value for pagination
    const skip = (validPage - 1) * validLimit;
    
    // Fetch paginated staff
    const list = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validLimit);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;

    logger.info(`Retrieved ${list.length} staff members (page ${validPage} of ${totalPages}, total: ${totalCount})`);

    res.status(200).json({
        status: 'success',
        message: 'All staff data fetched successfully',
        data: list,
        pagination: {
            currentPage: validPage,
            totalPages,
            totalCount,
            limit: validLimit,
            hasNextPage,
            hasPrevPage
        }
    })
   } catch (error) {
        logger.error("Error fetching staff details",error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch the staff list',
            data: null
        });
   }
}