
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ChevronDown, ChevronUp, Loader2, Sparkles, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { LogEntry, Emotion, Activity as ActivityType, Mood, Language, VoiceStyle } from "@/lib/types";
import { emotions, activities, moods, languages, voiceStyles, languageCodes } from "@/lib/types";
import { interpretAngelNumber } from "@/ai/flows/interpret-angel-number";
import { generateSpokenInsight } from "@/ai/flows/generate-spoken-insight";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  angelNumber: z.string().min(1, { message: "Angel number is required." }).regex(/^\d+$/, { message: "Must be digits only." }),
  emotion: z.enum(emotions, { required_error: "Emotion is required." }),
  activity: z.enum(activities, { required_error: "Activity is required." }),
  notes: z.string().optional(),
  mood: z.enum(moods).optional(),
});

type LogEntryFormValues = z.infer<typeof formSchema>;

interface LogEntryFormProps {
  onLogEntry: (entry: LogEntry) => void;
  existingEntry?: LogEntry | null;
}

export function LogEntryForm({ onLogEntry, existingEntry }: LogEntryFormProps) {
  const { toast } = useToast();
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);
  const [isLoadingSpokenInsight, setIsLoadingSpokenInsight] = useState(false);
  const [interpretationResult, setInterpretationResult] = useState<string | null>(existingEntry?.interpretation ?? null);
  const [spokenInsightText, setSpokenInsightText] = useState<string | null>(existingEntry?.spokenInsightText ?? null);
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState<VoiceStyle>('Neutral');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const form = useForm<LogEntryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingEntry ? {
      angelNumber: existingEntry.angelNumber,
      emotion: existingEntry.emotion,
      activity: existingEntry.activity,
      notes: existingEntry.notes || "",
      mood: existingEntry.mood,
    } : {
      angelNumber: "",
      emotion: undefined,
      activity: undefined,
      notes: "",
      mood: undefined,
    },
  });

  async function onSubmit(values: LogEntryFormValues) {
    setIsLoadingInterpretation(true);
    setInterpretationResult(null);
    setSpokenInsightText(null);

    try {
      const numberAsInt = parseInt(values.angelNumber, 10);
      if (isNaN(numberAsInt)) {
        toast({ title: "Error", description: "Invalid angel number format.", variant: "destructive" });
        setIsLoadingInterpretation(false);
        return;
      }

      const interpretationData = await interpretAngelNumber({
        number: numberAsInt,
        emotion: values.emotion,
        activity: values.activity,
        notes: values.notes,
      });
      setInterpretationResult(interpretationData.interpretation);

      const newEntry: LogEntry = {
        id: existingEntry?.id || crypto.randomUUID(),
        timestamp: existingEntry?.timestamp || new Date().toISOString(),
        angelNumber: values.angelNumber,
        emotion: values.emotion,
        activity: values.activity,
        notes: values.notes,
        mood: values.mood,
        interpretation: interpretationData.interpretation,
      };
      onLogEntry(newEntry);
      toast({ title: "Entry Logged", description: "Your angel number sighting has been logged and interpreted." });
    } catch (error) {
      console.error("Error interpreting angel number:", error);
      toast({ title: "Interpretation Error", description: "Could not get interpretation. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingInterpretation(false);
    }
  }

  const handleGenerateSpokenInsight = async () => {
    if (!interpretationResult || !form.getValues("angelNumber")) {
      toast({ title: "Missing Data", description: "Cannot generate spoken insight without an interpretation and angel number.", variant: "destructive" });
      return;
    }
    setIsLoadingSpokenInsight(true);
    setSpokenInsightText(null);
    try {
      const spokenData = await generateSpokenInsight({
        number: form.getValues("angelNumber"),
        emotion: form.getValues("emotion"),
        activity: form.getValues("activity"),
        notes: form.getValues("notes"),
        language: selectedLanguage,
        voiceStyle: selectedVoiceStyle,
      });
      setSpokenInsightText(spokenData.spokenInsight);
      toast({ title: "Spoken Insight Ready", description: "Spoken insight generated." });

      // Find the existing entry and update it with spokenInsightText
      // This requires onLogEntry to handle updates or a separate update function.
      // For simplicity, we'll assume onLogEntry can update if id matches.
      const currentValues = form.getValues();
      const updatedEntry: LogEntry = {
        id: existingEntry?.id || crypto.randomUUID(), // This might be an issue if it's a new entry
        timestamp: existingEntry?.timestamp || new Date().toISOString(),
        angelNumber: currentValues.angelNumber,
        emotion: currentValues.emotion,
        activity: currentValues.activity,
        notes: currentValues.notes,
        mood: currentValues.mood,
        interpretation: interpretationResult,
        spokenInsightText: spokenData.spokenInsight,
      };
       onLogEntry(updatedEntry);


    } catch (error) {
      console.error("Error generating spoken insight:", error);
      toast({ title: "Spoken Insight Error", description: "Could not generate spoken insight. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingSpokenInsight(false);
    }
  };
  
  const playSpokenInsight = () => {
    if (!spokenInsightText) {
      toast({ title: "No Insight", description: "No spoken insight text available to play.", variant: "destructive" });
      return;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(spokenInsightText);
      utterance.lang = languageCodes[selectedLanguage];
      // Voice style mapping to specific voices is complex and browser-dependent.
      // For now, we just set the language.
      // You might iterate through window.speechSynthesis.getVoices() to find a matching voice.
      window.speechSynthesis.cancel(); // Cancel any previous speech
      window.speechSynthesis.speak(utterance);
    } else {
      toast({ title: "Unsupported", description: "Speech synthesis is not supported in your browser.", variant: "destructive" });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-3xl font-handwritten text-accent">
          <Sparkles className="h-8 w-8" />
          Log Your Angel Number
        </CardTitle>
        <CardDescription>Capture the moment and its cosmic significance.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="angelNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Angel Number (e.g., 1111, 444)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter number sequence" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emotion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Emotion</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your emotion" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {emotions.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Activity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your activity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         <ScrollArea className="h-[200px]">
                          {activities.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Mood (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your mood" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {moods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional thoughts or context..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoadingInterpretation}>
              {isLoadingInterpretation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Log & Interpret Sighting
            </Button>
          </form>
        </Form>
      </CardContent>

      {(interpretationResult || isLoadingInterpretation) && (
        <CardFooter className="flex flex-col items-start gap-4 pt-6">
          <h3 className="text-xl font-semibold text-primary">AI Interpretation:</h3>
          {isLoadingInterpretation && <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating wisdom...</div>}
          {interpretationResult && !isLoadingInterpretation && (
            <ScrollArea className="h-32 w-full rounded-md border border-border p-3 bg-background/50">
              <p className="text-foreground whitespace-pre-wrap">{interpretationResult}</p>
            </ScrollArea>
          )}
          
          {interpretationResult && !isLoadingInterpretation && (
            <div className="w-full space-y-4">
              <Button variant="outline" onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} className="w-full text-sm">
                {showAdvancedOptions ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                Spoken Insight Options
              </Button>

              {showAdvancedOptions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select value={selectedLanguage} onValueChange={(val: Language) => setSelectedLanguage(val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Voice Style</FormLabel>
                     <Select value={selectedVoiceStyle} onValueChange={(val: VoiceStyle) => setSelectedVoiceStyle(val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {voiceStyles.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 w-full">
                 <Button 
                  onClick={handleGenerateSpokenInsight} 
                  className="w-full sm:w-auto flex-grow bg-primary hover:bg-primary/90" 
                  disabled={isLoadingSpokenInsight || !interpretationResult}
                >
                  {isLoadingSpokenInsight ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="mr-2 h-4 w-4" />}
                  Generate Spoken Insight
                </Button>
                <Button 
                  onClick={playSpokenInsight} 
                  className="w-full sm:w-auto flex-grow" 
                  variant="secondary"
                  disabled={!spokenInsightText || isLoadingSpokenInsight}
                >
                  <Volume2 className="mr-2 h-4 w-4" /> Play Insight
                </Button>
              </div>
              {isLoadingSpokenInsight && <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Crafting audio experience...</div>}
              {spokenInsightText && !isLoadingSpokenInsight && (
                <ScrollArea className="h-24 w-full rounded-md border border-border p-3 bg-background/50 mt-2">
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{spokenInsightText}</p>
                </ScrollArea>
              )}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
