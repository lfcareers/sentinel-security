import Overview from "@/pages/Overview"
import Account from "@/pages/Account"
import SignIn from "@/pages/SignIn"

function App() {
  switch (window.location.pathname.replace(/\/$/, "") || "/") {
    case "/sign-in":
      return <SignIn />
    case "/app":
      return <Account />
    default:
      return <Overview />
  }
}

export default App