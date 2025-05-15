import { ReactNode } from "react";
import { Link } from "react-router-dom";
// import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  footerText?: string;
  footerLink?: {
    text: string;
    href: string;
  };
}

export function SimpleAuthLayout({
  children,
  title,
  description,
  footerText,
  footerLink,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Toaster position="top-center" />
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {children}
          {footerText && footerLink && (
            <div className="text-sm text-muted-foreground">
              {footerText}{" "}
              <Link to={footerLink.href}>
                <Button variant="link" className="p-0 h-auto">
                  {footerLink.text}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 