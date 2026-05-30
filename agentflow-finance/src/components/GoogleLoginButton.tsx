import { useEffect, useRef } from "react";
import { authApi } from "@/lib/api";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_SCRIPT_ID = "google-identity";

const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(GOOGLE_SCRIPT_ID)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });
};

export function GoogleLoginButton({
  onSuccess,
  onError,
}: {
  onSuccess?: (user: any) => void;
  onError?: (message: string) => void;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      onError?.("Google client ID is not configured");
      return;
    }

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential?: string }) => {
            try {
              if (!response.credential) {
                throw new Error("Missing Google credential");
              }
              const result = await authApi.googleLogin(response.credential);
              onSuccess?.(result.user);
            } catch (error: any) {
              onError?.(error.message || "Google login failed");
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
        });
      })
      .catch((error) => {
        if (!cancelled) {
          onError?.(error.message || "Google login unavailable");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onSuccess, onError]);

  return <div ref={buttonRef} />;
}
