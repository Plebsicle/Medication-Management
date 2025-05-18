import { Button, ButtonProps } from "@/components/ui/button";
import { motion } from "framer-motion";
import { forwardRef } from "react";

// Create a motion version of the Button component
// const MotionButton = motion(Button);

export interface AnimatedButtonProps extends ButtonProps {
  whileHoverScale?: number;
  whileTapScale?: number;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ whileHoverScale = 1.05, whileTapScale = 0.95, className = "", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={className}
        {...props}
        {...{
          as: motion.button,
          whileHover: { scale: whileHoverScale },
          whileTap: { scale: whileTapScale },
        }}
      />
    );
  }
);

AnimatedButton.displayName = "AnimatedButton"; 