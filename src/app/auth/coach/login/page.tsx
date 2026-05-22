import { RoleAuthPanel } from "@/components/auth/role-auth-panel";

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-[var(--sp-ink)] sm:text-2xl">Coach sign in</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--sp-muted)]">
          Manage bookings, nurture athletes, keep your mentorship voice consistent — all from one HQ.
        </p>
      </div>
      <RoleAuthPanel mode="login" role="coach" />
    </div>
  );
}
