
"use client";

import { LogEntryForm } from "@/components/LogEntryForm";
import useSyncedLogEntries from "@/hooks/useSyncedLogEntries";
import type { LogEntry } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function LogPage() {
  const [logEntries, setLogEntries] = useSyncedLogEntries();
  const { toast } = useToast();

  const handleLogEntry = (newEntry: LogEntry) => {
    setLogEntries(prevEntries => {
      const existingIndex = prevEntries.findIndex(entry => entry.id === newEntry.id);
      if (existingIndex > -1) {
        // Update existing entry
        const updatedEntries = [...prevEntries];
        updatedEntries[existingIndex] = newEntry;
        return updatedEntries;
      } else {
        // Add new entry
        return [newEntry, ...prevEntries];
      }
    });
  };

  return (
    <div className="space-y-8">
      <LogEntryForm onLogEntry={handleLogEntry} />
      {/* Optionally, display a few recent entries here for quick reference */}
    </div>
  );
}
