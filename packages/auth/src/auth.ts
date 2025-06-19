import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '@chariot/db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });


const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('JWT_SECRET and REFRESH_TOKEN_SECRET must be defined in environment variables');
}

const saltRounds = 10;
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '30d';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as TokenPayload;
    if (!decoded.userId || !decoded.email || !decoded.role) {
      throw new Error('Invalid token payload');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid access token');
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET!) as TokenPayload;
    if (!decoded.userId || !decoded.email || !decoded.role) {
      throw new Error('Invalid token payload');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

export async function generateTokens(user: any): Promise<AuthTokens> {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in database
  await User.findByIdAndUpdate(user._id, {
    refreshToken,
  });

  return { accessToken, refreshToken };
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.userId);

  if (!user || user.refreshToken !== refreshToken) {
    throw new Error('Invalid refresh token');
  }

  return generateTokens(user);
}





