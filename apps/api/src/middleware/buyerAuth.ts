import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@chariot/auth';

export const isBuyer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Verify the token and get the payload
    const payload = verifyAccessToken(token);

    // Check if the user has buyer role
    if (payload.role !== 'buyer') {
      return res.status(403).json({ message: 'Access denied. Buyer privileges required.' });
    }

    // Add the user info to the request object
    req.user = payload;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 