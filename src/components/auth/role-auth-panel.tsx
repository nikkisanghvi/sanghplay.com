"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Btn } from "@/components/button";
import { loadPersistedState } from "@/lib/local-persist";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useShePlays } from "@/providers/sheplays-provider";
import type { UserRole } from "@/lib/types";

function nextPath(role: UserRole, onboardingComplete: boolean) {
  switch (role) {
    case "coach":
      return onboardingComplete ? "/dashboard/coach" : "/onboarding/coach";
    case "parent":
      return "/dashboard/parent";
    case "mentor":
      return "/mentorship";
    default:
      return onboardingComplete ? "/dashboard/student" : "/onboarding/student";
  }
}

export function RoleAuthPanel(props: {
  role: UserRole;
  mode: "login" | "signup";
}) {
  const router = useRouter();
  const { ready, signInDemo, user } = useShePlays();
  const [name, setName] = useState("");
  const [childName, setChildName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user || user.role !== props.role) return;
    router.replace(nextPath(user.role, user.onboardingComplete));
  }, [props.role, ready, router, user]);

  const title =
    props.mode === "signup"
      ? props.role === "coach"
        ? "Create your coach workspace"
        : props.role === "parent"
          ? "Parent / guardian account"
          : props.role === "mentor"
            ? "Join as mentor"
            : "Create your athlete account"
      : props.role === "coach"
        ? "Welcome back, coach"
        : props.role === "parent"
          ? "Parent sign in"
          : "Welcome back";

  async function submit() {
    setError(null);
    setInfo(null);
    setBusy(true);

    try {
      if (!email.trim() || password.length < 6) {
        setError("Use a valid email and a password with at least 6 characters.");
        return;
      }

      const trimmedName = name.trim();

      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        const stored = loadPersistedState().demoUser;

        if (props.mode === "login") {
          const onboarding =
            stored?.email.trim().toLowerCase() === email.trim().toLowerCase()
              ? stored.onboardingComplete
              : true;
          const resolvedName =
            stored?.email.trim().toLowerCase() === email.trim().toLowerCase()
              ? stored.name
              : email.split("@")[0]!;
          const done =
            onboarding ||
            props.role === "parent" ||
            props.role === "mentor";
          signInDemo(email.trim(), resolvedName, props.role, done, {
            childName: stored?.childName,
          });
          router.replace(nextPath(props.role, done));
          return;
        }

        const skipOnboarding = props.role === "parent" || props.role === "mentor";
        signInDemo(
          email.trim(),
          trimmedName || email.split("@")[0]!,
          props.role,
          skipOnboarding,
          props.role === "parent" ? { childName: childName.trim() || "Athlete" } : undefined,
        );

        router.replace(nextPath(props.role, skipOnboarding));
        return;
      }

      if (props.mode === "signup") {
        const { data, error: supErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              role: props.role,
              full_name: trimmedName || email.trim().split("@")[0],
              onboarding_complete: false,
            },
          },
        });

        if (supErr) {
          setError(supErr.message);
          return;
        }

        if (!data.user) {
          setInfo(
            "Check your inbox to confirm email when Supabase email confirmations are enabled.",
          );
          return;
        }

        router.replace(nextPath(props.role, false));
        router.refresh();
        return;
      }

      const { error: supErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (supErr) {
        setError(supErr.message);
        return;
      }

      router.replace("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <p className="text-sm text-[var(--sp-muted)]" role="status">
        Loading workspace…
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--sp-muted)] capitalize">{props.role}</p>
      <h1 className="mt-3 text-balance text-2xl font-semibold text-[var(--sp-ink)]">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--sp-muted)]">
        {props.mode === "signup"
          ? "We’ll personalize onboarding next. Payments and deeper verification layers ship when you graduate from prototype."
          : "Face ID-ready mobile auth can plug in alongside Supabase when you move native."}

      </p>

      <div className="mt-6 flex flex-col gap-3">
        {props.mode === "signup" ? (
          <>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-[var(--sp-ink)]">Your name</span>
              <input
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Taylor"
                className="rounded-2xl border border-black/10 bg-[var(--sp-sand)] px-4 py-3 outline-none ring-[var(--sp-violet)] focus:ring-2"
              />
            </label>
            {props.role === "parent" ? (
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-[var(--sp-ink)]">Athlete&apos;s name</span>
                <input
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Priya"
                  className="rounded-2xl border border-black/10 bg-[var(--sp-sand)] px-4 py-3 outline-none ring-[var(--sp-violet)] focus:ring-2"
                />
              </label>
            ) : null}
          </>
        ) : null}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-[var(--sp-ink)]">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="family@sheplays.app"
            className="rounded-2xl border border-black/10 bg-[var(--sp-sand)] px-4 py-3 text-[var(--sp-ink)] outline-none ring-[var(--sp-teal)] focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-[var(--sp-ink)]">Password</span>
          <input
            type="password"
            autoComplete={props.mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="rounded-2xl border border-black/10 bg-[var(--sp-sand)] px-4 py-3 text-[var(--sp-ink)] outline-none ring-[var(--sp-teal)] focus:ring-2"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      ) : null}
      {info ? (
        <p className="mt-4 rounded-2xl bg-teal-50 px-3 py-2 text-sm text-teal-900">{info}</p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        <Btn className="w-full" disabled={busy} variant="primary" onClick={() => void submit()}>
          {busy
            ? "Working…"
            : props.mode === "signup"
              ? "Continue"
              : "Sign in"}
        </Btn>
        <Btn
          variant="ghost"
          className="w-full justify-center underline-offset-4 hover:underline"
          type="button"
          onClick={() => {
            router.push(
              props.mode === "signup"
                ? props.role === "coach"
                  ? "/auth/coach/login"
                  : "/auth/student/login"
                : props.role === "coach"
                  ? "/auth/coach/signup"
                  : "/auth/student/signup",
            );
          }}
        >
          {props.mode === "signup"
            ? "Already have access? Switch to login"
            : "New here? Create an account"}

        </Btn>
      </div>

      <div className="mt-8 space-y-2 text-sm text-[var(--sp-muted)]">
        {props.role === "student" ? (
          <p>
            Coach instead? {" "}

            <Link className="text-[var(--sp-teal)] underline-offset-4 hover:underline" href="/auth/coach/signup">

              Jump to coach signup →

            </Link>
          </p>
        ) : (
          <p>
            Parent booking for an athlete? {" "}

            <Link className="text-[var(--sp-teal)] underline-offset-4 hover:underline" href="/auth/student/signup">

              Start athlete signup →

            </Link>
          </p>
        )}

      </div>
    </div>
  );
}
