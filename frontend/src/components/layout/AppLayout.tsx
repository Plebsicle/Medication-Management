import { ReactNode } from "react";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { Toaster } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="ml-[60px] md:ml-[240px] p-6 transition-all duration-300">
        {children}
      </main>
      <Toaster position="top-center" />
    </div>
  );
} 