
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogEntry } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Tag, MessageSquare, Smile, Sparkles, Edit3, Trash2, Volume2, BookOpenText, Brain, Feather, Zap, Lightbulb, HelpCircle } from "lucide-react";
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
import { languageCodes, languages as availableLanguages } from "@/lib/types"; // Import availableLanguages
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
      // Determine language. If not stored with entry, default or try to infer.
      // For now, assuming English if not specified, or using first available language if entry.language is not set.
      // This part might need refinement if entry doesn't store language of spokenInsightText
      const langKey = Object.keys(languageCodes).find(key => 
        entry.spokenInsightText && typeof entry.spokenInsightText === 'string' // A simple heuristic or a stored lang prop would be better
      ) || 'English';
      utterance.lang = languageCodes[langKey as keyof typeof languageCodes] || languageCodes.English;
      
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
      <CardContent className="space-y-4">
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
            <h4 className="font-semibold flex items-center gap-1.5 text-primary"><MessageSquare className="h-4 w-4" /> Notes:</h4>
            <p className="pl-6 text-muted-foreground whitespace-pre-wrap">{entry.notes}</p>
          </div>
        )}
        {entry.interpretation && (
          <div className="text-sm pt-3 mt-3 border-t border-border/50 space-y-2">
            <h4 className="font-semibold text-lg flex items-center gap-1.5 text-accent mb-2"><Sparkles className="h-5 w-5" /> WhisperLog Interpretation:</h4>
            
            <div className="pl-2 space-y-1">
              <p className="flex items-start"><Zap className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/80" /><strong className="font-medium text-foreground/90 mr-1">Message:</strong> {entry.interpretation.theMessage}</p>
              <p className="flex items-start"><Lightbulb className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/80" /><strong className="font-medium text-foreground/90 mr-1">Significance:</strong> {entry.interpretation.spiritualSignificance}</p>
              <p className="flex items-start"><BookOpenText className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/80" /><strong className="font-medium text-foreground/90 mr-1">Ancient Wisdom:</strong> {entry.interpretation.ancientWisdom}</p>
              <p className="flex items-start"><Brain className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/80" /><strong className="font-medium text-foreground/90 mr-1">Context:</strong> {entry.interpretation.context}</p>
              <p className="flex items-start"><Feather className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/80" /><strong className="font-medium text-foreground/90 mr-1">Quote:</strong> <em className="italic">&ldquo;{entry.interpretation.quote}&rdquo;</em></p>
              <p className="flex items-start"><Sparkles className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/80" /><strong className="font-medium text-foreground/90 mr-1">Metaphor:</strong> {entry.interpretation.metaphor}</p>
              <p className="flex items-start"><HelpCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/80" /><strong className="font-medium text-foreground/90 mr-1">Reflection:</strong> {entry.interpretation.reflectionQuestion}</p>
            </div>
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
