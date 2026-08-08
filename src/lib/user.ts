import { useEffect, useState } from "react";

const KEY = "skillmatch_user_id";

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setUserId(id: string) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("skillmatch-user"));
}

export function clearUserId() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("skillmatch-user"));
}

/** Returns [userId, ready] — ready is false until hydration finishes. */
export function useUserId(): [string | null, boolean] {
  const [userId, setId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setId(getUserId());
    sync();
    setReady(true);
    window.addEventListener("skillmatch-user", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("skillmatch-user", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return [userId, ready];
}
