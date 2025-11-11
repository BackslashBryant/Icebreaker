import { useEffect, useRef } from "react";
import { Person } from "@/hooks/useRadar";

interface RadarSweepProps {
  people: Person[];
  onSelectPerson: (person: Person) => void;
  emptyMessage?: string;
}

/**
 * RadarSweep Component
 * 
 * CRT-style radar sweep visualization.
 * Respects prefers-reduced-motion for accessibility.
 */
export function RadarSweep({
  people,
  onSelectPerson,
  emptyMessage = "No one here — yet.",
}: RadarSweepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const sweepAngleRef = useRef(0);
  const selectedIndexRef = useRef(0);
  // Check for reduced motion preference (with fallback for test environments)
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const size = Math.min(window.innerWidth - 32, 400);
    canvas.width = size;
    canvas.height = size;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Calculate max signal for normalization
    const maxSignal = Math.max(...people.map((p) => p.signal), 1);

    // Draw radar background
    const drawBackground = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw concentric circles
      ctx.strokeStyle = "rgba(0, 184, 217, 0.2)"; // Teal with opacity
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius * i) / 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.stroke();
    };

    // Draw person dots
    const drawPeople = () => {
      people.forEach((person) => {
        // Normalize signal (0-1) and map to distance from center
        const normalizedSignal = person.signal / maxSignal;
        const distance = radius * (1 - normalizedSignal * 0.7); // Keep some margin from edge

        // Calculate angle (distribute evenly around circle, with slight randomization based on signal)
        const baseAngle = (people.indexOf(person) / people.length) * Math.PI * 2;
        const angle = baseAngle + (normalizedSignal * 0.2); // Slight variation

        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        // Draw pulse effect (stronger for higher signals)
        const pulseSize = 8 + normalizedSignal * 12;
        const pulseOpacity = 0.3 + normalizedSignal * 0.4;

        ctx.fillStyle = `rgba(0, 184, 217, ${pulseOpacity})`;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw main dot
        ctx.fillStyle = "rgba(0, 184, 217, 0.9)";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Store clickable area (simplified - use bounding box)
        // In production, you'd want to track clickable regions more precisely
      });
    };

    // Draw sweep line
    const drawSweep = () => {
      if (prefersReducedMotion) return; // Skip sweep animation if reduced motion

      const sweepLength = radius * 0.8;
      const endX = centerX + Math.cos(sweepAngleRef.current) * sweepLength;
      const endY = centerY + Math.sin(sweepAngleRef.current) * sweepLength;

      // Gradient for sweep line
      const gradient = ctx.createLinearGradient(centerX, centerY, endX, endY);
      gradient.addColorStop(0, "rgba(0, 184, 217, 0.8)");
      gradient.addColorStop(1, "rgba(0, 184, 217, 0)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Update sweep angle
      sweepAngleRef.current += 0.02; // Slow rotation
      if (sweepAngleRef.current > Math.PI * 2) {
        sweepAngleRef.current = 0;
      }
    };

    // Handle clicks
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Find closest person dot
      let closestPerson: Person | null = null;
      let closestDistance = Infinity;

      const maxSignal = Math.max(...people.map((p) => p.signal), 1);

      people.forEach((person) => {
        const normalizedSignal = person.signal / maxSignal;
        const distance = radius * (1 - normalizedSignal * 0.7);
        const baseAngle = (people.indexOf(person) / people.length) * Math.PI * 2;
        const angle = baseAngle + (normalizedSignal * 0.2);

        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        const dist = Math.sqrt(
          Math.pow(clickX - x, 2) + Math.pow(clickY - y, 2)
        );

        if (dist < 20 && dist < closestDistance) {
          closestDistance = dist;
          closestPerson = person;
        }
      });

      if (closestPerson) {
        onSelectPerson(closestPerson);
      }
    };

    canvas.addEventListener("click", handleClick);

    // Animation loop
    const animate = () => {
      drawBackground();
      drawPeople();
      drawSweep();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      canvas.removeEventListener("click", handleClick);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [people, onSelectPerson, prefersReducedMotion]);

  // Reset selected index when people list changes
  useEffect(() => {
    selectedIndexRef.current = 0;
  }, [people]);

  if (people.length === 0) {
    return (
      <div
        className="text-center py-12 text-muted-foreground font-mono"
        role="status"
        aria-live="polite"
      >
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center" role="region" aria-label="Radar visualization">
      <canvas
        ref={canvasRef}
        className="border-2 border-accent/30 rounded-lg"
        aria-label={`Radar visualization showing ${people.length} nearby ${people.length === 1 ? 'person' : 'people'}. Higher signal scores appear closer to center.`}
        role="img"
        tabIndex={0}
        onKeyDown={(e) => {
          if (people.length === 0) return;
          
          // Arrow key navigation: left/right to cycle through people
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            selectedIndexRef.current = (selectedIndexRef.current - 1 + people.length) % people.length;
            // Announce selection to screen readers
            const person = people[selectedIndexRef.current];
            canvasRef.current?.setAttribute("aria-label", `Radar visualization. Selected: ${person.handle}, signal score ${person.signal.toFixed(1)}. Press Enter to open.`);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            selectedIndexRef.current = (selectedIndexRef.current + 1) % people.length;
            // Announce selection to screen readers
            const person = people[selectedIndexRef.current];
            canvasRef.current?.setAttribute("aria-label", `Radar visualization. Selected: ${person.handle}, signal score ${person.signal.toFixed(1)}. Press Enter to open.`);
          } else if (e.key === "Enter" || e.key === " ") {
            // Enter or Space to select current person
            e.preventDefault();
            onSelectPerson(people[selectedIndexRef.current]);
          }
        }}
      />
      {/* Screen reader only: List of people for accessibility */}
      <div className="sr-only" aria-live="polite">
        <ul>
          {people.map((person, index) => (
            <li key={person.sessionId}>
              Person {index + 1}: {person.handle}, signal score {person.signal.toFixed(1)}, vibe {person.vibe}
              {person.proximity && `, proximity ${person.proximity}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

