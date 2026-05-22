import { RoleAuthPanel } from "@/components/auth/role-auth-panel";

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-[var(--sp-ink)] sm:text-2xl">Coach signup</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--sp-muted)]">
          Pair your certifications with approachable storytelling — onboarding walks you through the profile &
          HQ tools next.
        </p>
      </div>
      <RoleAuthPanel mode="signup" role="coach" />
    </div>
  );
}
