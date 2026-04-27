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

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — ShopCart" },
      { name: "description", content: "Create your free ShopCart account." },
    ],
  }),
  component: RegisterPage,
});

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().trim().email("Invalid email address").max(255),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128)
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

interface RegisterResponse {
  token: string;
  user: { id: string; email: string; name: string };
}

function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (k: keyof RegisterForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const fe: Partial<Record<keyof RegisterForm, string>> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof RegisterForm;
        if (!fe[k]) fe[k] = i.message;
      }
      setErrors(fe);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch<RegisterResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          password: parsed.data.password,
        }),
      });
      setAuth(res.token, res.user);
      toast.success("Account created!");
      router.navigate({ to: "/" });
    } catch (err) {
      let msg = "Registration failed";
      if (err instanceof ApiError) {
        if (err.status === 400) msg = "Invalid request. Please check your inputs.";
        else if (err.status === 401) msg = "Unauthorized.";
        else if (err.status === 409) msg = "An account with this email already exists.";
        else msg = err.message;
      } else if (err instanceof TypeError) {
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
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join ShopCart for fast, secure checkout
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              data-testid="register-name-input"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive" data-testid="register-error-name">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              data-testid="register-email-input"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive" data-testid="register-error-email">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              data-testid="register-password-input"
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-destructive" data-testid="register-error-password">
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              data-testid="register-confirm-input"
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive" data-testid="register-error-confirm">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {apiError && (
            <div
              className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              data-testid="register-api-error"
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
            data-testid="register-submit-btn"
          >
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <SocialAuthButtons mode="register" />

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
            data-testid="go-to-login"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
