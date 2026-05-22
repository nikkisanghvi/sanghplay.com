import { RoleAuthPanel } from "@/components/auth/role-auth-panel";

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-[var(--sp-ink)] sm:text-2xl">Athlete sign in</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--sp-muted)]">
          Pick up where you left off with sessions, confirmations, and chat with booked coaches only.
        </p>
      </div>
      <RoleAuthPanel mode="login" role="student" />
    </div>
  );
}
