"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { RedirectIfAuthenticated } from "../../session/components/redirect-if-authenticated";
import { useSignup } from "../api/use-signup";

export function SignupPage() {
  const router = useRouter();
  const signup = useSignup();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await signup.mutateAsync({ name, email, password });
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
            <h1>Create account</h1>
            <label className="stack">
              Name
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
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
                minLength={8}
                required
              />
            </label>
            {signup.error ? <p className="error">{signup.error.message}</p> : null}
            <Button type="submit" disabled={signup.isPending}>
              Signup
            </Button>
            <p className="muted">
              Already registered? <Link href="/login">Login</Link>
            </p>
          </form>
        </Panel>
      </section>
    </RedirectIfAuthenticated>
  );
}
