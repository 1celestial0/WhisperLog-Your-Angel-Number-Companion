
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
import { ChevronDown, ChevronUp, Loader2, Mic, Sparkles, Volume2, BookOpen, LanguagesIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  interpretationLanguage: z.enum(languages, { required_error: "Interpretation language is required."}),
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
  const [currentInterpretationLanguage, setCurrentInterpretationLanguage] = useState<Language>(existingEntry?.interpretationLanguage || 'English');
  const [spokenInsightText, setSpokenInsightText] = useState<string | null>(existingEntry?.spokenInsightText ?? null);
  
  const [selectedSpokenLanguage, setSelectedSpokenLanguage] = useState<Language>(existingEntry?.spokenInsightLanguage || languages[0]);
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState<VoiceStyle>(voiceStyles[0]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [noteCharCount, setNoteCharCount] = useState(existingEntry?.notes?.length || 0);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const form = useForm<LogEntryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingEntry ? {
      angelNumber: existingEntry.angelNumber,
      emotion: existingEntry.emotion,
      activity: existingEntry.activity,
      notes: existingEntry.notes || "",
      mood: existingEntry.mood,
      interpretationLanguage: existingEntry.interpretationLanguage || 'English',
    } : {
      angelNumber: "",
      emotion: undefined,
      activity: undefined,
      notes: "",
      mood: undefined,
      interpretationLanguage: 'English',
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
        interpretationLanguage: existingEntry.interpretationLanguage || 'English',
      });
      setInterpretationResult(existingEntry.interpretation ?? null);
      setCurrentInterpretationLanguage(existingEntry.interpretationLanguage || 'English');
      setSpokenInsightText(existingEntry.spokenInsightText ?? null);
      setSelectedSpokenLanguage(existingEntry.spokenInsightLanguage || (existingEntry.interpretationLanguage || 'English'));
      setNoteCharCount(existingEntry.notes?.length || 0);
    }
  }, [existingEntry, form]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US'; 

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length -1][0].transcript.trim();
        const numericTranscript = convertAngelNumberInput(transcript);
        if (numericTranscript) {
          form.setValue("angelNumber", numericTranscript);
        } else {
           const spokenWords = transcript.toLowerCase().split(/[\s-]+/);
           const mappedNumbers = spokenWords.map(word => textToNumberMapping[word] || word).join("");
            if (/^\d{1,4}$/.test(mappedNumbers)) {
                 form.setValue("angelNumber", mappedNumbers);
            } else {
                toast({ title: "Speech Recognition", description: `Could not convert "${transcript}" to a valid number. Please try again or type manually.`, variant: "destructive" });
            }
        }
        setIsListening(false);
      };
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        let errorMessage = "Speech recognition error. Please try again.";
        if (event.error === 'no-speech') errorMessage = "No speech detected.";
        else if (event.error === 'audio-capture') errorMessage = "Microphone error.";
        else if (event.error === 'not-allowed') errorMessage = "Microphone access denied.";
        toast({ title: "Speech Recognition Error", description: errorMessage, variant: "destructive" });
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.setValue, toast]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      toast({ title: "Unsupported", description: "Speech recognition not available on this device.", variant: "destructive" });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({ title: "Listening...", description: "Please say the angel number." });
      } catch (e) {
         toast({ title: "Speech Error", description: "Could not start listening. Check mic permissions.", variant: "destructive" });
         setIsListening(false);
      }
    }
  };

  async function onSubmit(values: LogEntryFormValues) {
    setIsLoadingInterpretation(true);
    setInterpretationResult(null);
    setSpokenInsightText(null);
    setCurrentInterpretationLanguage(values.interpretationLanguage); // Store the language used for this interpretation

    const processedNumber = convertAngelNumberInput(values.angelNumber);
    if (!processedNumber) {
        form.setError("angelNumber", { type: "manual", message: "Invalid angel number format." });
        setIsLoadingInterpretation(false);
        return;
    }
    
    if (values.angelNumber !== processedNumber) {
        form.setValue("angelNumber", processedNumber);
    }

    try {
      const numberAsInt = parseInt(processedNumber, 10);
      if (isNaN(numberAsInt)) {
        toast({ title: "Error", description: "Invalid angel number.", variant: "destructive" });
        setIsLoadingInterpretation(false);
        return;
      }

      const interpretationData = await interpretAngelNumber({
        number: numberAsInt,
        emotion: values.emotion,
        activity: values.activity,
        notes: values.notes,
        targetLanguage: values.interpretationLanguage,
      });
      setInterpretationResult(interpretationData);
      setSelectedSpokenLanguage(values.interpretationLanguage); // Default spoken language to interpretation language

      const newEntry: LogEntry = {
        id: existingEntry?.id || crypto.randomUUID(),
        timestamp: existingEntry?.timestamp || new Date().toISOString(),
        angelNumber: processedNumber,
        emotion: values.emotion,
        activity: values.activity,
        notes: values.notes,
        mood: values.mood,
        interpretationLanguage: values.interpretationLanguage,
        interpretation: interpretationData,
      };
      onLogEntry(newEntry);
      toast({ title: "Entry Logged", description: `Sighting logged & interpreted in ${values.interpretationLanguage}.` });
    } catch (error) {
      console.error("Error interpreting angel number:", error);
      toast({ title: "Interpretation Error", description: "Could not get interpretation.", variant: "destructive" });
    } finally {
      setIsLoadingInterpretation(false);
    }
  }

  const handleGenerateSpokenInsight = async () => {
    if (!interpretationResult) {
      toast({ title: "Missing Data", description: "Cannot generate spoken insight without an interpretation.", variant: "destructive" });
      return;
    }
    setIsLoadingSpokenInsight(true);
    setSpokenInsightText(null);
    try {
      const spokenData = await generateSpokenInsight({
        interpretationContent: interpretationResult,
        sourceLanguage: currentInterpretationLanguage, // Language of the existing text interpretation
        targetLanguage: selectedSpokenLanguage,   // Target language for speech
        voiceStyle: selectedVoiceStyle,
      });
      setSpokenInsightText(spokenData.spokenInsight);
      toast({ title: "Spoken Insight Ready", description: `Spoken insight generated in ${selectedSpokenLanguage}.` });

      const currentValues = form.getValues();
      const updatedEntry: LogEntry = {
        id: existingEntry?.id || crypto.randomUUID(), 
        timestamp: existingEntry?.timestamp || new Date().toISOString(),
        angelNumber: currentValues.angelNumber,
        emotion: currentValues.emotion,
        activity: currentValues.activity,
        notes: currentValues.notes,
        mood: currentValues.mood,
        interpretationLanguage: currentInterpretationLanguage,
        interpretation: interpretationResult,
        spokenInsightText: spokenData.spokenInsight,
        spokenInsightLanguage: selectedSpokenLanguage,
      };
       onLogEntry(updatedEntry);

    } catch (error) {
      console.error("Error generating spoken insight:", error);
      toast({ title: "Spoken Insight Error", description: "Could not generate spoken insight.", variant: "destructive" });
    } finally {
      setIsLoadingSpokenInsight(false);
    }
  };
  
  const playSpokenInsight = () => {
    if (!spokenInsightText) {
      toast({ title: "No Insight", description: "No spoken insight text available.", variant: "destructive" });
      return;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(spokenInsightText);
      utterance.lang = languageCodes[selectedSpokenLanguage]; 
      window.speechSynthesis.cancel(); 
      window.speechSynthesis.speak(utterance);
    } else {
      toast({ title: "Unsupported", description: "Speech synthesis not supported.", variant: "destructive" });
    }
  };
  
  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    form.setValue("notes", text.substring(0,1000));
    setNoteCharCount(text.substring(0,1000).length);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-3xl font-handwritten text-accent">
          <BookOpen className="h-8 w-8" />
          Log Your Angel Number
        </CardTitle>
        <CardDescription className="text-foreground/80">Capture the moment and its cosmic significance.</CardDescription>
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
                    <FormLabel className="text-foreground/90">Angel Number</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder="e.g., 111 or one-one-one" {...field} className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent placeholder:text-foreground/70 flex-grow" />
                      </FormControl>
                       <Button type="button" variant="outline" size="icon" onClick={handleMicClick} className={`border-accent text-accent hover:bg-accent/10 ${isListening ? 'bg-accent/20 animate-pulse' : ''}`} aria-label="Use microphone">
                        <Mic className={`h-5 w-5 ${isListening ? 'text-destructive' : ''}`} />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="interpretationLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/90">Interpretation Language</FormLabel>
                    <Select onValueChange={(value: Language) => {field.onChange(value); setCurrentInterpretationLanguage(value);}} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#3d1a78] text-foreground border-accent">
                        {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emotion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/90">Your Emotion</FormLabel>
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
                    <FormLabel className="text-foreground/90">Your Activity</FormLabel>
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
                  <FormItem className="md:col-span-2"> {/* Span across two columns on medium screens */}
                    <FormLabel className="text-foreground/90">Overall Mood (Optional)</FormLabel>
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
                  <FormLabel className="text-foreground/90">Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional thoughts or context..." 
                      {...field} 
                      onChange={handleNotesChange}
                      className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent placeholder:text-foreground/70 min-h-[100px]" />
                  </FormControl>
                  <div className="text-xs text-muted-foreground text-right pr-1">{noteCharCount}/1000</div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 font-handwritten tracking-wider" disabled={isLoadingInterpretation}>
              {isLoadingInterpretation ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> :  <Sparkles className="mr-2 h-5 w-5" />}
              Decode <span className="text-xl ml-1">🔮</span>
            </Button>
          </form>
        </Form>
      </CardContent>

      {(interpretationResult || isLoadingInterpretation) && (
        <CardFooter className="flex flex-col items-start gap-4 pt-6 border-t border-border/50 mt-4">
          <h3 className="text-2xl font-handwritten text-accent flex items-center gap-2">
            <Sparkles className="h-6 w-6"/>
            WhisperLog Interpretation
          </h3>
          {isLoadingInterpretation && <div className="flex items-center text-muted-foreground self-center py-4"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating wisdom in {form.getValues("interpretationLanguage")}...</div>}
          
          {interpretationResult && !isLoadingInterpretation && (
             <ScrollArea className="h-72 w-full rounded-md border border-accent/50 p-4 bg-[rgba(6,3,15,0.85)] text-foreground/90 shadow-inner shadow-accent/20">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">The Message:</h4>
                  <p className="whitespace-pre-wrap pl-2">{interpretationResult.theMessage}</p>
                </div>
                <hr className="border-accent/20 my-3"/>
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">Spiritual Significance:</h4>
                  <p className="whitespace-pre-wrap pl-2">{interpretationResult.spiritualSignificance}</p>
                </div>
                 <hr className="border-accent/20 my-3"/>
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">Ancient Wisdom:</h4>
                  <p className="whitespace-pre-wrap pl-2">{interpretationResult.ancientWisdom}</p>
                </div>
                 <hr className="border-accent/20 my-3"/>
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">Context:</h4>
                  <p className="whitespace-pre-wrap pl-2">{interpretationResult.context}</p>
                </div>
                 <hr className="border-accent/20 my-3"/>
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">Quote:</h4>
                  <p className="whitespace-pre-wrap italic pl-2">&ldquo;{interpretationResult.quote}&rdquo;</p>
                </div>
                 <hr className="border-accent/20 my-3"/>
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">Metaphor:</h4>
                  <p className="whitespace-pre-wrap pl-2">{interpretationResult.metaphor}</p>
                </div>
                 <hr className="border-accent/20 my-3"/>
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">Reflection Question:</h4>
                  <p className="whitespace-pre-wrap pl-2">{interpretationResult.reflectionQuestion}</p>
                </div>
              </div>
            </ScrollArea>
          )}
          
          {interpretationResult && !isLoadingInterpretation && (
            <div className="w-full space-y-4 pt-4">
              <Button variant="outline" onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} className="w-full text-sm border-primary/50 text-primary/90 hover:bg-primary/10 hover:text-accent">
                {showAdvancedOptions ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                Spoken Insight Options
              </Button>

              {showAdvancedOptions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-primary/30 rounded-md bg-card/50">
                  <FormItem>
                    <FormLabel className="text-foreground/90">Spoken Language</FormLabel>
                    <Select value={selectedSpokenLanguage} onValueChange={(val: Language) => setSelectedSpokenLanguage(val)}>
                      <SelectTrigger className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#3d1a78] text-foreground border-accent">
                        {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                  <FormItem>
                    <FormLabel className="text-foreground/90">Voice Style</FormLabel>
                     <Select value={selectedVoiceStyle} onValueChange={(val: VoiceStyle) => setSelectedVoiceStyle(val)}>
                      <SelectTrigger className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#3d1a78] text-foreground border-accent">
                         <ScrollArea className="h-[150px]">
                          {voiceStyles.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </FormItem>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 w-full">
                 <Button 
                  onClick={handleGenerateSpokenInsight} 
                  className="w-full sm:w-auto flex-grow bg-primary hover:bg-primary/90 text-base py-3" 
                  disabled={isLoadingSpokenInsight || !interpretationResult.theMessage}
                >
                  {isLoadingSpokenInsight ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LanguagesIcon className="mr-2 h-4 w-4" />}
                  Generate Spoken Insight
                </Button>
                <Button 
                  onClick={playSpokenInsight} 
                  className="w-full sm:w-auto flex-grow text-base py-3" 
                  variant="secondary"
                  disabled={!spokenInsightText || isLoadingSpokenInsight}
                >
                  <Volume2 className="mr-2 h-4 w-4" /> Play Insight
                </Button>
              </div>
              {isLoadingSpokenInsight && <div className="flex items-center text-muted-foreground self-center py-2"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Crafting audio experience in {selectedSpokenLanguage}...</div>}
              {spokenInsightText && !isLoadingSpokenInsight && (
                <ScrollArea className="h-24 w-full rounded-md border border-border/50 p-3 bg-background/60 mt-2">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{spokenInsightText}</p>
                </ScrollArea>
              )}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
