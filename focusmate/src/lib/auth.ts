import jwt from 'jsonwebtoken';

export function createToken(payload: { userId: string; email: string; name?: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!);
}
