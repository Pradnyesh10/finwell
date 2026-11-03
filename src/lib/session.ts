// Demo login: picks Personal or Business mode (Paytm-style). No real auth — stored locally.

export type Mode = "personal" | "business";
export interface Session { name: string; phone: string; mode: Mode }

const KEY = "finwell.session.v1";
const EVENT = "finwell_session_changed";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null) {
  try {
    if (session) window.localStorage.setItem(KEY, JSON.stringify(session));
    else window.localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeToSession(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export const homeFor = (mode: Mode) => (mode === "business" ? "/business" : "/");
