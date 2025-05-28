export type Emotion = 'Joyful' | 'Hopeful' | 'Curious' | 'Confused' | 'Anxious' | 'Neutral' | 'Peaceful' | 'Excited';
export const emotions: Emotion[] = ['Joyful', 'Hopeful', 'Curious', 'Confused', 'Anxious', 'Neutral', 'Peaceful', 'Excited'];

export type Activity = 'Meditating' | 'Working' | 'Commuting' | 'Relaxing' | 'Exercising' | 'Reading' | 'Socializing' | 'Dreaming' | 'Eating' | 'Other';
export const activities: Activity[] = ['Meditating', 'Working', 'Commuting', 'Relaxing', 'Exercising', 'Reading', 'Socializing', 'Dreaming', 'Eating', 'Other'];

export type Mood = 'Excellent' | 'Good' | 'Okay' | 'Bad' | 'Terrible';
export const moods: Mood[] = ['Excellent', 'Good', 'Okay', 'Bad', 'Terrible'];

export interface LogEntry {
  id: string;
  timestamp: string; // ISO string
  angelNumber: string; // Keep as string for sequences like "1111"
  emotion: Emotion;
  activity: Activity;
  notes?: string;
  interpretation?: string;
  spokenInsightText?: string; // Text generated for speech
  mood?: Mood; 
}

export interface DailyAffirmation {
  date: string; // YYYY-MM-DD
  text: string;
}

export type Language = 'English' | 'Spanish' | 'French' | 'Hindi';
export const languages: Language[] = ['English', 'Spanish', 'French', 'Hindi'];
export const languageCodes: Record<Language, string> = {
  English: 'en-US',
  Spanish: 'es-ES',
  French: 'fr-FR',
  Hindi: 'hi-IN',
};

export type VoiceStyle = 'Calm' | 'Energetic' | 'Warm' | 'Wise' | 'Neutral';
export const voiceStyles: VoiceStyle[] = ['Calm', 'Energetic', 'Warm', 'Wise', 'Neutral'];

// This is a simplified mapping. Real voice style selection would depend on TTS capabilities.
// For browser's SpeechSynthesis, voice selection is by `SpeechSynthesisVoice` objects.
// We can map styles to preferred voice characteristics if available.
export interface VoiceConfig {
  lang: string;
  pitch?: number;
  rate?: number;
}
