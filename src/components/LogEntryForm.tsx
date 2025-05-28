
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
import { interpretAngelNumber, type InterpretAngelNumberOutput } from "@/ai/flows/interpret-angel-number";
import { generateSpokenInsight } from "@/ai/flows/generate-spoken-insight";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  angelNumber: z.string()
    .min(1, { message: "Angel number is required." })
    .regex(/^(?:\d{1,4}|(?:one|two|three|four|five|six|seven|eight|nine|zero)(?:[- ](?:one|two|three|four|five|six|seven|eight|nine|zero)){0,3})$/i, 
      { message: "Enter digits (e.g., 111) or text (e.g., one-one-one)." }
    ),
  emotion: z.enum(emotions, { required_error: "Emotion is required." }),
  activity: z.enum(activities, { required_error: "Activity is required." }),
  notes: z.string().max(1000, { message: "Note cannot exceed 1000 characters." }).optional(),
  mood: z.enum(moods).optional(),
});

type LogEntryFormValues = z.infer<typeof formSchema>;

interface LogEntryFormProps {
  onLogEntry: (entry: LogEntry) => void;
  existingEntry?: LogEntry | null;
}

const textToNumberMapping: { [key: string]: string } = {
  "zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
  "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9",
};

function convertAngelNumberInput(input: string): string {
  const numericOnly = /^\d{1,4}$/.test(input);
  if (numericOnly) return input;

  const words = input.toLowerCase().split(/[\s-]+/);
  const digits = words.map(word => textToNumberMapping[word] || "").join("");
  
  return /^\d{1,4}$/.test(digits) ? digits : "";
}


