import jwt from 'jsonwebtoken';
import { db } from '../libs/db.js';
import rateLimit from 'express-rate-limit';

// Rate limiting middleware
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});

export const isLoggedIn = async (req, res, next) => {
    try {
        // Extract token from different possible locations
        const token = 
            req.cookies?.accessToken || 
            req.headers.authorization?.replace('Bearer ', '') ||
            null;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        const user = await db.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                role: true,
                email: true,
                isVerified: true
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Optional: Check if email is verified for sensitive routes
        if (!user.isVerified && req.path !== '/verify-email') {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email first'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication'
        });
    }
};

export const checkAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await db.user.findUnique({
            where: { 
                id: userId 
            },
            select: { 
                role: true 
            }
        });
        if(!user || user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied -  Admin only'
            });
        }
    } catch(error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error checking admin role'
        });
        
    }
    next();
};