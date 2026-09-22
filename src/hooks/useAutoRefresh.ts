"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `callback` every `intervalMs` and when the tab regains focus.
 */
export function useAutoRefresh(
  callback: () => void,
  intervalMs: number = 15000
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => savedCallback.current();
    const id = setInterval(tick, intervalMs);
    const onFocus = () => tick();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [intervalMs]);
}