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
  FileText,
  Stethoscope
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarNavProps {
  className?: string;
}
interface roleItem {
  title: string;
  href: string;
  icon: JSX.Element;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  const [navItems, setNavItems] = useState<roleItem[]>([]);

  useEffect(() => {
    // Add animation effect similar to dashboard
    setIsVisible(true);
    
    if (user) {
      const baseItems = [
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
        },
      ];

      const roleItem =
        user.role === "doctor"
          ? {
              title: "Patient Chats",
              href: "/doctor/chats",
              icon: <Stethoscope className="h-5 w-5" />,
            }
          : {
              title: "Doctor Consultations",
              href: "/patient/chats",
              icon: <Stethoscope className="h-5 w-5" />,
            };

      setNavItems([...baseItems, roleItem]);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success("Logged Out Successfully!");
  };

  return (
    <div
      className={cn(
        "flex h-screen fixed left-0 top-0 z-40 flex-col bg-white shadow-lg transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[260px]",
        className,
        "transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Header with gradient */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
      
      <div className="flex h-16 items-center px-4 border-b border-gray-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-xl"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        {!isCollapsed && (
          <div className="ml-3 font-semibold text-xl text-blue-600">MediTrack</div>
        )}
      </div>
      
      {/* Logo circle for collapsed mode */}
      {isCollapsed && (
        <div className="flex justify-center my-4">
          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-bold">M</span>
          </div>
        </div>
      )}
      
      {/* Navigation items with staggered animation */}
      <nav className="flex-1 overflow-auto p-3">
        <div className="space-y-2">
          {navItems.map((item, index) => (
            <TooltipProvider key={item.href} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to={item.href}>
                    <Button
                      variant={location.pathname === item.href ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start rounded-xl transition-all duration-300",
                        location.pathname === item.href 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "text-gray-600 hover:bg-blue-50 hover:text-blue-600",
                        isCollapsed && "justify-center p-2",
                        "transition-all duration-700 delay-100",
                        isVisible ? "translate-y-0 opacity-100" : `translate-y-4 opacity-0`
                      )}
                      style={{
                        transitionDelay: `${100 + index * 50}ms`
                      }}
                    >
                      {item.icon}
                      {!isCollapsed && <span className="ml-3">{item.title}</span>}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </nav>
      
      {/* Profile section */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 bg-blue-50 rounded-xl p-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
              <User className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="font-medium text-sm text-gray-800">{user.name}</div>
              <div className="text-xs text-gray-500">{user.role}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Logout button */}
      <div className="p-3 border-t border-gray-100">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/signin" onClick={handleLogout}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300",
                    isCollapsed && "justify-center p-2",
                    "transition-all duration-700 delay-700",
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                >
                  <LogOut className="h-5 w-5" />
                  {!isCollapsed && <span className="ml-3">Logout</span>}
                </Button>
              </Link>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}