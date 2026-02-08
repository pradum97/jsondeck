import { AuthSecurityPanel } from "@/components/auth/auth-security-panel";

const providers = [
  {
    name: "Google Workspace",
    description: "SSO + multi-factor authentication enforcement.",
    connected: true,
  },
  {
    name: "GitHub Enterprise",
    description: "Repository-scoped access for API collections.",
    connected: true,
  },
  {
    name: "OTP Backup",
    description: "Offline recovery tokens with rotating key vault.",
    connected: false,
  },
  {
    name: "SCIM",
    description: "Provisioning automation for enterprise orgs.",
    connected: false,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.4em] text-teal-300/70">Settings</p>
        <h1 className="text-3xl font-semibold text-white">Identity & access control</h1>
        <p className="text-sm text-slate-300">
          Secure JSONDeck with enterprise-grade authentication, role routing, and provider controls.
        </p>
      </header>
      <AuthSecurityPanel userLabel="alex@jsondeck.dev" roles={["pro", "admin"]} providers={providers} />
    </div>
  );
}
