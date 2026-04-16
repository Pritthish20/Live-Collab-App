"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/session/api/use-current-user";
import { useLogout } from "@/features/auth/session/api/use-logout";

export function Navbar() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const logout = useLogout();

  async function onLogout() {
    try {
      await logout.mutateAsync();
    } finally {
      router.push("/login");
    }
  }

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        CollabPad
      </Link>
      <nav className="nav-links">
        <Link href="/dashboard">Dashboard</Link>
        {currentUser.data ? (
          <>
            <span className="muted">{currentUser.data.name}</span>
            <Button
              type="button"
              variant="secondary"
              onClick={onLogout}
              disabled={logout.isPending}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Signup</Link>
          </>
        )}
      </nav>
    </header>
  );
}
