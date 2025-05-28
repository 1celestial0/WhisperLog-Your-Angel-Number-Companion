
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogEntry }
from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Tag, MessageSquare, Smile, Sparkles, Edit3, Trash2, Volume2, BookOpenText, Brain, Feather, Zap, Lightbulb, HelpCircle, LanguagesIcon } from "lucide-react";
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
      // Use the language in which the spoken insight was generated
      const langToPlay = entry.spokenInsightLanguage || entry.interpretationLanguage || 'English';
      utterance.lang = languageCodes[langToPlay];
      
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
       toast({ title: "Unsupported", description: "Speech synthesis is not supported in your browser.", variant: "destructive" });
    }
  };

  return (
    <Card className="mb-6 bg-card/70 backdrop-blur-sm shadow-lg shadow-primary/20 hover:shadow-accent/30 transition-shadow duration-300 border-border/50 hover:border-accent/50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-3xl font-handwritten text-accent flex items-center gap-2">
              <Zap className="h-7 w-7 opacity-80" />
              {entry.angelNumber}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <CalendarDays className="h-4 w-4" />
              {format(parseISO(entry.timestamp), "PPPp")}
            </CardDescription>
             {entry.interpretationLanguage && (
              <Badge variant="outline" className="mt-2 text-xs border-accent/50 text-accent/90 bg-accent/10">
                Interpreted in: {entry.interpretationLanguage}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(entry)} aria-label="Edit" className="text-primary/80 hover:text-accent hover:bg-accent/10">
              <Edit3 className="h-5 w-5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Delete" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card/95 backdrop-blur-md border-accent/50">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-handwritten text-accent text-2xl">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-foreground/80">
                    This action cannot be undone. This will permanently delete this log entry and its profound insights from the cosmic record.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="hover:border-accent/70">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(entry.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Yes, Delete It
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1.5 bg-primary/20 text-primary-foreground/80 border-primary/30">
            <Tag className="h-3.5 w-3.5" /> Emotion: {entry.emotion}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1.5 bg-primary/20 text-primary-foreground/80 border-primary/30">
            <Tag className="h-3.5 w-3.5" /> Activity: {entry.activity}
          </Badge>
          {entry.mood && (
            <Badge variant="secondary" className="flex items-center gap-1.5 bg-primary/20 text-primary-foreground/80 border-primary/30">
              <Smile className="h-3.5 w-3.5" /> Mood: {entry.mood}
            </Badge>
          )}
        </div>
        {entry.notes && (
          <div className="text-sm mt-3 pt-3 border-t border-border/30">
            <h4 className="font-semibold flex items-center gap-1.5 text-primary font-handwritten text-lg"><MessageSquare className="h-4 w-4" /> Notes:</h4>
            <p className="pl-1 text-foreground/80 whitespace-pre-wrap">{entry.notes}</p>
          </div>
        )}
        {entry.interpretation && (
          <div className="text-sm pt-3 mt-3 border-t border-border/30 space-y-3">
            <h4 className="font-semibold text-xl flex items-center gap-2 text-accent font-handwritten mb-2"><Sparkles className="h-5 w-5" /> WhisperLog Interpretation:</h4>
            
            <div className="pl-2 space-y-2 text-foreground/90">
              <details className="group">
                <summary className="flex items-start cursor-pointer list-none group-hover:text-accent/90">
                    <Zap className="h-4 w-4 mr-2 mt-1 shrink-0 text-primary/80" />
                    <strong className="font-medium mr-1">The Message:</strong> 
                    <span className="line-clamp-2 group-open:line-clamp-none">{entry.interpretation.theMessage}</span>
                </summary>
                 <p className="whitespace-pre-wrap pl-6 pt-1 text-sm text-foreground/80">{entry.interpretation.theMessage}</p>
              </details>
               <hr className="border-accent/10 my-1"/>
              <details className="group">
                 <summary className="flex items-start cursor-pointer list-none group-hover:text-accent/90">
                    <Lightbulb className="h-4 w-4 mr-2 mt-1 shrink-0 text-primary/80" />
                    <strong className="font-medium mr-1">Spiritual Significance:</strong>
                    <span className="line-clamp-2 group-open:line-clamp-none">{entry.interpretation.spiritualSignificance}</span>
                 </summary>
                 <p className="whitespace-pre-wrap pl-6 pt-1 text-sm text-foreground/80">{entry.interpretation.spiritualSignificance}</p>
              </details>
              <hr className="border-accent/10 my-1"/>
              <details className="group">
                 <summary className="flex items-start cursor-pointer list-none group-hover:text-accent/90">
                    <BookOpenText className="h-4 w-4 mr-2 mt-1 shrink-0 text-primary/80" />
                    <strong className="font-medium mr-1">Ancient Wisdom:</strong>
                     <span className="line-clamp-2 group-open:line-clamp-none">{entry.interpretation.ancientWisdom}</span>
                 </summary>
                 <p className="whitespace-pre-wrap pl-6 pt-1 text-sm text-foreground/80">{entry.interpretation.ancientWisdom}</p>
              </details>
              <hr className="border-accent/10 my-1"/>
               <details className="group">
                 <summary className="flex items-start cursor-pointer list-none group-hover:text-accent/90">
                    <Brain className="h-4 w-4 mr-2 mt-1 shrink-0 text-primary/80" />
                    <strong className="font-medium mr-1">Context:</strong>
                    <span className="line-clamp-2 group-open:line-clamp-none">{entry.interpretation.context}</span>
                </summary>
                <p className="whitespace-pre-wrap pl-6 pt-1 text-sm text-foreground/80">{entry.interpretation.context}</p>
              </details>
              <hr className="border-accent/10 my-1"/>
              <details className="group">
                <summary className="flex items-start cursor-pointer list-none group-hover:text-accent/90">
                  <Feather className="h-4 w-4 mr-2 mt-1 shrink-0 text-primary/80" />
                  <strong className="font-medium mr-1">Quote:</strong> 
                  <em className="italic line-clamp-2 group-open:line-clamp-none">&ldquo;{entry.interpretation.quote}&rdquo;</em>
                </summary>
                 <p className="whitespace-pre-wrap pl-6 pt-1 text-sm text-foreground/80 italic">&ldquo;{entry.interpretation.quote}&rdquo;</p>
              </details>
              <hr className="border-accent/10 my-1"/>
              <details className="group">
                <summary className="flex items-start cursor-pointer list-none group-hover:text-accent/90">
                  <Sparkles className="h-4 w-4 mr-2 mt-1 shrink-0 text-primary/80" />
                  <strong className="font-medium mr-1">Metaphor:</strong>
                  <span className="line-clamp-2 group-open:line-clamp-none">{entry.interpretation.metaphor}</span>
                </summary>
                <p className="whitespace-pre-wrap pl-6 pt-1 text-sm text-foreground/80">{entry.interpretation.metaphor}</p>
              </details>
              <hr className="border-accent/10 my-1"/>
              <details className="group">
                <summary className="flex items-start cursor-pointer list-none group-hover:text-accent/90">
                  <HelpCircle className="h-4 w-4 mr-2 mt-1 shrink-0 text-primary/80" />
                  <strong className="font-medium mr-1">Reflection Question:</strong>
                  <span className="line-clamp-2 group-open:line-clamp-none">{entry.interpretation.reflectionQuestion}</span>
                </summary>
                <p className="whitespace-pre-wrap pl-6 pt-1 text-sm text-foreground/80">{entry.interpretation.reflectionQuestion}</p>
              </details>
            </div>
          </div>
        )}
      </CardContent>
      {entry.spokenInsightText && (
        <CardFooter className="border-t border-border/30 pt-4">
          <Button variant="outline" size="sm" onClick={playSpokenInsight} className="text-primary border-primary hover:bg-primary/10 hover:text-accent gap-2">
            <LanguagesIcon className="h-4 w-4" /> Play Spoken Insight {entry.spokenInsightLanguage && `(in ${entry.spokenInsightLanguage})`}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
