import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    type: 'admin' | 'team';
    locationId?: string;
  };
}

export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      throw createError('Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'admin') {
      throw createError('Access denied. Admin privileges required.', 403);
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(createError('Invalid token.', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(createError('Token expired.', 401));
    } else {
      next(error);
    }
  }
};

export const authenticateTeam = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      throw createError('Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'team') {
      throw createError('Access denied. Team privileges required.', 403);
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(createError('Invalid token.', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(createError('Token expired.', 401));
    } else {
      next(error);
    }
  }
};
