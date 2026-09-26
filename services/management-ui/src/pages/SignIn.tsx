import SentinelNavbar from "@/components/SentinelNavbar"

export default function SignIn() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <SentinelNavbar />

            <main className="mx-auto max-w-xl px-6 py-20">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
                    Sentinel account
                </p>

                <h1 className="mt-4 text-4xl font-semibold tracking-tight">
                    Welcome back
                </h1>

                <p className="mt-5 text-neutral-400">
                    Sign in to access your Sentinel account. The Windows scanner
                    remains available to use locally without an account.
                </p>

                <a
                    href="/oauth2/authorization/sentinel"
                    className="mt-8 inline-block rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400"
                >
                    Continue to sign in
                </a>

                <p className="mt-5 text-sm text-neutral-500">
                    Account features are being introduced in stages.
                </p>
            </main>
        </div>
    )
}