import User from '../models/User.js';
import logger from '../config/logger.js';
import jwt from 'jsonwebtoken';
import Equipments from '../models/Equipments.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, userClass } = req.body;

       const tuser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
   
        if(tuser) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already exists',
                data: null
            });
        }
        const user = new User({ name, email, password, role: 'STUDENT', sclass: userClass });
        await user.save();

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: []
        });
    } catch (error) {
        logger.error('Error registering user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to register user',
            data: null
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials', data: null });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Invalid credentials', data: null });
        }
        const token = jwt.sign(
            { sub: user._id.toString(), role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction ? true : (process.env.COOKIE_SECURE === 'true'),
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            domain: process.env.COOKIE_DOMAIN || undefined,
            path: '/'
        };

        res.cookie('newtk', token, cookieOptions);

        console.log(user.role);

        // let redirectUrl = "/dashboard"

        // if(user.role==="STAFF"){
        //     redirectUrl = "/staffdash"
        // }

        // res.redirect(302, redirectUrl);
        

         res.status(200).json({
             status: 'success',
             message: 'User logged in successfully',
             data: []
         });
    } catch (error) {
        logger.error('Error logging in user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to login user',
            data: null
        });
    }
}

export const logouthandler = async(req,res)=>{
    try {
        res.clearCookie('newtk');
        res.status(200).json({
            status: 'success',
            message: 'User logged out successfully',
            data: null
        });
    } catch (error) {
        logger.error('Error logging out user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to logout user',
            data: null
        });
    }
}

export const apime = async (req, res) => {
    try {
        const userId = req.user.id; 
        const user = await User.findById(userId).select('name email role');
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
                data: null
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'User data fetched successfully',
            data: [{
                name: user.name,
                email: user.email,
                role: user.role
            }]
        });
    } catch (error) {
        logger.error('Error fetching user data:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch user data',
            data: null
        });
    }
}

export const allStudentsList = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { search, page = 1, limit = 10 } = req.query;
        
        // Parse page and limit as integers
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        
        // Validate pagination parameters
        const validPage = pageNum > 0 ? pageNum : 1;
        const validLimit = limitNum > 0 && limitNum <= 100 ? limitNum : 10;
        
        // Get the logged-in user's details to fetch their class
        const loggedInUser = await User.findById(userId).select('sclass role');
        
        if (!loggedInUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
                data: null
            });
        }

        // Build query - filter by role
        const query = { role: 'STUDENT' };
        
        // If admin, show all students (no class filter)
        // If staff, filter by staff's class (sclass)
        if (userRole === 'STAFF' && loggedInUser.sclass) {
            query.sclass = loggedInUser.sclass;
            logger.info(`Staff member fetching students for class: ${loggedInUser.sclass}`);
        } else if (userRole === 'ADMIN') {
            logger.info('Admin fetching all students');
        } else {
            logger.warn(`User ${userId} with role ${userRole} attempting to fetch students`);
        }

        // Add email search if provided
        if (search && search.trim()) {
            query.email = { $regex: search.trim(), $options: 'i' };
            logger.info(`Searching students by email: ${search.trim()}`);
        }

        // Get total count for pagination
        const totalCount = await User.countDocuments(query);
        
        // Calculate skip value for pagination
        const skip = (validPage - 1) * validLimit;
        
        // Fetch paginated students
        const students = await User.find(query)
            .select('-password')
            .sort({ sclass: 1, name: 1 })
            .skip(skip)
            .limit(validLimit);
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / validLimit);
        const hasNextPage = validPage < totalPages;
        const hasPrevPage = validPage > 1;

        logger.info(`Retrieved ${students.length} students (page ${validPage} of ${totalPages}, total: ${totalCount})`);
        
        res.status(200).json({
            status: 'success',
            message: userRole === 'ADMIN' 
                ? 'All students data fetched successfully' 
                : `Students data for class ${loggedInUser.sclass} fetched successfully`,
            data: students,
            pagination: {
                currentPage: validPage,
                totalPages,
                totalCount,
                limit: validLimit,
                hasNextPage,
                hasPrevPage
            }
        });
    } catch (error) {
        logger.error('Error fetching students data:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch students data',
            data: null
        });
    }
}

export const allStaffList = async (req, res) => {
    try {
        const staff = await User.find({ role: 'STAFF' });
        res.status(200).json({
            status: 'success',
            message: 'All staff data fetched successfully',
            data: staff
        });
    } catch (error) {
        logger.error('Error fetching staff data:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch staff data',
            data: null
        });
    }
}

export const getAllClasses = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Get the logged-in user's details to fetch their class
        const loggedInUser = await User.findById(userId).select('sclass role');
        
        if (!loggedInUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
                data: null
            });
        }

        let classes = [];
        
        // If admin, get all unique classes from all students
        // If staff, only return their own class
        if (userRole === 'ADMIN') {
            classes = await User.distinct('sclass', { 
                role: 'STUDENT', 
                sclass: { $exists: true, $ne: null, $ne: '' } 
            });
            logger.info(`Admin fetching all classes - found ${classes.length} unique classes`);
        } else if (userRole === 'STAFF' && loggedInUser.sclass) {
            // Staff only sees their own class
            classes = [loggedInUser.sclass];
            logger.info(`Staff member fetching class: ${loggedInUser.sclass}`);
        }
        
        const sortedClasses = classes.sort();
        
        res.status(200).json({
            status: 'success',
            message: userRole === 'ADMIN' 
                ? 'All classes fetched successfully' 
                : 'Class fetched successfully',
            data: sortedClasses
        });
    } catch (error) {
        logger.error('Error fetching classes:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch classes',
            data: null
        });
    }
}

export const dashboardc = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        
        const students = await User.countDocuments({ role: 'STUDENT' });
        const staff = await User.countDocuments({ role: 'STAFF' });
        const equipment = await Equipments.countDocuments();

        res.status(200).json({
            status: 'success',
            message: 'Dashboard data fetched successfully',
            data: {
                students,
                staff,
                equipment
            }
        });
    } catch (error) {
        logger.error('Error fetching dashboard data:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch dashboard data',
            data: null
        });
    }
}