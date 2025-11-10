import { useState, useEffect, useRef, useCallback } from "react";
import { approximateLocation, hasLocationChanged } from "@/lib/location-utils";

type LocationState = {
  lat: number;
  lng: number;
} | null;

interface UseLocationOptions {
  /**
   * Enable periodic location updates
   * @default false
   */
  watch?: boolean;
  /**
   * Update interval in milliseconds (when watch is enabled)
   * @default 30000 (30 seconds)
   */
  updateInterval?: number;
  /**
   * Minimum distance change in meters to trigger update
   * @default 50
   */
  movementThreshold?: number;
  /**
   * Automatically request location on mount
   * @default false
   */
  autoRequest?: boolean;
}

/**
 * Location hook with browser Geolocation API
 * Supports one-time requests and periodic watching
 */
export function useLocation(options: UseLocationOptions = {}) {
  const {
    watch = false,
    updateInterval = 30000,
    movementThreshold = 50,
    autoRequest = false,
  } = options;

  const [location, setLocation] = useState<LocationState>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<LocationState>(null);

  const updateLocation = useCallback(
    (position: GeolocationPosition) => {
      const exactLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      // Approximate location for privacy
      const approximated = approximateLocation(exactLocation);

      // Only update if location changed significantly (when watching)
      if (watch && !hasLocationChanged(lastLocationRef.current, approximated, movementThreshold)) {
        return;
      }

      lastLocationRef.current = approximated;
      setLocation(approximated);
      setLoading(false);
    },
    [watch, movementThreshold]
  );

  const handleError = useCallback((err: GeolocationPositionError) => {
    setError(err.message);
    setLoading(false);
  }, []);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      updateLocation,
      handleError,
      {
        enableHighAccuracy: false, // Approximate location only
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, [updateLocation, handleError]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    if (watchIdRef.current !== null) {
      return; // Already watching
    }

    setLoading(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      updateLocation,
      handleError,
      {
        enableHighAccuracy: false, // Approximate location only
        timeout: 5000,
        maximumAge: updateInterval,
      }
    );
  }, [updateLocation, handleError, updateInterval]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Auto-request location on mount if enabled
  useEffect(() => {
    if (autoRequest && !location && !error) {
      requestLocation();
    }
  }, [autoRequest, location, error, requestLocation]);

  // Start/stop watching based on watch option
  useEffect(() => {
    if (watch) {
      startWatching();
    } else {
      stopWatching();
    }

    return () => {
      stopWatching();
    };
  }, [watch, startWatching, stopWatching]);

  return {
    location,
    error,
    loading,
    requestLocation,
    startWatching,
    stopWatching,
    isWatching: watchIdRef.current !== null,
  };
}
