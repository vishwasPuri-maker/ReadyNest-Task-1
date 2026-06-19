import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const TOKEN_NAME = "token";
const MAX_AGE = 60 * 60 * 24 * 2; // 2 days — stay logged in without re-entering credentials

export type JwtPayload = { userId: string; email: string };

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export const authCookie = {
  name: TOKEN_NAME,
  maxAge: MAX_AGE,
};
