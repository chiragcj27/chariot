import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

const saltRounds = 10;


export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}


export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET as string, { expiresIn: '3h' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET as string);
  } catch (error) {
    throw new Error('Invalid token');
  }
}





