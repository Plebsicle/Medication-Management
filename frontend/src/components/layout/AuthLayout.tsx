import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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

export function AuthLayout({
  children,
  title,
  description,
  footerText,
  footerLink,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        {footerText && footerLink && (
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              {footerText}{' '}
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link to={footerLink.href}>{footerLink.text}</Link>
              </Button>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 