export function LogEntryForm({ onLogEntry, existingEntry }: LogEntryFormProps) {
  const { toast } = useToast();
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);
  const [isLoadingSpokenInsight, setIsLoadingSpokenInsight] = useState(false);
  const [interpretationResult, setInterpretationResult] = useState<InterpretAngelNumberOutput | null>(existingEntry?.interpretation ?? null);
  const [spokenInsightText, setSpokenInsightText] = useState<string | null>(existingEntry?.spokenInsightText ?? null);
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages.includes('English') ? 'English' : languages[0]);
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState<VoiceStyle>(voiceStyles.includes('Cosmic Neutral') ? 'Cosmic Neutral' : voiceStyles[0]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [noteCharCount, setNoteCharCount] = useState(existingEntry?.notes?.length || 0);

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

  useEffect(() => {
    if (existingEntry) {
      form.reset({
        angelNumber: existingEntry.angelNumber,
        emotion: existingEntry.emotion,
        activity: existingEntry.activity,
        notes: existingEntry.notes || "",
        mood: existingEntry.mood,
      });
      setInterpretationResult(existingEntry.interpretation ?? null);
      setSpokenInsightText(existingEntry.spokenInsightText ?? null);
      setNoteCharCount(existingEntry.notes?.length || 0);
    }
  }, [existingEntry, form]);


  async function onSubmit(values: LogEntryFormValues) {
    setIsLoadingInterpretation(true);
    setInterpretationResult(null);
    setSpokenInsightText(null);

    const processedNumber = convertAngelNumberInput(values.angelNumber);
    if (!processedNumber) {
        form.setError("angelNumber", { type: "manual", message: "Invalid angel number format. Use digits (e.g., 111) or text (e.g., one-one-one), up to 4 digits." });
        setIsLoadingInterpretation(false);
        return;
    }
    
    if (values.angelNumber !== processedNumber) {
        form.setValue("angelNumber", processedNumber);
    }


    try {
      const numberAsInt = parseInt(processedNumber, 10);
      if (isNaN(numberAsInt)) {
        toast({ title: "Error", description: "Invalid angel number after processing.", variant: "destructive" });
        setIsLoadingInterpretation(false);
        return;
      }

      const interpretationData = await interpretAngelNumber({
        number: numberAsInt,
        emotion: values.emotion,
        activity: values.activity,
        notes: values.notes,
      });
      setInterpretationResult(interpretationData);

      const newEntry: LogEntry = {
        id: existingEntry?.id || crypto.randomUUID(),
        timestamp: existingEntry?.timestamp || new Date().toISOString(),
        angelNumber: processedNumber,
        emotion: values.emotion,
        activity: values.activity,
        notes: values.notes,
        mood: values.mood,
        interpretation: interpretationData,
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
    if (!interpretationResult?.theMessage || !form.getValues("angelNumber")) {
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
        notes: interpretationResult.theMessage + (interpretationResult.spiritualSignificance ? " " + interpretationResult.spiritualSignificance : ""),
        language: selectedLanguage,
        voiceStyle: selectedVoiceStyle,
      });
      setSpokenInsightText(spokenData.spokenInsight);
      toast({ title: "Spoken Insight Ready", description: "Spoken insight generated." });

      const currentValues = form.getValues();
      const updatedEntry: LogEntry = {
        id: existingEntry?.id || crypto.randomUUID(), 
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
      window.speechSynthesis.cancel(); 
      window.speechSynthesis.speak(utterance);
    } else {
      toast({ title: "Unsupported", description: "Speech synthesis is not supported in your browser.", variant: "destructive" });
    }
  };
  
  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    if (text.length <= 1000) {
      form.setValue("notes", text);
      setNoteCharCount(text.length);
    } else {
      form.setValue("notes", text.substring(0,1000));
      setNoteCharCount(1000);
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
                    <FormLabel>Angel Number (e.g., 111 or one-one-one)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter number (e.g., 111 or one-one-one)" {...field} className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent placeholder:text-foreground/70" />
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
                        <SelectTrigger className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent">
                          <SelectValue placeholder="Select your emotion" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#3d1a78] text-foreground border-accent">
                        <ScrollArea className="h-[200px]">
                          {emotions.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </ScrollArea>
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
                        <SelectTrigger className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent">
                          <SelectValue placeholder="Select your activity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#3d1a78] text-foreground border-accent">
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
                        <SelectTrigger className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent">
                          <SelectValue placeholder="Select your mood" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#3d1a78] text-foreground border-accent">
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
                    <Textarea 
                      placeholder="Any additional thoughts or context..." 
                      {...field} 
                      onChange={handleNotesChange}
                      className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent placeholder:text-foreground/70" />
                  </FormControl>
                  <div className="text-xs text-muted-foreground text-right pr-1">{noteCharCount}/1000 characters</div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoadingInterpretation}>
              {isLoadingInterpretation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :  <Sparkles className="mr-2 h-4 w-4" />}
              Decode
            </Button>
          </form>
        </Form>
      </CardContent>

      {(interpretationResult || isLoadingInterpretation) && (
        <CardFooter className="flex flex-col items-start gap-4 pt-6">
          <h3 className="text-xl font-semibold text-primary">AI Interpretation:</h3>
          {isLoadingInterpretation && <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating wisdom...</div>}
          
          {interpretationResult && !isLoadingInterpretation && (
             <ScrollArea className="h-64 w-full rounded-md border border-border p-4 bg-[rgba(6,3,15,0.8)] text-foreground space-y-3">
              <div>
                <h4 className="font-bold text-accent">The Message:</h4>
                <p className="whitespace-pre-wrap">{interpretationResult.theMessage}</p>
              </div>
              <div>
                <h4 className="font-bold text-accent">Spiritual Significance:</h4>
                <p className="whitespace-pre-wrap">{interpretationResult.spiritualSignificance}</p>
              </div>
              <div>
                <h4 className="font-bold text-accent">Ancient Wisdom:</h4>
                <p className="whitespace-pre-wrap">{interpretationResult.ancientWisdom}</p>
              </div>
              <div>
                <h4 className="font-bold text-accent">Context:</h4>
                <p className="whitespace-pre-wrap">{interpretationResult.context}</p>
              </div>
              <div>
                <h4 className="font-bold text-accent">Quote:</h4>
                <p className="whitespace-pre-wrap italic">&ldquo;{interpretationResult.quote}&rdquo;</p>
              </div>
              <div>
                <h4 className="font-bold text-accent">Metaphor:</h4>
                <p className="whitespace-pre-wrap">{interpretationResult.metaphor}</p>
              </div>
              <div>
                <h4 className="font-bold text-accent">Reflection Question:</h4>
                <p className="whitespace-pre-wrap">{interpretationResult.reflectionQuestion}</p>
              </div>
            </ScrollArea>
          )}
          
          {interpretationResult && !isLoadingInterpretation && (
            <div className="w-full space-y-4 pt-4">
              <Button variant="outline" onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} className="w-full text-sm">
                {showAdvancedOptions ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                Spoken Insight Options
              </Button>

              {showAdvancedOptions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-card">
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select value={selectedLanguage} onValueChange={(val: Language) => setSelectedLanguage(val)}>
                      <SelectTrigger className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#3d1a78] text-foreground border-accent">
                        {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Voice Style</FormLabel>
                     <Select value={selectedVoiceStyle} onValueChange={(val: VoiceStyle) => setSelectedVoiceStyle(val)}>
                      <SelectTrigger className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#3d1a78] text-foreground border-accent">
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
                  disabled={isLoadingSpokenInsight || !interpretationResult.theMessage}
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

