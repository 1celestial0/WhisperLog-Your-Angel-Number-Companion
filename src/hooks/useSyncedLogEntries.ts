"use client";

import { useCallback, useEffect } from 'react';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import useLocalStorage from './useLocalStorage';
import type { LogEntry } from '@/lib/types';
import { db } from '@/lib/firebase';

const COLLECTION_PATH = 'logEntries';
const DOC_ID = 'entries';

export default function useSyncedLogEntries() {
  const [entries, setEntries] = useLocalStorage<LogEntry[]>(COLLECTION_PATH, []);

  const saveToFirestore = useCallback(async (newEntries: LogEntry[]) => {
    const ref = doc(db, COLLECTION_PATH, DOC_ID);
    await setDoc(ref, { entries: newEntries });
  }, []);

  useEffect(() => {
    const ref = doc(db, COLLECTION_PATH, DOC_ID);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data().entries as LogEntry[];
        if (data) {
          setEntries(data);
        }
      }
    });
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data().entries as LogEntry[];
        setEntries(data);
      }
    });
    return () => unsub();
  }, [setEntries]);
  const updateEntries = useCallback(
    (updater: LogEntry[] | ((prev: LogEntry[]) => LogEntry[])) => {
      setEntries((prev) => {
        const value = typeof updater === 'function' ? (updater as (prev: LogEntry[]) => LogEntry[])(prev) : updater;
        saveToFirestore(value);
        return value;
      });
    },
    [setEntries, saveToFirestore]
  );

  return [entries, updateEntries] as const;
}
