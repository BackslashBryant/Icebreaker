import { useState, useEffect } from "react";

type LocationState = {
  lat: number;
  lng: number;
} | null;

export function useLocation() {
  const [location, setLocation] = useState<LocationState>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: false, // Approximate location only
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  return { location, error, loading, requestLocation };
}
