import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { apiFetch, ApiError } from "@/lib/api";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";
import { toast } from "sonner";
import { Package } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — ShopCart" },
      { name: "description", content: "Sign in to your ShopCart account." },
    ],
  }),
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});
type LoginForm = z.infer<typeof loginSchema>;

interface LoginResponse {
  token: string;
  user: { id: string; email: string; name: string };
}

function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (k: keyof LoginForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const fe: Partial<Record<keyof LoginForm, string>> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof LoginForm;
        if (!fe[k]) fe[k] = i.message;
      }
      setErrors(fe);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      setAuth(res.token, res.user);
      toast.success("Welcome back!");
      router.navigate({ to: "/" });
    } catch (err) {
      let msg = "Login failed";
      if (err instanceof ApiError) {
        if (err.status === 400) msg = "Invalid request. Please check your inputs.";
        else if (err.status === 401) msg = "Invalid email or password.";
        else if (err.status === 409) msg = "Account conflict. Please contact support.";
        else msg = err.message;
      } else if (err instanceof TypeError) {
        // Backend not reachable — common in test/dev. Provide a graceful path.
        msg = "Cannot reach authentication server at http://localhost:8080.";
      }
      setApiError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10 sm:py-16">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Package className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your ShopCart account</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              data-testid="login-email-input"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive" data-testid="login-error-email">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              data-testid="login-password-input"
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-destructive" data-testid="login-error-password">
                {errors.password}
              </p>
            )}
          </div>

          {apiError && (
            <div
              className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              data-testid="login-api-error"
              role="alert"
            >
              {apiError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={submitting}
            data-testid="login-submit-btn"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <SocialAuthButtons mode="login" />

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
            data-testid="go-to-register"
          >
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
