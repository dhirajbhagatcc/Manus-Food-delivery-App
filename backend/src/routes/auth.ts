import { Router } from "express";
import {
  checkPassword,
  setSessionCookie,
  clearSessionCookie,
  isAuthed,
} from "../auth";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== "string" || !checkPassword(password)) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }
  setSessionCookie(res);
  res.json({ ok: true });
});

authRouter.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", (req, res) => {
  res.json({ authed: isAuthed(req) });
});
