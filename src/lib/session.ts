// Sessão de morador: cookie httpOnly assinado com HMAC. Sem senha.
// Conteúdo: profile_id. Validade: 90 dias.

import { cookies } from "next/headers";
import crypto from "node:crypto";

const COOKIE_NAME = "condo_session";
const ADMIN_COOKIE = "condo_admin";
const MAX_AGE_DAYS = 90;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET ausente ou curto demais (>= 16 chars).");
  return s;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

function pack(profileId: string): string {
  const sig = sign(profileId);
  return `${profileId}.${sig}`;
}

function unpack(raw: string): string | null {
  const i = raw.lastIndexOf(".");
  if (i < 0) return null;
  const value = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  if (sign(value) !== sig) return null;
  return value;
}

export async function setSessionProfile(profileId: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, pack(profileId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * MAX_AGE_DAYS,
  });
}

export async function getSessionProfileId(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return unpack(raw);
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

// ---------- Admin ----------

export async function setAdminSession() {
  const jar = await cookies();
  const value = pack("admin");
  jar.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE)?.value;
  if (!raw) return false;
  return unpack(raw) === "admin";
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}
