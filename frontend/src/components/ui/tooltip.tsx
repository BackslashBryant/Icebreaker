import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Accessible Tooltip Component
 * 
 * Shows tooltip on hover/focus. Keyboard accessible (focus + Enter to show).
 * Follows brand aesthetic (monospace, terminal-style).
 */
export function Tooltip({ content, children, className = "" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsVisible(!isVisible);
      setIsFocused(true);
    } else if (e.key === "Escape") {
      setIsVisible(false);
      setIsFocused(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={tooltipRef}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => !isFocused && setIsVisible(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setIsVisible(false);
        }}
        onKeyDown={handleKeyDown}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-accent/50 bg-accent/5 text-accent hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        aria-label="More information"
        aria-describedby={isVisible ? "tooltip-content" : undefined}
      >
        {children || <Info className="w-3 h-3" />}
      </button>
      {isVisible && (
        <div
          id="tooltip-content"
          role="tooltip"
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-card border-2 border-accent/50 rounded-lg shadow-lg font-mono text-xs text-foreground z-50 pointer-events-none"
          style={{ maxWidth: "calc(100vw - 2rem)" }}
        >
          <div className="text-accent font-semibold mb-1">Signal Score</div>
          <div className="text-muted-foreground leading-relaxed whitespace-normal">
            {content}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-accent/50" />
        </div>
      )}
    </div>
  );
}

