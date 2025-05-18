import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { forwardRef, ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  delay?: number;
}

const MotionDiv = motion.div;

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ hoverEffect = true, delay = 0, className, children, ...props }, ref) => {
    return (
      <MotionDiv
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay }}
        whileHover={
          hoverEffect
            ? {
                scale: 1.02,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }
            : undefined
        }
        {...props}
      >
        <Card className={cn(hoverEffect ? "transition-shadow" : "", className)}>
          {children}
        </Card>
      </MotionDiv>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard"; 