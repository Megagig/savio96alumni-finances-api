import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { IUser, UserRole } from '../types';

/**
 * Generate JWT token for authenticated user
 * @param id User ID
 * @param role User role
 * @returns JWT token
 */
export const generateToken = (id: string, role: UserRole): string => {
  // Get the JWT secret from environment variables
  const jwtSecret: Secret = process.env.JWT_SECRET || 'default_secret';
  
  // Create payload object
  const payload = { id, role };
  
  // Create options object with proper typing
  // Using a properly typed expiresIn value
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as StringValue;
  const options: SignOptions = { expiresIn };
  
  // Sign and return the JWT token
  return jwt.sign(payload, jwtSecret, options);
};
