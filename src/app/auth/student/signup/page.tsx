import { RoleAuthPanel } from "@/components/auth/role-auth-panel";

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-[var(--sp-ink)] sm:text-2xl">Athlete signup</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--sp-muted)]">
          Book verified coaches who signal trust up front — plus optional mentorship vibes when you dip into our
          Girls Network.
        </p>
      </div>
      <RoleAuthPanel mode="signup" role="student" />
    </div>
  );
}
