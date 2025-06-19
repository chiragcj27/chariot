import { Request, Response } from 'express';
import { User } from '@chariot/db';
import { comparePassword, generateTokens, refreshTokens } from '@chariot/auth';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const tokens = await generateTokens(user);
    // Return user info and tokens (omit password)
    return res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required.' });
  }
  try {
    const tokens = await refreshTokens(refreshToken);
    return res.json(tokens);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token.' });
  }
} 