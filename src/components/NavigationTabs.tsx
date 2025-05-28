
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname } from "next/navigation";
import { Edit3, History, LineChart, MessageSquareHeart, Download, SmilePlus } from "lucide-react";

const navItems = [
  { value: "log", label: "Log Entry", href: "/log", icon: Edit3 },
  { value: "timeline", label: "Timeline", href: "/timeline", icon: History },
  { value: "analytics", label: "Analytics", href: "/analytics", icon: LineChart },
  { value: "affirmation", label: "Affirmation", href: "/affirmation", icon: MessageSquareHeart },
  // { value: "mood", label: "Mood Log", href: "/mood", icon: SmilePlus }, // Optional: If mood tracking is separate
];

export function NavigationTabs() {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active tab based on current path
  const activeTab = navItems.find(item => pathname.startsWith(item.href))?.value || "log";

  const onTabChange = (value: string) => {
    const selectedNav = navItems.find(item => item.value === value);
    if (selectedNav) {
      router.push(selectedNav.href);
    }
  };

  return (
    <div className="flex justify-center mt-2 mb-6 px-4">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-12">
          {navItems.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="flex-col sm:flex-row gap-1.5 sm:gap-2 py-2 sm:py-0 h-auto data-[state=active]:bg-primary/20 data-[state=active]:text-accent">
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
