import { AppHeader } from "@/components/AppHeader";
import { NavigationTabs } from "@/components/NavigationTabs";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <NavigationTabs />
      <div className="flex-grow container mx-auto px-4 py-8">
        {children}
      </div>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} WhisperLog. All rights reserved.</p>
      </footer>
    </div>
  );
}
