import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

export const auth = (req, res, next) => {
    try {
        // Read from cookie first, then Authorization header
        const tokenFromCookie = req.cookies && req.cookies["newtk"];
        //const authHeader = req.get('Authorization') || '';
       // const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        const token = tokenFromCookie;

        console.log(tokenFromCookie)
        //console.log(tokenFromHeader)

        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.sub, role: payload.role };
        return next();
    } catch (error) {
        logger.warn('Auth middleware error', { error: error.message });
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        return next();
    };
};

export default auth;

