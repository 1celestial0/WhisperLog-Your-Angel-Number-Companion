
"use client";

import { useEffect, useState, useCallback } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { DailyAffirmation, LogEntry } from "@/lib/types";
import { generateDailyAffirmation } from "@/ai/flows/generate-daily-affirmation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquareHeart, RefreshCw, Sparkles } from "lucide-react";
import { format } from "date-fns";

export function DailyAffirmationCard() {
  const [affirmation, setAffirmation] = useLocalStorage<DailyAffirmation | null>("dailyAffirmation", null);
  const [logEntries] = useLocalStorage<LogEntry[]>("logEntries", []);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [todayStr, setTodayStr] = useState("");
  const [currentDateDisplay, setCurrentDateDisplay] = useState<string>("");

  useEffect(() => {
    // This runs only on the client after hydration
    const now = new Date();
    setTodayStr(format(now, "yyyy-MM-dd"));
    setCurrentDateDisplay(format(now, "EEEE, MMMM do"));
  }, []);


  const fetchAffirmation = useCallback(async (forceRefresh = false) => {
    if (!todayStr) return; // Don't fetch if todayStr isn't set yet

    setIsLoading(true);
    try {
      const recentLogs = logEntries.slice(0, 5).map(entry => 
        `Date: ${format(new Date(entry.timestamp), "PP")}, Number: ${entry.angelNumber}, Emotion: ${entry.emotion}, Activity: ${entry.activity}${entry.notes ? ", Notes: " + entry.notes : ""}`
      ).join("\n");
      
      const loggedDataSummary = recentLogs || "No recent logs.";

      const result = await generateDailyAffirmation({
        loggedData: loggedDataSummary,
        currentDate: todayStr,
        astrologicalEvents: "Consider general positive energies for today." 
      });
      const newAffirmation = { date: todayStr, text: result.affirmation };
      setAffirmation(newAffirmation);
      if (forceRefresh) {
        toast({ title: "Affirmation Refreshed", description: "A new affirmation for today has been generated." });
      }
    } catch (error) {
      console.error("Error generating daily affirmation:", error);
      toast({ title: "Affirmation Error", description: "Could not generate daily affirmation.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [logEntries, todayStr, setAffirmation, toast]);

  useEffect(() => {
    if (todayStr && (!affirmation || affirmation.date !== todayStr)) {
      fetchAffirmation();
    }
  }, [todayStr, affirmation, fetchAffirmation]);

  return (
    <Card className="w-full max-w-xl mx-auto bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/30 border-accent/30">
      <CardHeader className="flex flex-row justify-between items-start">
        <div className="flex flex-col">
          <CardTitle className="flex items-center gap-2 text-3xl font-handwritten text-accent mb-2">
            <MessageSquareHeart className="h-8 w-8" />
            Daily Affirmation
          </CardTitle>
          <CardDescription className="text-foreground/80">{currentDateDisplay || "Loading date..."}</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => fetchAffirmation(true)} disabled={isLoading} aria-label="Refresh affirmation" className="text-accent/80 hover:text-accent hover:bg-accent/10">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
        </Button>
      </CardHeader>
      <CardContent className="text-center py-8 min-h-[10rem] flex items-center justify-center">
        {isLoading && !affirmation?.text && (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Summoning cosmic inspiration...</p>
          </div>
        )}
        {!isLoading && affirmation?.text && (
          <p className="text-2xl md:text-3xl font-handwritten leading-relaxed text-foreground animate-fadeIn">
            &ldquo;{affirmation.text}&rdquo;
          </p>
        )}
        {!isLoading && !affirmation?.text && todayStr && ( // Only show "No affirmation" if date is loaded
           <div className="flex flex-col items-center justify-center">
             <Sparkles className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No affirmation yet. Try refreshing!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simple fadeIn animation for Tailwind
const animation = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
`;

if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = animation;
  document.head.appendChild(styleSheet);
}
