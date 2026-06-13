import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { User } from './model.js';
import type { IUser } from './model.js'; // Type-only import

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (
    req: AuthenticatedRequest, // Use the extended type here
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Check for token in headers (commonly in Authorization header)
        const token = req.headers.authorization?.split(' ')[1] || req.headers.token as string;

        if (!token) {
            res.status(403).json({
                message: "Please Login"
            });
            return;
        }

        // Verify JWT_SEC exists
        if (!process.env.JWT_SEC) {
            throw new Error("JWT_SEC is not defined");
        }

        const decodedValue = jwt.verify(token, process.env.JWT_SEC) as JwtPayload;

        if (!decodedValue || !decodedValue.id) {
            res.status(403).json({
                message: "Invalid Token"
            });
            return;
        }

        const userId = decodedValue.id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            res.status(403).json({
                message: "User Not Found"
            });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(403).json({
                message: "Invalid Token"
            });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(403).json({
                message: "Token Expired"
            });
        } else {
            res.status(500).json({
                message: "Authentication Error"
            });
        }
        return;
    }
};