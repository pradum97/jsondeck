"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type ResizableSplitProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  initialRatio?: number;
  onRatioChange?: (ratio: number) => void;
};

export function ResizableSplit({
  left,
  right,
  initialRatio = 0.6,
  onRatioChange,
}: ResizableSplitProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ratio, setRatio] = useState(initialRatio);
  const isDragging = useRef(false);

  const updateRatio = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const nextRatio = (clientX - rect.left) / rect.width;
      const clamped = Math.min(0.78, Math.max(0.22, nextRatio));
      setRatio(clamped);
      onRatioChange?.(clamped);
    },
    [onRatioChange]
  );

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!isDragging.current) return;
      updateRatio(event.clientX);
    };
    const handleUp = () => {
      isDragging.current = false;
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [updateRatio]);

  return (
    <div ref={containerRef} className="relative flex h-full w-full">
      <div
        className="h-full"
        style={{ width: `${ratio * 100}%` }}
        aria-label="Editor pane"
      >
        {left}
      </div>
      <motion.div
        className="group relative flex h-full w-3 cursor-col-resize items-center justify-center"
        onMouseDown={() => {
          isDragging.current = true;
        }}
        whileHover={{ scaleX: 1.2 }}
        transition={{ duration: 0.15 }}
        role="separator"
        aria-orientation="vertical"
      >
        <div className="h-3/4 w-[2px] rounded-full bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent shadow-[0_0_12px_rgba(56,189,248,0.6)]" />
      </motion.div>
      <div className="h-full flex-1">{right}</div>
    </div>
  );
}
