const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function createSession(data) {
  const response = await fetch(`${API_BASE_URL}/api/onboarding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { code: "UNKNOWN_ERROR", message: "Failed to create session" },
    }));
    throw new Error(error.error?.message || "Failed to create session");
  }

  return response.json();
}
