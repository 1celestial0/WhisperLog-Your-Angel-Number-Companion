
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  // FormItem, // No longer used for the problematic section
  // FormLabel, // No longer used for the problematic section
  FormMessage,
} from "@/components/ui/form"; // Keep for the main form
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
import { ChevronDown, ChevronUp, Loader2, Mic, Sparkles, Volume2, BookOpen, LanguagesIcon, Wand2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { LogEntry, Emotion, Activity as ActivityType, Mood, Language, VoiceStyle } from "@/lib/types";
import { emotions, activities, moods, languages, voiceStyles, languageCodes } from "@/lib/types";
import { interpretAngelNumber, type InterpretAngelNumberOutput } from "@/ai/flows/interpret-angel-number";
import { generateSpokenInsight } from "@/ai/flows/generate-spoken-insight";
import { polishNote } from "@/ai/flows/polish-note-flow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label"; // Import the standard Label

// For conceptual i18n demonstration
const uiText: Record<Language, { angelNumberLabel: string, notesLabel: string, decodeButton: string }> = {
  English: { angelNumberLabel: "Angel Number", notesLabel: "Notes (Optional)", decodeButton: "Decode 🔮" },
  Bengali: { angelNumberLabel: "অ্যাঞ্জেল নম্বর", notesLabel: "নোট (ঐচ্ছিক)", decodeButton: "ডিকোড করুন 🔮" },
  Hindi: { angelNumberLabel: "एंजेल नंबर", notesLabel: "टिप्पणियाँ (वैकल्पिक)", decodeButton: "डिकोड करें 🔮" },
};

const formSchema = z.object({
  angelNumber: z.string()
    .min(1, { message: "Angel number is required." })
    .regex(/^(?:\d{1,4}|(?:one|two|three|four|five|six|seven|eight|nine|zero)(?:[- ](?:one|two|three|four|five|six|seven|eight|nine|zero)){0,3})$/i, 
      { message: "Enter digits (e.g., 111) or text (e.g., one-one-one)." }
    ),
  interpretationLanguage: z.enum(languages, { required_error: "Interpretation language is required."}),
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
  const [isLoadingPolishNote, setIsLoadingPolishNote] = useState(false);
  const [interpretationResult, setInterpretationResult] = useState<InterpretAngelNumberOutput | null>(existingEntry?.interpretation ?? null);
  
  const [selectedInterpretationLanguageState, setSelectedInterpretationLanguageState] = useState<Language>(existingEntry?.interpretationLanguage || 'English'); // Renamed to avoid conflict with form field if any
  const [selectedSpokenLanguage, setSelectedSpokenLanguage] = useState<Language>(existingEntry?.spokenInsightLanguage || languages[0]);
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState<VoiceStyle>(voiceStyles[0]);

  const [spokenInsightText, setSpokenInsightText] = useState<string | null>(existingEntry?.spokenInsightText ?? null);
  
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [noteCharCount, setNoteCharCount] = useState(existingEntry?.notes?.length || 0);
  
  const [isListeningAngelNumber, setIsListeningAngelNumber] = useState(false);
  const angelNumberRecognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListeningNotes, setIsListeningNotes] = useState(false);
  const notesRecognitionRef = useRef<SpeechRecognition | null>(null);

  const [currentUiLanguage, setCurrentUiLanguage] = useState<Language>('English');
  const [currentUiText, setCurrentUiText] = useState(uiText.English);


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
      interpretationLanguage: 'English', // Default for new entries
      emotion: undefined,
      activity: undefined,
      notes: "",
      mood: undefined,
    },
  });

  useEffect(() => {
    const globalLang = localStorage.getItem('whisperlog_language') as Language;
    if (languages.includes(globalLang)) {
      setCurrentUiLanguage(globalLang);
      setCurrentUiText(uiText[globalLang] || uiText.English);
      if (!existingEntry) { // Only set defaults for new entries
        form.setValue("interpretationLanguage", globalLang);
        setSelectedInterpretationLanguageState(globalLang);
        setSelectedSpokenLanguage(globalLang);
      }
    }

    if (existingEntry) {
      form.reset({
        angelNumber: existingEntry.angelNumber,
        emotion: existingEntry.emotion,
        activity: existingEntry.activity,
        notes: existingEntry.notes || "",
        mood: existingEntry.mood,
        interpretationLanguage: existingEntry.interpretationLanguage || globalLang || 'English',
      });
      setInterpretationResult(existingEntry.interpretation ?? null);
      setSelectedInterpretationLanguageState(existingEntry.interpretationLanguage || globalLang || 'English');
      setSpokenInsightText(existingEntry.spokenInsightText ?? null);
      setSelectedSpokenLanguage(existingEntry.spokenInsightLanguage || existingEntry.interpretationLanguage || globalLang || 'English');
      setNoteCharCount(existingEntry.notes?.length || 0);
    } else {
      // For new entries, ensure interpretationLanguage is set from global or default
      const defaultLang = globalLang || 'English';
      if(form.getValues("interpretationLanguage") !== defaultLang) { // Check if it's already set (e.g. by previous logic)
         form.setValue("interpretationLanguage", defaultLang);
      }
      setSelectedInterpretationLanguageState(defaultLang);
      setSelectedSpokenLanguage(defaultLang);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingEntry, form.reset, form.setValue]); // Removed form.getValues from dep array as it changes on every render


  const initializeRecognition = useCallback((
    recognitionRef: React.MutableRefObject<SpeechRecognition | null>,
    onResult: (transcript: string) => void,
    lang?: string
  ) => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionImpl();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = lang || languageCodes[currentUiLanguage] || 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length -1][0].transcript.trim();
        onResult(transcript);
      };
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        let errorMessage = "Speech recognition error.";
        if (event.error === 'no-speech') errorMessage = "No speech detected.";
        else if (event.error === 'audio-capture') errorMessage = "Microphone error.";
        else if (event.error === 'not-allowed') errorMessage = "Microphone access denied.";
        toast({ title: "Speech Recognition Error", description: errorMessage, variant: "destructive" });
      };
    }
  }, [currentUiLanguage, toast]);
  
  useEffect(() => {
    initializeRecognition(angelNumberRecognitionRef, (transcript) => {
      const numericTranscript = convertAngelNumberInput(transcript);
      if (numericTranscript) {
        form.setValue("angelNumber", numericTranscript);
      } else {
        const spokenWords = transcript.toLowerCase().split(/[\s-]+/);
        const mappedNumbers = spokenWords.map(word => textToNumberMapping[word] || word).join("");
        if (/^\d{1,4}$/.test(mappedNumbers)) {
          form.setValue("angelNumber", mappedNumbers);
        } else {
          toast({ title: "Speech Recognition", description: `Could not convert "${transcript}" to a valid number.`, variant: "destructive" });
        }
      }
      setIsListeningAngelNumber(false);
    }, 'en-US'); 

    initializeRecognition(notesRecognitionRef, async (transcript) => {
        setIsListeningNotes(false);
        setIsLoadingPolishNote(true);
        try {
            const { polishedNote } = await polishNote({ rawNote: transcript });
            form.setValue("notes", polishedNote);
            setNoteCharCount(polishedNote.length);
            toast({ title: "Note Polished", description: "Your spoken note has been refined." });
        } catch (error) {
            console.error("Error polishing note:", error);
            toast({ title: "Note Polishing Error", description: "Could not polish the note. Using raw input.", variant: "destructive" });
            form.setValue("notes", transcript); 
            setNoteCharCount(transcript.length);
        } finally {
            setIsLoadingPolishNote(false);
        }
    }, languageCodes[currentUiLanguage] || 'en-US'); 

    return () => {
        angelNumberRecognitionRef.current?.abort();
        notesRecognitionRef.current?.abort();
    }
  }, [initializeRecognition, form, toast, currentUiLanguage]);


  const handleMicClick = (
    recognitionRef: React.MutableRefObject<SpeechRecognition | null>,
    isListening: boolean,
    setIsListening: React.Dispatch<React.SetStateAction<boolean>>,
    listeningToastTitle: string
  ) => {
    if (!recognitionRef.current) {
      toast({ title: "Unsupported", description: "Speech recognition not available.", variant: "destructive" });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({ title: listeningToastTitle, description: "Please speak clearly." });
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
    
    const processedNumber = convertAngelNumberInput(values.angelNumber);
    if (!processedNumber) {
        form.setError("angelNumber", { type: "manual", message: "Invalid angel number format." });
        setIsLoadingInterpretation(false);
        return;
    }
    if (values.angelNumber !== processedNumber) form.setValue("angelNumber", processedNumber);

    try {
      const numberAsInt = parseInt(processedNumber, 10);
      const interpretationData = await interpretAngelNumber({
        number: numberAsInt,
        emotion: values.emotion,
        activity: values.activity,
        notes: values.notes,
        targetLanguage: values.interpretationLanguage,
      });
      setInterpretationResult(interpretationData);
      setSelectedInterpretationLanguageState(values.interpretationLanguage); // Update state for spoken insight source
      setSelectedSpokenLanguage(values.interpretationLanguage); // Default spoken to interpretation lang

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
        spokenInsightLanguage: values.interpretationLanguage, 
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
        sourceLanguage: form.getValues("interpretationLanguage"), // Language of the existing text interpretation
        targetLanguage: selectedSpokenLanguage,   // Target language for speech
        voiceStyle: selectedVoiceStyle,
      });
      setSpokenInsightText(spokenData.spokenInsight);
      toast({ title: "Spoken Insight Ready", description: `Spoken insight generated in ${selectedSpokenLanguage}.` });

      const currentValues = form.getValues();
      const updatedEntry: LogEntry = {
        id: existingEntry?.id || crypto.randomUUID(), 
        timestamp: existingEntry?.timestamp || new Date().toISOString(),
        angelNumber: convertAngelNumberInput(currentValues.angelNumber),
        emotion: currentValues.emotion,
        activity: currentValues.activity,
        notes: currentValues.notes,
        mood: currentValues.mood,
        interpretationLanguage: currentValues.interpretationLanguage,
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
        <Form {...form}> {/* Main Form Provider Start */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="angelNumber"
                render={({ field }) => (
                  // Using ShadCN FormItem and FormLabel here as they are inside <Form>
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-foreground/90">{currentUiText.angelNumberLabel}</Label>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input id={field.name} placeholder="e.g., 111 or one-one-one" {...field} className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent placeholder:text-foreground/70 flex-grow" />
                      </FormControl>
                       <Button type="button" variant="outline" size="icon" onClick={() => handleMicClick(angelNumberRecognitionRef, isListeningAngelNumber, setIsListeningAngelNumber, "Listening for Angel Number...")} className={`border-accent text-accent hover:bg-accent/10 ${isListeningAngelNumber ? 'bg-accent/20 animate-pulse' : ''}`} aria-label="Use microphone for angel number">
                        <Mic className={`h-5 w-5 ${isListeningAngelNumber ? 'text-destructive' : ''}`} />
                      </Button>
                    </div>
                    <FormMessage />
                  </div>
                )}
              />
               <FormField
                control={form.control}
                name="interpretationLanguage"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-foreground/90">Interpretation Language</Label>
                    <Select onValueChange={(value: Language) => {field.onChange(value); setSelectedInterpretationLanguageState(value);}} value={field.value}>
                      <FormControl>
                        <SelectTrigger id={field.name} className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#3d1a78] text-foreground border-accent">
                        {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="emotion"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-foreground/90">Your Emotion</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger id={field.name} className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent">
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
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="activity"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-foreground/90">Your Activity</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger id={field.name} className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent">
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
                  </div>
                )}
              />
               <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={field.name} className="text-foreground/90">Overall Mood (Optional)</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger id={field.name} className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent">
                          <SelectValue placeholder="Select your mood" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#3d1a78] text-foreground border-accent">
                        {moods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </div>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-foreground/90">{currentUiText.notesLabel}</Label>
                   <div className="flex items-center gap-2">
                    <FormControl>
                      <Textarea 
                        id={field.name}
                        placeholder="Any additional thoughts or context..." 
                        {...field} 
                        onChange={handleNotesChange}
                        className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent placeholder:text-foreground/70 min-h-[100px] flex-grow" />
                    </FormControl>
                     <Button type="button" variant="outline" size="icon" onClick={() => handleMicClick(notesRecognitionRef, isListeningNotes, setIsListeningNotes, "Listening for Notes...")} className={`border-accent text-accent hover:bg-accent/10 self-start ${isListeningNotes ? 'bg-accent/20 animate-pulse' : ''}`} aria-label="Use microphone for notes">
                       {isLoadingPolishNote ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className={`h-5 w-5 ${isListeningNotes ? 'text-destructive' : ''}`} />}
                      </Button>
                  </div>
                  <div className="text-xs text-muted-foreground text-right pr-1">{noteCharCount}/1000</div>
                  <FormMessage />
                </div>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 font-handwritten tracking-wider" disabled={isLoadingInterpretation || isLoadingPolishNote}>
              {isLoadingInterpretation ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> :  <Wand2 className="mr-2 h-5 w-5" />}
              {currentUiText.decodeButton}
            </Button>
          </form>
        </Form> {/* Main Form Provider End */}
      </CardContent>

      {(interpretationResult || isLoadingInterpretation) && (
        <CardFooter className="flex flex-col items-start gap-4 pt-6 border-t border-border/50 mt-4">
          <h3 className="text-2xl font-handwritten text-accent flex items-center gap-2">
            <Wand2 className="h-6 w-6"/>
            WhisperLog Interpretation
          </h3>
          {isLoadingInterpretation && <div className="flex items-center text-muted-foreground self-center py-4"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating wisdom in {form.getValues("interpretationLanguage")}...</div>}
          
          {interpretationResult && !isLoadingInterpretation && (
             <ScrollArea className="h-auto max-h-[30rem] w-full rounded-md border border-accent/50 p-4 bg-[rgba(6,3,15,0.85)] text-foreground/90 shadow-inner shadow-accent/20">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">The Message:</h4>
                  <p className="whitespace-pre-wrap pl-2 text-sm leading-relaxed">{interpretationResult.theMessage}</p>
                </div>
                <hr className="border-accent/20 my-3"/>
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">Spiritual Significance:</h4>
                  <p className="whitespace-pre-wrap pl-2 text-sm leading-relaxed">{interpretationResult.spiritualSignificance}</p>
                </div>
                 <hr className="border-accent/20 my-3"/>
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">Ancient Wisdom:</h4>
                  <p className="whitespace-pre-wrap pl-2 text-sm leading-relaxed">{interpretationResult.ancientWisdom}</p>
                </div>
                 <hr className="border-accent/20 my-3"/>
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">Context:</h4>
                  <p className="whitespace-pre-wrap pl-2 text-sm leading-relaxed">{interpretationResult.context}</p>
                </div>
                 <hr className="border-accent/20 my-3"/>
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">Quote:</h4>
                  <p className="whitespace-pre-wrap italic pl-2 text-sm leading-relaxed">&ldquo;{interpretationResult.quote}&rdquo;</p>
                </div>
                 <hr className="border-accent/20 my-3"/>
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">Metaphor:</h4>
                  <p className="whitespace-pre-wrap pl-2 text-sm leading-relaxed">{interpretationResult.metaphor}</p>
                </div>
                 <hr className="border-accent/20 my-3"/>
                <div>
                  <h4 className="font-bold text-accent/90 font-handwritten text-xl">Reflection Question:</h4>
                  <p className="whitespace-pre-wrap pl-2 text-sm leading-relaxed">{interpretationResult.reflectionQuestion}</p>
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
                  {/* These are NOT part of react-hook-form, so use standard div/Label */}
                  <div className="space-y-2">
                    <Label className="text-foreground/90">Spoken Language</Label>
                    <Select value={selectedSpokenLanguage} onValueChange={(val: Language) => setSelectedSpokenLanguage(val)}>
                      <SelectTrigger className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#3d1a78] text-foreground border-accent">
                        {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/90">Voice Style</Label>
                     <Select value={selectedVoiceStyle} onValueChange={(val: VoiceStyle) => setSelectedVoiceStyle(val)}>
                      <SelectTrigger className="bg-[rgba(6,3,15,0.9)] text-foreground border-accent"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#3d1a78] text-foreground border-accent">
                         <ScrollArea className="h-[150px]">
                          {voiceStyles.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
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
              {isLoadingSpokenInsight && <div className="flex items-center text-muted-foreground self-center py-2"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Crafting audio in {selectedSpokenLanguage}...</div>}
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

    