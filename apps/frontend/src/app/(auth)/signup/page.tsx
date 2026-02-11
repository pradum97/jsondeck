import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold text-slate-100">Create account</h1>
      <p className="text-sm text-slate-300">Use your preferred provider on login to sign up instantly.</p>
      <Link href="/login" className="inline-flex w-fit rounded-lg border border-blue-500/70 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-blue-500/30">
        Continue to Login
      </Link>
    </main>
  );
}
