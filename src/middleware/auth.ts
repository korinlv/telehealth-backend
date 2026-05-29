import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express's Request type to include our user data
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'patient' | 'doctor';
    email: string;
  };
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 1. Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    // 2. Extract just the token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    // 3. Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: 'patient' | 'doctor';
      email: string;
    };

    // 4. Attach the decoded user to the request object
    req.user = decoded;

    // 5. Pass control to the next middleware or controller
    next();

  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole = (role: 'patient' | 'doctor') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ message: 'Access denied: insufficient permissions' });
      return;
    }
    next();
  };
};