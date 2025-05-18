import { ReactNode } from "react";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <AnimatePresence mode="wait">
        <motion.main 
          key="main-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="ml-[60px] md:ml-[240px] p-6 transition-all duration-300"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Toaster position="top-center" />
    </div>
  );
} 