import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { config } from "./config";

const COOKIE_NAME = "applytrack_session";

/** Create a signed token: <issuedAt>.<hmac>. Valid for 30 days. */
export function issueToken(): string {
  const issuedAt = Date.now().toString();
  const sig = sign(issuedAt);
  return `${issuedAt}.${sig}`;
}

function sign(value: string): string {
  return crypto
    .createHmac("sha256", config.sessionSecret)
    .update(value)
    .digest("hex");
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;
  const expected = sign(issuedAt);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return false;
  }
  const age = Date.now() - parseInt(issuedAt, 10);
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return age >= 0 && age < THIRTY_DAYS;
}

/** Constant-time password comparison. */
export function checkPassword(input: string): boolean {
  const a = Buffer.from(input || "");
  const b = Buffer.from(config.loginPassword);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function setSessionCookie(res: Response): void {
  res.cookie(COOKIE_NAME, issueToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProd,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME);
}

export function isAuthed(req: Request): boolean {
  return verifyToken(req.cookies?.[COOKIE_NAME]);
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (isAuthed(req)) {
    next();
    return;
  }
  res.status(401).json({ error: "Unauthorized" });
}
