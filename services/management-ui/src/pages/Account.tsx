import { useEffect, useState } from "react"
import SentinelNavbar from "@/components/SentinelNavbar"

type AccountInfo = { subject: string; displayName: string }
type CsrfInfo = { parameterName: string; token: string }

export default function Account() {
    const [account, setAccount] = useState<AccountInfo | null>(null)
    const [status, setStatus] = useState("Checking your session…")
    const [csrf, setCsrf] = useState<CsrfInfo | null>(null)

    useEffect(() => {
        fetch("/api/me", { credentials: "same-origin" })
            .then(async response => {
                if (response.status === 401 || response.status === 403) {
                    setStatus("Sign in to access your Sentinel account.")
                    return
                }

                if (!response.ok) throw new Error("Account service unavailable")

                setAccount(await response.json() as AccountInfo)

                const csrfResponse = await fetch("/api/me/csrf", {
                    credentials: "same-origin"
                })

                if (csrfResponse.ok) {
                    setCsrf(await csrfResponse.json() as CsrfInfo)
                }
            })
            .catch(() => setStatus("Account service unavailable. Please try again later."))
    }, [])

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <SentinelNavbar />
            <main className="mx-auto max-w-3xl px-6 py-20">
                <h1 className="text-3xl font-semibold">Your Sentinel account</h1>

                {account ? (
                    <>
                        <p className="mt-5">Signed in as {account.displayName}.</p>
                        <p className="mt-3 text-neutral-400">
                            Device enrollment and private alerts are coming next.
                        </p>

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