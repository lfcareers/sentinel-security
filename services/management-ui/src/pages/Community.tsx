import { useEffect, useState } from "react"

type AccountInfo = {
    userId: string
    displayName: string
    boardDisplayName: string | null
    emailNotificationsEnabled: boolean
}

const navigation = [
    { label: "Community feed", href: "/app" },
    { label: "My profile", href: "/app/profile" },
    { label: "MITRE ATT&CK", href: "/app/mitre" },
    { label: "Security workspace", href: "/app/security" },
    { label: "Account settings", href: "/app/settings" },
]

export default function Community() {
    const [account, setAccount] = useState<AccountInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [needsSignIn, setNeedsSignIn] = useState(false)
    const [draft, setDraft] = useState("")

    useEffect(() => {
        const controller = new AbortController()

        async function loadAccount() {
            try {
                const response = await fetch("/api/me", {
                    credentials: "same-origin",
                    signal: controller.signal,
                })

                if (response.status === 401 || response.status === 403) {
                    setNeedsSignIn(true)
                    return
                }

                if (!response.ok) {
                    throw new Error("Your account could not be loaded.")
                }

                const data = (await response.json()) as AccountInfo
                setAccount(data)
            } catch (error) {
                if (controller.signal.aborted) return

                setError(
                    error instanceof Error
                        ? error.message
                        : "Sentinel is unavailable. Please try again."
                )
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        void loadAccount()

        return () => controller.abort()
    }, [])

    const communityName =
        account?.boardDisplayName || "Sentinel member"

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100">
            <header className="border-b border-neutral-800 bg-neutral-900">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                    <a href="/app" className="font-semibold text-emerald-400">
                        Sentinel Community
                    </a>

                    <a
                        href="/"
                        className="text-sm text-neutral-400 hover:text-white"
                    >
                        Product overview
                    </a>
                </div>
            </header>

            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[210px_minmax(0,1fr)_260px]">
                <aside>
                    <nav
                        aria-label="Community navigation"
                        className="flex gap-2 overflow-x-auto pb-2 lg:flex-col"
                    >
                        {navigation.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                aria-current={item.href === "/app" ? "page" : undefined}
                                className={`whitespace-nowrap rounded-lg px-4 py-3 text-sm ${
                                    item.href === "/app"
                                        ? "bg-emerald-500/10 text-emerald-300"
                                        : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                                }`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <a
                        href="/#downloads"
                        className="mt-4 inline-block px-4 text-sm text-neutral-400 hover:text-white"
                    >
                        Download Windows scanner ↗
                    </a>
                </aside>

                <main className="min-w-0">
                    <div className="mb-6">
                        <p className="text-xs uppercase tracking-widest text-emerald-400">
                            Community preview
                        </p>

                        <h1 className="!my-3 !text-3xl !font-semibold !text-white">
                            Community feed
                        </h1>

                        <p className="text-sm text-neutral-400">
                            Discuss cybersecurity, share lessons, and build better defenses.
                        </p>
                    </div>

                    {loading && (
                        <div
                            role="status"
                            className="rounded-xl border border-neutral-800 bg-neutral-900 p-6"
                        >
                            Loading your account…
                        </div>
                    )}

                    {needsSignIn && (
                        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
                            <h2 className="!text-xl !text-white">
                                Join the conversation
                            </h2>

                            <p className="mt-3 text-sm text-neutral-400">
                                Sign in to access the Sentinel community.
                            </p>

                            <a
                                href="/sign-in"
                                className="mt-5 inline-block rounded-lg bg-emerald-400 px-4 py-2 font-medium text-neutral-950"
                            >
                                Sign in
                            </a>
                        </section>
                    )}

                    {error && (
                        <p
                            role="alert"
                            className="rounded-xl border border-red-900 bg-red-950/30 p-5 text-red-200"
                        >
                            {error}
                        </p>
                    )}

                    {account && (
                        <>
                            <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                                <div className="mb-5 flex items-center gap-3">
                  <span
                      aria-hidden="true"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 font-semibold text-emerald-300"
                  >
                    {communityName.charAt(0).toUpperCase()}
                  </span>

                                    <div>
                                        <p className="font-medium">{communityName}</p>
                                        <p className="text-xs text-neutral-500">
                                            Share with the community
                                        </p>
                                    </div>
                                </div>

                                <label
                                    htmlFor="community-draft"
                                    className="mb-2 block text-sm text-neutral-300"
                                >
                                    What are you investigating?
                                </label>

                                <textarea
                                    id="community-draft"
                                    value={draft}
                                    onChange={(event) => setDraft(event.target.value)}
                                    maxLength={10000}
                                    rows={5}
                                    placeholder="Ask a question or share a cybersecurity lesson…"
                                    className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-white placeholder:text-neutral-600 focus:outline-emerald-400"
                                />

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-xs text-neutral-500">
                                        Preview only. Drafts are not saved yet.
                                    </p>

                                    <button
                                        type="button"
                                        disabled
                                        className="rounded-lg bg-emerald-400 px-4 py-2 font-medium text-neutral-950 opacity-40"
                                    >
                                        Publish post
                                    </button>
                                </div>
                            </section>

                            <section className="mt-6 rounded-xl border border-neutral-800 p-8 text-center">
                                <h2 className="!text-xl !text-white">
                                    Your community starts here
                                </h2>

                                <p className="mt-3 text-sm text-neutral-400">
                                    Post publishing and the shared discussion feed are next.
                                </p>
                            </section>
                        </>
                    )}
                </main>

                <aside className="space-y-5">
                    <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                        <h2 className="!text-lg !text-white">
                            Explore MITRE ATT&CK
                        </h2>

                        <p className="mt-3 text-sm text-neutral-400">
                            Explore the framework for understanding adversary behavior.
                        </p>

                        <a
                            href="https://attack.mitre.org/"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-block text-sm text-emerald-300 hover:text-emerald-200"
                        >
                            Official framework ↗
                        </a>
                    </section>

                    <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                        <h2 className="!text-lg !text-white">
                            Share responsibly
                        </h2>

                        <p className="mt-3 text-sm text-neutral-400">
                            Keep passwords, personal information, and private device
                            telemetry out of community discussions.
                        </p>
                    </section>
                </aside>
            </div>
        </div>
    )
}