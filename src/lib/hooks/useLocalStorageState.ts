"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

type Listener = () => void;

const listenersByKey = new Map<string, Set<Listener>>();
const snapshotCacheByKey = new Map<string, { raw: string | null; value: unknown }>();

function getListeners(key: string): Set<Listener> {
  let listeners = listenersByKey.get(key);
  if (!listeners) {
    listeners = new Set();
    listenersByKey.set(key, listeners);
  }
  return listeners;
}

// Returns a cached parsed value when the underlying raw string hasn't
// changed, so useSyncExternalStore gets a referentially stable snapshot
// (required to avoid infinite re-render warnings).
function readStorage<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") return initialValue;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    raw = null;
  }

  const cached = snapshotCacheByKey.get(key);
  if (cached && cached.raw === raw) {
    return cached.value as T;
  }

  let value = initialValue;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = initialValue;
    }
  }

  snapshotCacheByKey.set(key, { raw, value });
  return value;
}

function writeStorage<T>(key: string, value: T) {
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    // Storage unavailable (private browsing quota, disabled, etc.) - the
    // in-memory cache still keeps same-tab consumers in sync below.
  }
  snapshotCacheByKey.set(key, { raw, value });
  for (const listener of getListeners(key)) listener();
}

/**
 * Like useState, but persists to localStorage and stays in sync across
 * every component reading the same key within the tab (e.g. a favorite
 * toggled in one component shows up immediately in another). Built on
 * useSyncExternalStore so the client can read localStorage directly during
 * render instead of setting state from an effect - the server snapshot
 * falls back to `initialValue` since localStorage doesn't exist there.
 */
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const initialValueRef = useRef(initialValue);

  const subscribe = useCallback(
    (onStoreChange: Listener) => {
      const listeners = getListeners(key);
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    [key]
  );

  const getSnapshot = useCallback(
    () => readStorage(key, initialValueRef.current),
    [key]
  );
  const getServerSnapshot = useCallback(() => initialValueRef.current, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readStorage(key, initialValueRef.current);
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      writeStorage(key, resolved);
    },
    [key]
  );

  return [value, setValue] as const;
}
