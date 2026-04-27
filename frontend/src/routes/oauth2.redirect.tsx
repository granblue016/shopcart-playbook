import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { setToken, apiFetch, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * OAuth2 callback handler.
 * Backend redirects here with ?token=<JWT> (or #token=<JWT>).
 * We extract, store, and (if possible) fetch the user profile.
 */
export const Route = createFileRoute("/oauth2/redirect")({
  head: () => ({
    meta: [{ title: "Signing you in… — ShopCart" }],
  }),
  component: OAuthRedirectPage,
});

function OAuthRedirectPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

    const token = params.get("token") ?? hashParams.get("token");
    const error = params.get("error") ?? hashParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMsg(decodeURIComponent(error));
      toast.error(`Login failed: ${error}`);
      return;
    }

    if (!token) {
      setStatus("error");
      setErrorMsg("No authentication token was provided in the callback URL.");
      return;
    }

    // Persist token to localStorage immediately so subsequent API calls include it.
    setToken(token);

    // Try to fetch profile; fall back to token-decoded info if backend unreachable.
    (async () => {
      try {
        const user = await apiFetch<{ id: string; email: string; name: string }>("/api/auth/me");
        setAuth(token, user);
        toast.success(`Welcome, ${user.name}!`);
        router.navigate({ to: "/" });
      } catch (err) {
        // Decode minimal info from JWT payload as fallback (safe — no signature trust).
        try {
          const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
          const user = {
            id: String(payload.sub ?? payload.id ?? "unknown"),
            email: String(payload.email ?? "user@example.com"),
            name: String(payload.name ?? payload.email?.split("@")[0] ?? "User"),
          };
          setAuth(token, user);
          toast.success(`Welcome, ${user.name}!`);
          router.navigate({ to: "/" });
        } catch {
          const msg =
            err instanceof ApiError
              ? `Could not fetch profile (status ${err.status}).`
              : "Authentication server unreachable.";
          setStatus("error");
          setErrorMsg(msg);
        }
      }
    })();
  }, [router, setAuth]);

  if (status === "loading") {
    return (
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4"
        data-testid="oauth-loading"
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center"
      data-testid="oauth-error"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <h1 className="text-xl font-bold">Sign-in failed</h1>
      <p className="text-sm text-muted-foreground" data-testid="oauth-error-message">
        {errorMsg}
      </p>
      <Button onClick={() => router.navigate({ to: "/login" })}>Back to login</Button>
    </div>
  );
}
