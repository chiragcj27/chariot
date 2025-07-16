import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@chariot/auth';

export const isSeller = async (req: Request, res: Response, next: NextFunction) => {
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

    // Check if the user has seller role
    if (payload.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Seller privileges required.' });
    }

    // Add the user info to the request object
    req.user = payload;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 

// New middleware: allows either admin or seller
export const isAdminOrSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    const payload = verifyAccessToken(token);
    if (payload.role !== 'seller' && payload.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin or Seller privileges required.' });
    }
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 