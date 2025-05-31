"use client";

import { useState } from "react";
import { TypewriterText } from "./TypeWriter";

interface MultiTypewriterProps {
  texts: string[];
  speed?: number;
  pauseBetween?: number;
  className?: string;
}

export function MultiTypewriter({
  texts,
  speed = 50,
  pauseBetween = 1000,
  className = "",
}: MultiTypewriterProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const handleComplete = () => {
    setTimeout(() => {
      setCurrentTextIndex((prev) => (prev + 1) % texts.length);
    }, pauseBetween);
  };

  return (
    <TypewriterText
      key={currentTextIndex}
      text={texts[currentTextIndex]}
      speed={speed}
      onComplete={handleComplete}
      className={className}
    />
  );
}
