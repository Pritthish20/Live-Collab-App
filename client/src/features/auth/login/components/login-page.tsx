"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { RedirectIfAuthenticated } from "../../session/components/redirect-if-authenticated";
import { useLogin } from "../api/use-login";

export function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await login.mutateAsync({ email, password });
      router.push("/dashboard");
    } catch {
      // React Query exposes the error state for rendering.
    }
  }

  return (
    <RedirectIfAuthenticated>
      <section className="page">
        <Panel>
          <form className="stack" onSubmit={onSubmit}>
            <h1>Login</h1>
            <label className="stack">
              Email
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
              />
            </label>
            <label className="stack">
              Password
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
              />
            </label>
            {login.error ? <p className="error">{login.error.message}</p> : null}
            <Button type="submit" disabled={login.isPending}>
              Login
            </Button>
            <p className="muted">
              Need an account? <Link href="/signup">Create one</Link>
            </p>
          </form>
        </Panel>
      </section>
    </RedirectIfAuthenticated>
  );
}
