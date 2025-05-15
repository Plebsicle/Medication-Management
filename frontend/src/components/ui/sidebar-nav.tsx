import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Pill,
  Files, 
  Hospital, 
  MessageSquare, 
  LogOut, 
  User,
  Menu,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  const navItems = [
    
    {
        title: "Profile",
        href: "/profile",
        icon: <User className="h-5 w-5" />,
      },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Medication History",
      href: "/medicationHistory",
      icon: <Pill className="h-5 w-5" />,
    },
    {
      title: "Health Records",
      href: "/health-records",
      icon: <Files className="h-5 w-5" />,
    },
    {
      title: "Medical Documents",
      href: "/medical-documents",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Nearby Hospitals",
      href: "/hospital-location",
      icon: <Hospital className="h-5 w-5" />,
    },
    {
      title: "Medical Assistant",
      href: "/chatbot",
      icon: <MessageSquare className="h-5 w-5" />,
    }
  ];

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged Out Successfully!');
  };

  return (
    <div
      className={cn(
        "flex h-screen fixed left-0 top-0 z-40 flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-[60px]" : "w-[240px]",
        className
      )}
    >
      <div className="flex h-14 items-center border-b px-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-9 w-9"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        {!isCollapsed && (
          <div className="ml-2 font-semibold">Medication Manager</div>
        )}
      </div>
      <nav className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <TooltipProvider key={item.href} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to={item.href}>
                    <Button
                      variant={location.pathname === item.href ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isCollapsed && "justify-center p-2"
                      )}
                    >
                      {item.icon}
                      {!isCollapsed && <span className="ml-2">{item.title}</span>}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </nav>
      <div className="border-t p-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/signin" onClick={handleLogout}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-red-500 hover:bg-red-100 hover:text-red-600",
                    isCollapsed && "justify-center p-2"
                  )}
                >
                  <LogOut className="h-5 w-5" />
                  {!isCollapsed && <span className="ml-2">Logout</span>}
                </Button>
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
} 