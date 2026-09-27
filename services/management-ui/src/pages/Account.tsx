import { useEffect, useState, type FormEvent } from "react"
import SentinelNavbar from "@/components/SentinelNavbar"

type AccountInfo = {
    userId: string
    displayName: string
    boardDisplayName: string | null
    emailNotificationsEnabled: boolean
}

type CsrfInfo = { parameterName: string; token: string }

export default function Account() {
    const [account, setAccount] = useState<AccountInfo | null>(null)
    const [boardName, setBoardName] = useState("")
    const [notifications, setNotifications] = useState(false)
    const [csrf, setCsrf] = useState<CsrfInfo | null>(null)
    const [status, setStatus] = useState("Checking your session…")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function loadAccount() {
            try {
                const response = await fetch("/api/me", {
                    credentials: "same-origin",
                })

                if (response.status === 401 || response.status === 403) {
                    setStatus("Sign in to access your Sentinel account.")
                    return
                }
                if (!response.ok) throw new Error("Account request failed")

                const data = (await response.json()) as AccountInfo
                setAccount(data)
                setBoardName(data.boardDisplayName ?? "")
                setNotifications(data.emailNotificationsEnabled)
                setStatus("")

                const csrfResponse = await fetch("/api/me/csrf", {
                    credentials: "same-origin",
                })
                if (!csrfResponse.ok) throw new Error("CSRF request failed")
                setCsrf((await csrfResponse.json()) as CsrfInfo)
            } catch {
                setStatus("Account service unavailable. Please try again later.")
            }
        }

        void loadAccount()
    }, [])

    async function saveSettings(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!csrf) return

        setSaving(true)
        setStatus("")

        try {
            const response = await fetch("/api/me/settings", {
                method: "PUT",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrf.token,
                },
                body: JSON.stringify({
                    boardDisplayName: boardName,
                    emailNotificationsEnabled: notifications,
                }),
            })

            if (!response.ok) {
                const result = (await response.json().catch(() => ({}))) as {
                    error?: string
                }
                throw new Error(result.error ?? "Could not save settings.")
            }

            const updated = (await response.json()) as AccountInfo
            setAccount(updated)
            setBoardName(updated.boardDisplayName ?? "")
            setStatus("Settings saved.")
        } catch (error) {
            setStatus(
                error instanceof Error ? error.message : "Could not save settings."
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <SentinelNavbar />
            <main className="mx-auto max-w-3xl px-6 py-20">
                <h1 className="text-3xl font-semibold">Your Sentinel account</h1>

                {account ? (
                    <>
                        <p className="mt-5">Signed in as {account.displayName}.</p>
                        <p className="mt-2 text-sm text-neutral-500">
                            Account ID: {account.userId}
                        </p>

                        <form onSubmit={saveSettings} className="mt-10 space-y-5">
                            <div>
                                <label htmlFor="boardName" className="block text-sm">
                                    Board display name
                                </label>
                                <input
                                    id="boardName"
                                    value={boardName}
                                    onChange={(event) => setBoardName(event.target.value)}
                                    maxLength={80}
                                    className="mt-2 w-full rounded-lg border border-neutral-600 bg-neutral-900 px-4 py-2 text-white"
                                />
                            </div>

                            <label className="flex items-center gap-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={notifications}
                                    onChange={(event) =>
                                        setNotifications(event.target.checked)
                                    }
                                />
                                Enable email notifications
                            </label>

                            <button
                                type="submit"
                                disabled={!csrf || saving}
                                className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-neutral-950 disabled:opacity-50"
                            >
                                {saving ? "Saving…" : "Save settings"}
                            </button>
                        </form>

                        {status && <p role="status" className="mt-5">{status}</p>}

                        {csrf && (
                            <form action="/logout" method="post" className="mt-8">
                                <input
                                    type="hidden"
                                    name={csrf.parameterName}
                                    value={csrf.token}
                                />
                                <button
                                    type="submit"
                                    className="rounded-lg border border-neutral-600 px-4 py-2"
                                >
                                    Sign out
                                </button>
                            </form>
                        )}
                    </>
                ) : (
                    <>
                        <p className="mt-5 text-neutral-400">{status}</p>
                        <a
                            href="/oauth2/authorization/sentinel"
                            className="mt-8 inline-block rounded-lg bg-emerald-500 px-4 py-2 font-medium text-neutral-950"
                        >
                            Sign in
                        </a>
                    </>
                )}
            </main>
        </div>
    )
}