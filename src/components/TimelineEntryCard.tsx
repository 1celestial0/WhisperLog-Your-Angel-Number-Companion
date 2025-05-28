
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogEntry } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Tag, MessageSquare, Smile, Sparkles, Edit3, Trash2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { languageCodes } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";


interface TimelineEntryCardProps {
  entry: LogEntry;
  onEdit: (entry: LogEntry) => void;
  onDelete: (id: string) => void;
}

export function TimelineEntryCard({ entry, onEdit, onDelete }: TimelineEntryCardProps) {
  const { toast } = useToast();
  const playSpokenInsight = () => {
    if (!entry.spokenInsightText) {
      toast({ title: "No Insight", description: "No spoken insight text available to play.", variant: "destructive" });
      return;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(entry.spokenInsightText);
      // Assuming English for now, or it needs to be stored with the entry
      utterance.lang = languageCodes['English']; // Default or stored language
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
       toast({ title: "Unsupported", description: "Speech synthesis is not supported in your browser.", variant: "destructive" });
    }
  };

  return (
    <Card className="mb-6 bg-card/70 backdrop-blur-sm shadow-lg shadow-primary/20 hover:shadow-accent/30 transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold text-accent">
              {entry.angelNumber}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <CalendarDays className="h-4 w-4" />
              {format(parseISO(entry.timestamp), "PPPp")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(entry)} aria-label="Edit">
              <Edit3 className="h-5 w-5 text-primary hover:text-accent" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Delete">
                  <Trash2 className="h-5 w-5 text-destructive hover:text-destructive/80" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this log entry.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(entry.id)} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" /> Emotion: {entry.emotion}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" /> Activity: {entry.activity}
          </Badge>
          {entry.mood && (
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <Smile className="h-3.5 w-3.5" /> Mood: {entry.mood}
            </Badge>
          )}
        </div>
        {entry.notes && (
          <div className="text-sm">
            <h4 className="font-semibold flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-primary" /> Notes:</h4>
            <p className="pl-2 text-muted-foreground whitespace-pre-wrap">{entry.notes}</p>
          </div>
        )}
        {entry.interpretation && (
          <div className="text-sm pt-2 border-t border-border/50">
            <h4 className="font-semibold flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-accent" /> AI Interpretation:</h4>
            <p className="pl-2 text-foreground whitespace-pre-wrap">{entry.interpretation}</p>
          </div>
        )}
      </CardContent>
      {entry.spokenInsightText && (
        <CardFooter>
          <Button variant="outline" size="sm" onClick={playSpokenInsight} className="text-primary border-primary hover:bg-primary/10">
            <Volume2 className="mr-2 h-4 w-4" /> Play Spoken Insight
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
