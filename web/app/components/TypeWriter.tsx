"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  showCursor?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  showCursor = true,
  onComplete,
  className = "",
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(
        () => {
          setDisplayedText((prev) => prev + text[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        },
        currentIndex === 0 ? delay : speed,
      );

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, delay, isComplete, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor}
    </span>
  );
}
