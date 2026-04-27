import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";

interface Props {
  mode: "login" | "register";
}

// Google brand SVG (kept inline for self-contained component)
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.5c-2 1.5-4.6 2.5-7.5 2.5-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.5c-.5.5 7.2-5.3 7.2-15 0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

export function SocialAuthButtons({ mode }: Props) {
  // Redirect to backend's OAuth endpoint. Backend will redirect back to
  // /oauth2/redirect?token=... where we extract and store the JWT.
  const handleGoogle = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorize/google?redirect_uri=${encodeURIComponent(
      window.location.origin + "/oauth2/redirect",
    )}`;
  };
  const handleGithub = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorize/github?redirect_uri=${encodeURIComponent(
      window.location.origin + "/oauth2/redirect",
    )}`;
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
        data-testid="google-auth-btn"
      >
        <GoogleIcon />
        <span className="ml-2">
          {mode === "login" ? "Continue with Google" : "Sign up with Google"}
        </span>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGithub}
        data-testid="github-auth-btn"
      >
        <Github className="h-4 w-4" />
        <span className="ml-2">
          {mode === "login" ? "Continue with GitHub" : "Sign up with GitHub"}
        </span>
      </Button>
    </div>
  );
}
