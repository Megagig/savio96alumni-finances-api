import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

// Check if user is admin middleware
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Access denied. Authentication required.',
    });
    return;
  }

  // Check if user has any admin role
  const adminRoles = [
    UserRole.ADMIN,
    UserRole.ADMIN_LEVEL_1,
    UserRole.ADMIN_LEVEL_2,
    UserRole.SUPER_ADMIN
  ];

  if (!adminRoles.includes(req.user.role as UserRole)) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
    return;
  }

  next();
};
