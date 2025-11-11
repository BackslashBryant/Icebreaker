import { useState, useEffect } from "react";

const REDUCED_MOTION_KEY = "icebreaker:reduced-motion";
const HIGH_CONTRAST_KEY = "icebreaker:high-contrast";

/**
 * useAccessibility Hook
 * 
 * Manages accessibility preferences (reduced-motion, high-contrast) with LocalStorage persistence.
 */
export function useAccessibility() {
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [highContrast, setHighContrastState] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load preferences from LocalStorage on mount
  useEffect(() => {
    try {
      // Check system preference for reduced motion
      const systemPrefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Load user preference or default to system preference
      const storedReducedMotion = localStorage.getItem(REDUCED_MOTION_KEY);
      const reducedMotionValue =
        storedReducedMotion !== null
          ? storedReducedMotion === "true"
          : systemPrefersReducedMotion;

      const storedHighContrast = localStorage.getItem(HIGH_CONTRAST_KEY);
      const highContrastValue =
        storedHighContrast !== null ? storedHighContrast === "true" : false;

      setReducedMotionState(reducedMotionValue);
      setHighContrastState(highContrastValue);

      // Apply classes immediately
      applyAccessibilityClasses(reducedMotionValue, highContrastValue);
    } catch (error) {
      console.error("Error loading accessibility preferences:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply accessibility classes to document
  const applyAccessibilityClasses = (
    reducedMotion: boolean,
    highContrast: boolean
  ) => {
    const html = document.documentElement;

    if (reducedMotion) {
      html.classList.add("reduced-motion");
    } else {
      html.classList.remove("reduced-motion");
    }

    if (highContrast) {
      html.classList.add("high-contrast");
    } else {
      html.classList.remove("high-contrast");
    }
  };

  const setReducedMotion = (value: boolean) => {
    try {
      localStorage.setItem(REDUCED_MOTION_KEY, String(value));
      setReducedMotionState(value);
      applyAccessibilityClasses(value, highContrast);
    } catch (error) {
      console.error("Error saving reduced motion preference:", error);
    }
  };

  const setHighContrast = (value: boolean) => {
    try {
      localStorage.setItem(HIGH_CONTRAST_KEY, String(value));
      setHighContrastState(value);
      applyAccessibilityClasses(reducedMotion, value);
    } catch (error) {
      console.error("Error saving high contrast preference:", error);
    }
  };

  return {
    reducedMotion,
    highContrast,
    setReducedMotion,
    setHighContrast,
    loading,
  };
}

