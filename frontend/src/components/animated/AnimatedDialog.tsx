import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, ReactNode } from "react";

// Create a motion version of the DialogContent component
const MotionDialogContent = motion(DialogContent);

export interface AnimatedDialogContentProps extends React.ComponentProps<typeof DialogContent> {
  children: ReactNode;
  className?: string;
}

export const AnimatedDialogContent = forwardRef<HTMLDivElement, AnimatedDialogContentProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <MotionDialogContent
        ref={ref}
        className={className}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        {...props as any}
      >
        {children}
      </MotionDialogContent>
    );
  }
);

AnimatedDialogContent.displayName = "AnimatedDialogContent";

interface AnimatedDialogProps extends React.ComponentProps<typeof Dialog> {
  children: ReactNode;
  open?: boolean;
}

export const AnimatedDialog = ({ children, ...props }: AnimatedDialogProps) => {
  return (
    <Dialog {...props}>
      <AnimatePresence mode="wait">
        {props.open ? children : null}
      </AnimatePresence>
    </Dialog>
  );
}; 