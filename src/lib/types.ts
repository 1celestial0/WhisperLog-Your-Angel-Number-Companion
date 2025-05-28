
import type { InterpretAngelNumberOutput } from "@/ai/flows/interpret-angel-number";

export type Emotion = 'Joyful' | 'Anxious' | 'Inspired' | 'Confused' | 'Peaceful' | 'Curious' | 'Grateful' | 'Overwhelmed' | 'Hopeful' | 'Introspective' | 'Excited' | 'Serene';
export const emotions: Emotion[] = ['Joyful', 'Anxious', 'Inspired', 'Confused', 'Peaceful', 'Curious', 'Grateful', 'Overwhelmed', 'Hopeful', 'Introspective', 'Excited', 'Serene'];

export type Activity = 'Meditating' | 'Working' | 'Driving' | 'Reading' | 'Socializing' | 'Resting' | 'Creating' | 'Exercising' | 'Praying' | 'Contemplating' | 'Journaling' | 'Walking';
export const activities: Activity[] = ['Meditating', 'Working', 'Driving', 'Reading', 'Socializing', 'Resting', 'Creating', 'Exercising', 'Praying', 'Contemplating', 'Journaling', 'Walking'];

export type Mood = 'Excellent' | 'Good' | 'Okay' | 'Bad' | 'Terrible';
export const moods: Mood[] = ['Excellent', 'Good', 'Okay', 'Bad', 'Terrible'];

export type Language = 'English' | 'Bengali' | 'Hindi';
export const languages: Language[] = ['English', 'Bengali', 'Hindi'];
export const languageCodes: Record<Language, string> = {
  English: 'en-US',
  Bengali: 'bn-IN', // Bengali (India)
  Hindi: 'hi-IN',   // Hindi (India)
};

export interface LogEntry {
  id: string;
  timestamp: string; // ISO string
  angelNumber: string; 
  emotion: Emotion;
  activity: Activity;
  notes?: string;
  interpretationLanguage?: Language; // Language of the textual interpretation
  interpretation?: InterpretAngelNumberOutput;
  spokenInsightText?: string; 
  spokenInsightLanguage?: Language; // Language of the generated spoken insight
  mood?: Mood; 
}

export interface DailyAffirmation {
  date: string; // YYYY-MM-DD
  text: string;
}

export type VoiceStyle = 'Divine Feminine' | 'Cosmic Neutral' | 'Sacred Masculine' | 'Calm' | 'Energetic' | 'Warm' | 'Wise' | 'Neutral';
export const voiceStyles: VoiceStyle[] = ['Divine Feminine', 'Cosmic Neutral', 'Sacred Masculine', 'Calm', 'Energetic', 'Warm', 'Wise', 'Neutral'];

export interface VoiceConfig {
  lang: string;
  pitch?: number;
  rate?: number;
}
