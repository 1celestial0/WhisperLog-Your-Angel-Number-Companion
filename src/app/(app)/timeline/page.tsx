
"use client";

import { useState } from "react";
import useSyncedLogEntries from "@/hooks/useSyncedLogEntries";
import type { LogEntry } from "@/lib/types";
import { TimelineEntryCard } from "@/components/TimelineEntryCard";
import { LogEntryForm } from "@/components/LogEntryForm"; // For editing
import { Button } from "@/components/ui/button";
import { Download, History, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

export default function TimelinePage() {
  const [logEntries, setLogEntries] = useSyncedLogEntries();
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (entry: LogEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setLogEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
  };

  const handleSaveEdit = (updatedEntry: LogEntry) => {
    setLogEntries(prevEntries => 
      prevEntries.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry)
    );
    setIsEditDialogOpen(false);
    setEditingEntry(null);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(logEntries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'whisperlog_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const sortedEntries = [...logEntries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold flex items-center gap-2 text-primary font-handwritten">
          <History className="h-8 w-8" />
          Your Spiritual Timeline
        </h2>
        <Button onClick={handleExportData} variant="outline" className="border-accent text-accent hover:bg-accent/10">
          <Download className="mr-2 h-4 w-4" /> Export All Data
        </Button>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center">
          <Image src="https://placehold.co/300x200.png" alt="Empty timeline" width={300} height={200} className="rounded-lg mb-6 opacity-70" data-ai-hint="spiritual journey" />
          <p className="text-xl text-muted-foreground">Your timeline is currently empty.</p>
          <p className="text-muted-foreground">Start logging your angel number sightings to see them here.</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-20rem)] pr-4"> {/* Adjust height as needed */}
          {sortedEntries.map(entry => (
            <TimelineEntryCard 
              key={entry.id} 
              entry={entry} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </ScrollArea>
      )}

      {editingEntry && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if(!open) { setEditingEntry(null); setIsEditDialogOpen(false); } else { setIsEditDialogOpen(true); }}}>
          <DialogContent className="max-w-2xl bg-card/90 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-accent">Edit Log Entry</DialogTitle>
               <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => { setIsEditDialogOpen(false); setEditingEntry(null); }}>
                <X className="h-5 w-5" />
              </Button>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] p-1">
              <LogEntryForm onLogEntry={handleSaveEdit} existingEntry={editingEntry} />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
