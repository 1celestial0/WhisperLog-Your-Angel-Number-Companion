
"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import type { LogEntry } from "@/lib/types";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { LineChart } from "lucide-react";
import Image from "next/image";

export default function AnalyticsPage() {
  const [logEntries] = useLocalStorage<LogEntry[]>("logEntries", []);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold flex items-center gap-2 text-primary font-handwritten">
        <LineChart className="h-8 w-8" />
        Spiritual Insights Dashboard
      </h2>
      
      {logEntries.length === 0 ? (
         <div className="text-center py-12 flex flex-col items-center">
          <Image src="https://placehold.co/300x200.png" alt="Empty analytics" width={300} height={200} className="rounded-lg mb-6 opacity-70" data-ai-hint="data chart"/>
          <p className="text-xl text-muted-foreground">No analytics to display yet.</p>
          <p className="text-muted-foreground">Log your sightings to uncover patterns in your journey.</p>
        </div>
      ) : (
        <AnalyticsCharts entries={logEntries} />
      )}
    </div>
  );
}
