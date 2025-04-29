import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IDecodedToken, UserRole } from '../types';
import User from '../models/user.model';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Authenticate user middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header or query parameter
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token as string;
    
    // Check if token exists in either header or query parameter
    if ((!authHeader || !authHeader.startsWith('Bearer ')) && !queryToken) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    // Extract token from header or use query parameter
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : queryToken;
    
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as IDecodedToken;

    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.',
      });
      return;
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

// Authorize role middleware with role hierarchy support
export const authorize = (...requiredRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
      return;
    }

    const userRole = req.user.role as UserRole;
    
    // Check if user has one of the required roles or a higher role
    const hasPermission = checkRolePermission(userRole, requiredRoles);
    
    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this resource.',
      });
      return;
    }

    next();
  };
};

// Helper function to check if a user role has permission based on role hierarchy
const checkRolePermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  // If the user's exact role is in the required roles, they have permission
  if (requiredRoles.includes(userRole)) {
    return true;
  }
  
  // Role hierarchy definitions
  const roleHierarchy: Record<UserRole, UserRole[]> = {
    [UserRole.MEMBER]: [],
    [UserRole.ADMIN_LEVEL_1]: [],
    [UserRole.ADMIN_LEVEL_2]: [UserRole.ADMIN_LEVEL_1],
    [UserRole.SUPER_ADMIN]: [UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.ADMIN],
    [UserRole.ADMIN]: [UserRole.ADMIN_LEVEL_1] // Legacy admin role has Level 1 access
  };
  
  // Check if the user's role inherits any of the required roles
  if (roleHierarchy[userRole]) {
    for (const requiredRole of requiredRoles) {
      if (roleHierarchy[userRole].includes(requiredRole)) {
        return true;
      }
    }
  }
  
  return false;
};
