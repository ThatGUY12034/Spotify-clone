import type { NextFunction, Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    playlist: string[];
}

interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Check multiple possible header locations
        const token = req.headers.authorization?.split(' ')[1] || // Bearer token
                     req.headers.token as string ||               // Custom token header
                     req.headers.tokens as string;                // Your original (typo?)

        if (!token) {
            res.status(401).json({ // 401 is more appropriate for missing auth
                message: "Please Login"
            });
            return;
        }

        // Validate environment variable
        const userServiceUrl = process.env.USER_SERVICE_URL || process.env.User_URL;
        if (!userServiceUrl) {
            throw new Error("USER_SERVICE_URL not configured");
        }

        // Call user service to validate token and get user info
        const response = await axios.get(`${userServiceUrl}/api/v1/user/me`, {
            headers: {
                Authorization: `Bearer ${token}`, // Standard header
                token: token, // Custom header for backward compatibility
            },
            timeout: 5000, // 5 second timeout
        });

        // Extract user data from response
        // Adjust this based on your user service response structure
        const userData = response.data.user || response.data.data?.user || response.data;
        
        if (!userData) {
            res.status(401).json({
                message: "Invalid token or user not found"
            });
            return;
        }

        req.user = userData;
        next();
    } catch (error) {
        // Handle different types of errors
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNREFUSED') {
                console.error("User service is unavailable");
                res.status(503).json({ 
                    message: "Authentication service unavailable" 
                });
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                res.status(401).json({ 
                    message: "Invalid or expired token" 
                });
            } else {
                console.error("Auth service error:", error.message);
                res.status(500).json({ 
                    message: "Authentication failed" 
                });
            }
        } else {
            console.error("Unexpected auth error:", error);
            res.status(500).json({ 
                message: "Internal server error" 
            });
        }
        return;
    }
};


//MUlter Setup

import multer from "multer";

const storage = multer.memoryStorage();

const uploadFile = multer({storage}).single("file")

export default uploadFile;