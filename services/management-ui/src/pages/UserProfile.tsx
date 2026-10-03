import { useEffect, useState, type FormEvent } from "react"

type AccountInfo = {
    userId: string
    displayName: string
    boardDisplayName: string | null
    emailNotificationsEnabled: boolean
}

export default function UserProfile() {
    const [account, setAccount] = useState<AccountInfo | null>(null)
    const [name, setName] = useState("")
    const [csrf, setCsrf] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [needsSignIn, setNeedsSignIn] = useState(false)
    const [message, setMessage] = useState("")

    useEffect(() => {
        const controller = new AbortController()

        async function load() {
            try {
                const response = await fetch("/api/me", {
                    credentials: "same-origin",
                    signal: controller.signal,
                })

                if (response.status === 401 || response.status === 403) {
                    setNeedsSignIn(true)
                    return
                }

                if (!response.ok) throw new Error("Could not load your profile.")

                const data = (await response.json()) as AccountInfo
                setAccount(data)
                setName(data.boardDisplayName ?? "")

                const tokenResponse = await fetch("/api/me/csrf", {
                    credentials: "same-origin",
                    signal: controller.signal,
                })

                if (!tokenResponse.ok) {
                    throw new Error("Could not enable profile editing. Reload to retry.")
                }

                const token = (await tokenResponse.json()) as { token: string }
                setCsrf(token.token)
            } catch (error) {
                if (!controller.signal.aborted) {
                    setMessage(
                        error instanceof Error ? error.message : "Profile unavailable."
                    )
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        }

        void load()
        return () => controller.abort()
    }, [])

    async function saveProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!account || !csrf || saving) return

        setSaving(true)
        setMessage("")

        try {
            const response = await fetch("/api/me/settings", {
                method: "PUT",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrf,
                },
                body: JSON.stringify({
                    boardDisplayName: name.trim(),
                    emailNotificationsEnabled: account.emailNotificationsEnabled,
                }),
            })

            if (!response.ok) {
                const result = (await response.json().catch(() => ({}))) as {
                    error?: string
                }
                throw new Error(result.error ?? "Could not save your profile.")
            }

            const updated = (await response.json()) as AccountInfo
            setAccount(updated)
            setName(updated.boardDisplayName ?? "")
            setMessage("Profile saved.")
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Could not save your profile."
            )
        } finally {
            setSaving(false)
        }
    }

    const communityName = account?.boardDisplayName || "Sentinel member"

    return (
        <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
            <div className="mx-auto max-w-3xl">
                <nav className="mb-6 flex flex-wrap gap-5 text-sm">
                    <a href="/app" className="text-emerald-300">
                        ← Community feed
                    </a>
                    <a href="/app/settings" className="text-neutral-400">
                        Account settings
                    </a>
                </nav>

                <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                    <div className="h-32 bg-gradient-to-r from-emerald-950 via-teal-900 to-neutral-900" />

                    <div className="px-6 pb-8">
                        <div
                            aria-hidden="true"
                            className="-mt-9 flex h-20 w-20 items-center justify-center rounded-full border-4 border-neutral-900 bg-emerald-400 text-3xl font-semibold text-neutral-950"
                        >
                            {communityName.charAt(0).toUpperCase()}
                        </div>

                        <h1 className="!my-4 !text-3xl !text-white">
                            {account ? communityName : "My profile"}
                        </h1>

                        {loading && <p role="status">Loading your profile…</p>}

                        {needsSignIn && (
                            <a href="/sign-in" className="text-emerald-300">
                                Sign in to view your profile
                            </a>
                        )}

                        {account && (
                            <>
                                <p className="text-sm text-neutral-400">
                                    Sentinel community member
                                </p>

                                <form onSubmit={saveProfile} className="mt-8">
                                    <label htmlFor="profile-name" className="block text-sm">
                                        Community display name
                                    </label>

                                    <input
                                        id="profile-name"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        maxLength={80}
                                        placeholder="Choose your community name"
                                        aria-describedby="profile-name-help"
                                        className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-white focus:outline-emerald-400"
                                    />

                                    <p
                                        id="profile-name-help"
                                        className="mt-2 text-xs text-neutral-500"
                                    >
                                        Up to 80 characters. This is a display name, not a unique
                                        username. Leave blank to appear as Sentinel member.
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={!csrf || saving}
                                        className="mt-5 rounded-lg bg-emerald-400 px-5 py-2 font-medium text-neutral-950 disabled:opacity-40"
                                    >
                                        {saving ? "Saving…" : "Save profile"}
                                    </button>
                                </form>
                            </>
                        )}

                        {message && (
                            <p role="status" className="mt-5 text-sm text-emerald-200">
                                {message}
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}