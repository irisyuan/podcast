"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TimerProps {
  initialTime?: number; // in seconds
  mode?: "countdown" | "stopwatch";
  onComplete?: () => void;
  className?: string;
  format?: "mm:ss" | "hh:mm:ss";
}

export function Timer({
  initialTime = 0,
  mode = "countdown",
  onComplete,
  className,
  format = "mm:ss",
}: TimerProps) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (mode === "countdown") {
            if (prevTime <= 0) {
              setIsRunning(false);
              onComplete?.();
              return 0;
            }
            return prevTime - 1;
          } else {
            return prevTime + 1;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, mode, onComplete]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (format === "hh:mm:ss") {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTime(initialTime);
    setIsRunning(false);
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="text-4xl font-bold">{formatTime(time)}</div>
      <div className="flex gap-2">
        <button
          onClick={toggleTimer}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={resetTimer}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
        >
          Reset
        </button>
      </div>
    </div>
  );
} 