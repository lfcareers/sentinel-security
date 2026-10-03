import { useEffect, useState, type FormEvent } from "react"

type Post = {
    postId: string
    title: string
    body: string
    status: string
    createdAt: string
}

export default function CommunityPosts() {
    const [posts, setPosts] = useState<Post[]>([])
    const [csrf, setCsrf] = useState("")
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [loading, setLoading] = useState(true)
    const [publishing, setPublishing] = useState(false)
    const [error, setError] = useState("")
    const [notice, setNotice] = useState("")

    useEffect(() => {
        const controller = new AbortController()

        async function load() {
            try {
                const options = {
                    credentials: "same-origin" as const,
                    signal: controller.signal,
                }

                const [tokenResponse, postsResponse] = await Promise.all([
                    fetch("/api/me/csrf", options),
                    fetch("/api/board/posts/mine", options),
                ])

                if (!tokenResponse.ok || !postsResponse.ok) {
                    throw new Error(
                        "Could not load discussions. Check your session and try reloading."
                    )
                }

                const token = (await tokenResponse.json()) as { token: string }
                const savedPosts = (await postsResponse.json()) as Post[]

                if (!controller.signal.aborted) {
                    setCsrf(token.token)
                    setPosts(savedPosts)
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "Discussions are unavailable."
                    )
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        }

        void load()
        return () => controller.abort()
    }, [])

    async function publish(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!csrf || publishing || !title.trim() || !body.trim()) return

        setPublishing(true)
        setError("")
        setNotice("")

        try {
            const response = await fetch("/api/board/posts", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrf,
                },
                body: JSON.stringify({
                    title: title.trim(),
                    body: body.trim(),
                }),
            })

            if (!response.ok) {
                const result = (await response.json().catch(() => ({}))) as {
                    error?: string
                }

                throw new Error(
                    result.error ?? "Could not submit your post. Your draft is preserved."
                )
            }

            const post = (await response.json()) as Post

            setPosts((previous) => [post, ...previous].slice(0, 20))
            setTitle("")
            setBody("")
            setNotice(
                post.status === "PENDING"
                    ? "Post saved and awaiting approval."
                    : "Post saved."
            )
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Could not submit your post."
            )
        } finally {
            setPublishing(false)
        }
    }

    return (
        <div>
            <form
                onSubmit={publish}
                className="rounded-xl border border-neutral-800 bg-neutral-900 p-5"
            >
                <h2 className="!text-xl !text-white">Start a discussion</h2>

                <label
                    htmlFor="discussion-title"
                    className="mb-2 mt-5 block text-sm text-neutral-300"
                >
                    Title
                </label>

                <input
                    id="discussion-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                    maxLength={160}
                    placeholder="What are you investigating?"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white focus:outline-emerald-400"
                />

                <label
                    htmlFor="discussion-body"
                    className="mb-2 mt-4 block text-sm text-neutral-300"
                >
                    Your post
                </label>

                <textarea
                    id="discussion-body"
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    required
                    maxLength={10000}
                    rows={5}
                    placeholder="Ask a question or share a security lesson…"
                    className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-white focus:outline-emerald-400"
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-neutral-500">
                        Posts require approval. Keep private information out of discussions.
                    </p>

                    <button
                        type="submit"
                        disabled={
                            !csrf || publishing || !title.trim() || !body.trim()
                        }
                        className="rounded-lg bg-emerald-400 px-4 py-2 font-medium text-neutral-950 disabled:opacity-40"
                    >
                        {publishing ? "Submitting…" : "Submit post"}
                    </button>
                </div>
            </form>

            {error && (
                <p
                    role="alert"
                    className="mt-4 rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-200"
                >
                    {error}
                </p>
            )}

            {notice && (
                <p role="status" className="mt-4 text-sm text-emerald-300">
                    {notice}
                </p>
            )}

            <div className="mb-4 mt-7 flex items-center justify-between gap-3">
                <h2 className="!mb-0 !text-xl !text-white">My discussions</h2>
                <span className="text-xs text-neutral-500">Latest 20</span>
            </div>

            {loading && (
                <p role="status" className="text-sm text-neutral-400">
                    Loading discussions…
                </p>
            )}

            {!loading && !error && posts.length === 0 && (
                <p className="rounded-xl border border-neutral-800 p-6 text-sm text-neutral-400">
                    No posts yet. Start your first discussion above.
                </p>
            )}

            <div className="space-y-4">
                {posts.map((post) => (
                    <article
                        key={post.postId}
                        className="rounded-xl border border-neutral-800 bg-neutral-900 p-5"
                    >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <time
                                dateTime={post.createdAt}
                                className="text-xs text-neutral-500"
                            >
                                {new Date(post.createdAt).toLocaleString()}
                            </time>

                            <span className="rounded-full border border-neutral-700 px-2 py-1 text-xs text-emerald-300">
                {post.status === "PENDING"
                    ? "Awaiting approval"
                    : post.status === "PUBLISHED"
                        ? "Published"
                        : post.status === "REMOVED"
                            ? "Removed"
                            : post.status}
              </span>
                        </div>

                        <h3 className="break-words text-lg font-semibold text-white">
                            {post.title}
                        </h3>

                        <p className="mt-3 whitespace-pre-wrap break-words text-sm text-neutral-300">
                            {post.body}
                        </p>
                    </article>
                ))}
            </div>
        </div>
    )
}