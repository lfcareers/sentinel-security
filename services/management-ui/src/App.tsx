import Overview from "@/pages/Overview"
import Account from "@/pages/Account"
import SignIn from "@/pages/SignIn"
import Community from "@/pages/Community"
import UserProfile from "@/pages/UserProfile"

function ComingSoon({ title }: { title: string }) {
  return (
      <main className="min-h-screen bg-neutral-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <a href="/app" className="text-emerald-300">
            ← Back to community
          </a>

          <h1 className="!my-6 !text-3xl !text-white">{title}</h1>

          <p className="text-neutral-400">
            This page is being built for the Sentinel Community Preview.
          </p>
        </div>
      </main>
  )
}

function App() {
  const pathname =
      window.location.pathname.replace(/\/$/, "") || "/"

  switch (pathname) {
    case "/sign-in":
      return <SignIn />

    case "/app":
      return <Community />

    case "/app/settings":
      return <Account />

    case "/app/profile":
      return <UserProfile />

    case "/app/mitre":
      return <ComingSoon title="MITRE ATT&CK library" />

    case "/app/security":
      return <ComingSoon title="Security workspace" />

    default:
      return <Overview />
  }
}

export default App