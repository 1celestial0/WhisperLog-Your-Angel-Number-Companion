
import type { InterpretAngelNumberOutput } from "@/ai/flows/interpret-angel-number";

export type Emotion = 'Joyful' | 'Anxious' | 'Inspired' | 'Confused' | 'Peaceful' | 'Curious' | 'Grateful' | 'Overwhelmed' | 'Hopeful' | 'Introspective' | 'Excited' | 'Serene';
export const emotions: Emotion[] = ['Joyful', 'Anxious', 'Inspired', 'Confused', 'Peaceful', 'Curious', 'Grateful', 'Overwhelmed', 'Hopeful', 'Introspective', 'Excited', 'Serene'];

export type Activity = 'Meditating' | 'Working' | 'Driving' | 'Reading' | 'Socializing' | 'Resting' | 'Creating' | 'Exercising' | 'Praying' | 'Contemplating' | 'Journaling' | 'Walking';
export const activities: Activity[] = ['Meditating', 'Working', 'Driving', 'Reading', 'Socializing', 'Resting', 'Creating', 'Exercising', 'Praying', 'Contemplating', 'Journaling', 'Walking'];

export type Mood = 'Excellent' | 'Good' | 'Okay' | 'Bad' | 'Terrible';
export const moods: Mood[] = ['Excellent', 'Good', 'Okay', 'Bad', 'Terrible'];

export interface LogEntry {
  id: string;
  timestamp: string; // ISO string
  angelNumber: string; // Keep as string for sequences like "1111"
  emotion: Emotion;
  activity: Activity;
  notes?: string;
  interpretation?: InterpretAngelNumberOutput; // Updated to new structured type
  spokenInsightText?: string; // Text generated for speech
  mood?: Mood; 
}

export interface DailyAffirmation {
  date: string; // YYYY-MM-DD
  text: string;
}

export type Language = 'English' | 'Bengali' | 'Hindi';
export const languages: Language[] = ['English', 'Bengali', 'Hindi'];
export const languageCodes: Record<Language, string> = {
  English: 'en-US',
  Bengali: 'bn-IN',
  Hindi: 'hi-IN',
};

export type VoiceStyle = 'Divine Feminine' | 'Cosmic Neutral' | 'Sacred Masculine' | 'Calm' | 'Energetic' | 'Warm' | 'Wise' | 'Neutral';
export const voiceStyles: VoiceStyle[] = ['Divine Feminine', 'Cosmic Neutral', 'Sacred Masculine', 'Calm', 'Energetic', 'Warm', 'Wise', 'Neutral'];

// This is a simplified mapping. Real voice style selection would depend on TTS capabilities.
// For browser's SpeechSynthesis, voice selection is by `SpeechSynthesisVoice` objects.
// We can map styles to preferred voice characteristics if available.
export interface VoiceConfig {
  lang: string;
  pitch?: number;
  rate?: number;
}
